import { Appointment } from './appointments.model.js';
import { createNotification } from '../notifications/notifications.service.js';

const PRIORITY_RANK = {
  urgent: 0,
  normal: 1,
  low: 2,
};

const HOUR_MS = 60 * 60 * 1000;

function normalizePriority(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'urgent' || normalized === 'low') return normalized;
  return 'normal';
}

function asDate(value, fallback = null) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date;
}

function isSnoozed(item, now = new Date()) {
  const snoozedUntil = asDate(item?.snoozedUntil);
  return Boolean(snoozedUntil && snoozedUntil.getTime() > now.getTime());
}

export function calculateSlaDeadline(priority, queueEnteredAt) {
  const enteredAt = asDate(queueEnteredAt, new Date());
  const normalized = normalizePriority(priority);
  const hours = normalized === 'urgent' ? 12 : normalized === 'low' ? 168 : 48;
  return new Date(enteredAt.getTime() + (hours * HOUR_MS));
}

export async function assignQueuePosition(coachId) {
  const coach = String(coachId || '').trim();
  if (!coach) return [];

  const now = new Date();
  const pendingItems = await Appointment.find({
    coachId: coach,
    status: 'pending',
  });

  const activeItems = [];
  const resetOps = [];

  pendingItems.forEach((item) => {
    if (isSnoozed(item, now)) {
      if (item.queuePosition !== null) {
        resetOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { queuePosition: null } },
          },
        });
      }
      return;
    }
    activeItems.push(item);
  });

  activeItems.sort((a, b) => {
    const priorityDiff = PRIORITY_RANK[normalizePriority(a.priority)] - PRIORITY_RANK[normalizePriority(b.priority)];
    if (priorityDiff !== 0) return priorityDiff;
    const aEntered = asDate(a.queueEnteredAt, asDate(a.createdAt, new Date(0)));
    const bEntered = asDate(b.queueEnteredAt, asDate(b.createdAt, new Date(0)));
    return aEntered - bEntered;
  });

  const positionOps = activeItems.map((item, index) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { queuePosition: index + 1 } },
    },
  }));

  const allOps = [...resetOps, ...positionOps];
  if (allOps.length) {
    await Appointment.bulkWrite(allOps);
  }

  return Appointment.find({
    coachId: coach,
    status: 'pending',
    $or: [
      { snoozedUntil: null },
      { snoozedUntil: { $lte: now } },
    ],
  }).sort({ queuePosition: 1, queueEnteredAt: 1, createdAt: 1 });
}

function getEscalationTarget(item, now) {
  const priority = normalizePriority(item.priority);
  const queueEnteredAt = asDate(item.queueEnteredAt, asDate(item.createdAt, now));
  const ageMs = now.getTime() - queueEnteredAt.getTime();

  if (priority === 'low' && ageMs >= 48 * HOUR_MS) {
    return { nextPriority: 'normal', reason: 'Auto-escalated after 48h in low priority queue' };
  }
  if (priority === 'normal' && ageMs >= 24 * HOUR_MS) {
    return { nextPriority: 'urgent', reason: 'Auto-escalated after 24h in normal priority queue' };
  }
  return null;
}

let queueWorkerStarted = false;

export async function runEscalationCheck(coachId) {
  const coach = String(coachId || '').trim();
  if (!coach) return 0;

  const now = new Date();
  const pendingItems = await Appointment.find({ coachId: coach, status: 'pending' });

  let escalatedCount = 0;

  for (const item of pendingItems) {
    if (isSnoozed(item, now)) {
      continue;
    }

    const escalationTarget = getEscalationTarget(item, now);
    if (escalationTarget) {
      const fromPriority = normalizePriority(item.priority);
      item.priority = escalationTarget.nextPriority;
      item.lastEscalatedAt = now;
      item.slaDeadline = calculateSlaDeadline(escalationTarget.nextPriority, item.queueEnteredAt || item.createdAt || now);
      item.slaBreached = false;
      item.escalationHistory = Array.isArray(item.escalationHistory) ? item.escalationHistory : [];
      item.escalationHistory.push({
        fromPriority,
        toPriority: escalationTarget.nextPriority,
        escalatedAt: now,
        reason: escalationTarget.reason,
      });
      await item.save();
      escalatedCount += 1;
      continue;
    }

    if (normalizePriority(item.priority) === 'urgent') {
      const deadline = asDate(item.slaDeadline, calculateSlaDeadline('urgent', item.queueEnteredAt || item.createdAt || now));
      if (deadline.getTime() <= now.getTime() && !item.slaBreached) {
        item.slaBreached = true;
        await item.save();
        await Promise.allSettled([
          createNotification({
            recipientId: String(item.coachId || ''),
            recipientRole: 'coach',
            type: 'booking',
            title: 'SLA Breach Alert',
            message: 'An urgent appointment has breached its SLA deadline.',
            entityType: 'appointment',
            entityId: String(item._id),
          }),
        ]);
      }
    }
  }

  await assignQueuePosition(coach);
  return escalatedCount;
}

export async function processSnooze(appointmentId, snoozeMinutes) {
  const mins = Number(snoozeMinutes || 0);
  if (!Number.isFinite(mins) || mins <= 0) {
    throw new Error('Invalid snooze duration');
  }

  const item = await Appointment.findById(appointmentId);
  if (!item) return null;

  const now = new Date();
  item.snoozedUntil = new Date(now.getTime() + mins * 60 * 1000);
  await item.save();
  return item;
}

async function runGlobalEscalationPass() {
  const coachIds = await Appointment.distinct('coachId', {
    status: 'pending',
    coachId: { $exists: true, $nin: [null, ''] },
  });

  await Promise.allSettled(
    coachIds.map((coachId) => runEscalationCheck(String(coachId))),
  );
}

export function ensureQueueWorkerStarted() {
  if (queueWorkerStarted) return;
  queueWorkerStarted = true;

  const intervalMs = Number(process.env.QUEUE_ESCALATION_INTERVAL_MS || 5 * 60 * 1000);
  setInterval(() => {
    void runGlobalEscalationPass();
  }, intervalMs);
}
