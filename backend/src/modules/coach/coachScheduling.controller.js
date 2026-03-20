import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../users/users.model.js';
import { CoachScheduling } from './coachScheduling.model.js';
import {
  coachIdParamsSchema,
  createCoachSlotSchema,
  slotIdParamsSchema,
  updateCoachSlotSchema,
} from './coachScheduling.validation.js';

const parseOrThrow = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(
      'Validation failed',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      result.error.flatten(),
    );
  }
  return result.data;
};

const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
};

const ensureTimeRange = (startTime, endTime) => {
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new AppError('End time must be after start time', HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
};

const toLocalIsoDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ensureNotPastSlot = (date, startTime) => {
  const todayIso = toLocalIsoDate(new Date());
  if (date < todayIso) {
    throw new AppError(
      'Please choose today or a future date.',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  if (date === todayIso) {
    const now = new Date();
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    if (timeToMinutes(startTime) <= nowMinutes) {
      throw new AppError(
        'Selected start time has already passed. Please choose a future time.',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }
  }
};

const ensureCoachExists = async (coachId) => {
  const coachUser = await User.findOne({ _id: coachId, role: 'coach' });
  if (!coachUser) {
    throw new AppError('Coach not found', HTTP_STATUS.NOT_FOUND);
  }
};

const hasOverlap = async ({
  coachId,
  date,
  startTime,
  endTime,
  excludeId,
}) => {
  const filter = {
    coachId,
    date,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };

  const sameDaySlots = await CoachScheduling.find(filter).select('startTime endTime');

  const candidateStart = timeToMinutes(startTime);
  const candidateEnd = timeToMinutes(endTime);

  return sameDaySlots.some((slot) => {
    const currentStart = timeToMinutes(slot.startTime);
    const currentEnd = timeToMinutes(slot.endTime);
    return candidateStart < currentEnd && currentStart < candidateEnd;
  });
};

export const listCoachSlots = asyncHandler(async (req, res) => {
  const { coachId } = parseOrThrow(coachIdParamsSchema, req.params);
  await ensureCoachExists(coachId);

  const slots = await CoachScheduling.find({ coachId }).sort({ date: 1, startTime: 1 });

  res.status(HTTP_STATUS.OK).json({
    data: slots,
  });
});

export const createCoachSlot = asyncHandler(async (req, res) => {
  const { coachId } = parseOrThrow(coachIdParamsSchema, req.params);
  await ensureCoachExists(coachId);

  const payload = parseOrThrow(createCoachSlotSchema, req.body || {});
  ensureNotPastSlot(payload.date, payload.startTime);
  ensureTimeRange(payload.startTime, payload.endTime);

  const overlap = await hasOverlap({
    coachId,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
  });

  if (overlap) {
    throw new AppError('Time slot overlaps with an existing slot', HTTP_STATUS.CONFLICT);
  }

  const created = await CoachScheduling.create({
    coachId,
    ...payload,
  });

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Time slot created successfully',
    data: created,
  });
});

export const updateCoachSlot = asyncHandler(async (req, res) => {
  const { coachId, slotId } = parseOrThrow(slotIdParamsSchema, req.params);
  await ensureCoachExists(coachId);

  const payload = parseOrThrow(updateCoachSlotSchema, req.body || {});

  const slot = await CoachScheduling.findOne({ _id: slotId, coachId });
  if (!slot) {
    throw new AppError('Time slot not found', HTTP_STATUS.NOT_FOUND);
  }

  const nextDate = payload.date ?? slot.date;
  const nextStart = payload.startTime ?? slot.startTime;
  const nextEnd = payload.endTime ?? slot.endTime;

  ensureNotPastSlot(nextDate, nextStart);
  ensureTimeRange(nextStart, nextEnd);

  const overlap = await hasOverlap({
    coachId,
    date: nextDate,
    startTime: nextStart,
    endTime: nextEnd,
    excludeId: slotId,
  });

  if (overlap) {
    throw new AppError('Time slot overlaps with an existing slot', HTTP_STATUS.CONFLICT);
  }

  slot.date = nextDate;
  slot.startTime = nextStart;
  slot.endTime = nextEnd;
  if (payload.sessionType) slot.sessionType = payload.sessionType;
  if (typeof payload.notes === 'string') slot.notes = payload.notes;

  await slot.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Time slot updated successfully',
    data: slot,
  });
});

export const deleteCoachSlot = asyncHandler(async (req, res) => {
  const { coachId, slotId } = parseOrThrow(slotIdParamsSchema, req.params);
  await ensureCoachExists(coachId);

  const deleted = await CoachScheduling.findOneAndDelete({ _id: slotId, coachId });
  if (!deleted) {
    throw new AppError('Time slot not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Time slot deleted successfully',
  });
});

