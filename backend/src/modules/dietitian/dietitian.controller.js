import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../users/users.model.js';
import {
  createNotification,
  createNotificationForAdmins,
} from '../notifications/notifications.service.js';
import { DietitianProfile } from './dietitianProfile.model.js';
import { DietitianScheduling } from './dietitianScheduling.model.js';
import {
  createDietitianSlotSchema,
  dietitianIdParamsSchema,
  dietitianProfileSchema,
  dietitianSlotIdParamsSchema,
  updateDietitianSlotSchema,
} from './dietitian.validation.js';

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

const ensureDietitianExists = async (dietitianId) => {
  const dietitianUser = await User.findOne({ _id: dietitianId, role: 'dietitian' });
  if (!dietitianUser) {
    throw new AppError('Dietitian not found', HTTP_STATUS.NOT_FOUND);
  }
  return dietitianUser;
};

const toAvatar = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'D';

const toTags = (specialization = '') => {
  if (!specialization) return ['General Nutrition'];
  return specialization
    .split(/[/,]/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const toLocalIsoDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeTo12h = (time24h = '') => {
  const [hoursRaw, minutesRaw] = time24h.split(':').map(Number);
  if (Number.isNaN(hoursRaw) || Number.isNaN(minutesRaw)) return time24h;
  const meridiem = hoursRaw >= 12 ? 'PM' : 'AM';
  const hours12 = hoursRaw % 12 || 12;
  return `${String(hours12).padStart(2, '0')}:${String(minutesRaw).padStart(2, '0')} ${meridiem}`;
};

const toDateLabel = (slotDate, todayIso) => {
  if (slotDate === todayIso) return 'Today';
  const date = new Date(`${slotDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return slotDate;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const buildAvailabilityMap = (slots = []) => {
  const perDietitian = new Map();
  slots.forEach((slot) => {
    const dietitianId = String(slot.dietitianId);
    if (!perDietitian.has(dietitianId)) perDietitian.set(dietitianId, new Map());
    const byDate = perDietitian.get(dietitianId);
    if (!byDate.has(slot.date)) byDate.set(slot.date, []);
    byDate.get(slot.date).push({
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  });
  return perDietitian;
};

const toProfileDto = (userDoc, profileDoc, availability = {}) => ({
  id: String(userDoc._id),
  name: userDoc.name,
  email: userDoc.email,
  avatar: toAvatar(userDoc.name),
  specialty: profileDoc.specialization || 'General Nutrition',
  experience: `${profileDoc.experienceYears || 0} years`,
  rating: Number(profileDoc.rating || 4.8),
  slots: availability.slotsLabel || profileDoc.slots || 'No upcoming slots',
  slotDate: availability.slotDate || '',
  slotRanges: availability.slotRanges || [],
  qualification: profileDoc.qualifications || 'Certified Dietitian',
  certificates: profileDoc.licenseNumber || '-',
  tags: toTags(profileDoc.specialization),
  profile: {
    qualifications: profileDoc.qualifications || '',
    specialization: profileDoc.specialization || '',
    experienceYears: String(profileDoc.experienceYears ?? ''),
    licenseNumber: profileDoc.licenseNumber || '',
    phone: profileDoc.phone || '',
    joinDate: profileDoc.joinDate || '',
    rating: Number(profileDoc.rating || 4.8),
    slots: profileDoc.slots || '',
  },
});

const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
};

const ensureTimeRange = (startTime, endTime) => {
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new AppError('End time must be after start time', HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
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

const hasOverlap = async ({
  dietitianId,
  date,
  startTime,
  endTime,
  excludeId,
}) => {
  const filter = {
    dietitianId,
    date,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };

  const sameDaySlots = await DietitianScheduling.find(filter).select('startTime endTime');

  const candidateStart = timeToMinutes(startTime);
  const candidateEnd = timeToMinutes(endTime);

  return sameDaySlots.some((slot) => {
    const currentStart = timeToMinutes(slot.startTime);
    const currentEnd = timeToMinutes(slot.endTime);
    return candidateStart < currentEnd && currentStart < candidateEnd;
  });
};

export const getdietitianStatus = (_req, res) => {
  res.json({
    module: 'dietitian',
    status: 'ready',
  });
};

export const getDietitianProfile = asyncHandler(async (req, res) => {
  const { dietitianId } = parseOrThrow(dietitianIdParamsSchema, req.params);

  const [dietitianUser, profile] = await Promise.all([
    ensureDietitianExists(dietitianId),
    DietitianProfile.findOne({ dietitianId }),
  ]);

  if (!profile) {
    return res.status(HTTP_STATUS.OK).json({ data: null });
  }

  res.status(HTTP_STATUS.OK).json({
    data: toProfileDto(dietitianUser, profile),
  });
});

export const upsertDietitianProfile = asyncHandler(async (req, res) => {
  const { dietitianId } = parseOrThrow(dietitianIdParamsSchema, req.params);
  const dietitianUser = await ensureDietitianExists(dietitianId);

  const payload = parseOrThrow(dietitianProfileSchema, req.body || {});

  const profile = await DietitianProfile.findOneAndUpdate(
    { dietitianId },
    { $set: { ...payload, dietitianId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await Promise.allSettled([
    createNotification({
      recipientId: dietitianId,
      recipientRole: 'dietitian',
      type: 'profile',
      title: 'Profile Updated',
      message: 'Your dietitian profile was updated successfully.',
      entityType: 'dietitian-profile',
      entityId: String(profile?._id || ''),
    }),
    createNotificationForAdmins({
      title: 'Dietitian Profile Updated',
      message: `${dietitianUser.name} updated dietitian profile details.`,
      entityType: 'dietitian-profile',
      entityId: String(profile?._id || ''),
    }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    message: 'Dietitian profile saved successfully',
    data: toProfileDto(dietitianUser, profile),
  });
});

export const deleteDietitianProfile = asyncHandler(async (req, res) => {
  const { dietitianId } = parseOrThrow(dietitianIdParamsSchema, req.params);
  await DietitianProfile.findOneAndDelete({ dietitianId });

  await Promise.allSettled([
    createNotification({
      recipientId: dietitianId,
      recipientRole: 'dietitian',
      type: 'profile',
      title: 'Profile Deleted',
      message: 'Your dietitian profile was deleted.',
      entityType: 'dietitian-profile',
      entityId: dietitianId,
    }),
    createNotificationForAdmins({
      title: 'Dietitian Profile Deleted',
      message: `A dietitian profile was deleted for dietitian id ${dietitianId}.`,
      entityType: 'dietitian-profile',
      entityId: dietitianId,
    }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    message: 'Dietitian profile deleted successfully',
  });
});

export const getPublicDietitians = asyncHandler(async (_req, res) => {
  const todayIso = toLocalIsoDate(new Date());
  const [dietitianUsers, profiles] = await Promise.all([
    User.find({ role: 'dietitian', status: 'active' }).sort({ createdAt: -1 }),
    DietitianProfile.find({}).sort({ updatedAt: -1 }),
  ]);

  const dietitianIds = dietitianUsers.map((item) => String(item._id));
  const scheduleSlots = await DietitianScheduling.find({
    dietitianId: { $in: dietitianIds },
    date: { $gte: todayIso },
  }).sort({ date: 1, startTime: 1 });

  const profileByDietitianId = new Map(
    profiles.map((profile) => [String(profile.dietitianId), profile]),
  );
  const availabilityByDietitianId = buildAvailabilityMap(scheduleSlots);

  const dietitians = dietitianUsers
    .map((dietitianUser) => {
      const profile = profileByDietitianId.get(String(dietitianUser._id));
      if (!profile) return null;

      const dietitianAvailability = availabilityByDietitianId.get(String(dietitianUser._id));
      let availability = {};

      if (dietitianAvailability && dietitianAvailability.size > 0) {
        const firstDate = Array.from(dietitianAvailability.keys()).sort()[0];
        const slotRanges = (dietitianAvailability.get(firstDate) || []).sort(
          (a, b) => a.startTime.localeCompare(b.startTime),
        );
        const firstRange = slotRanges[0];
        const moreCount = Math.max(slotRanges.length - 1, 0);
        const dateLabel = toDateLabel(firstDate, todayIso);
        const timeLabel = firstRange
          ? `${formatTimeTo12h(firstRange.startTime)} - ${formatTimeTo12h(firstRange.endTime)}`
          : '';

        availability = {
          slotDate: firstDate,
          slotRanges,
          slotsLabel: `${dateLabel}, ${timeLabel}${moreCount ? ` (+${moreCount} more)` : ''}`,
        };
      }

      return toProfileDto(dietitianUser, profile, availability);
    })
    .filter(Boolean);

  res.status(HTTP_STATUS.OK).json({
    data: dietitians,
  });
});

export const listDietitianSlots = asyncHandler(async (req, res) => {
  const { dietitianId } = parseOrThrow(dietitianIdParamsSchema, req.params);
  await ensureDietitianExists(dietitianId);

  const slots = await DietitianScheduling.find({ dietitianId }).sort({ date: 1, startTime: 1 });

  res.status(HTTP_STATUS.OK).json({
    data: slots,
  });
});

export const createDietitianSlot = asyncHandler(async (req, res) => {
  const { dietitianId } = parseOrThrow(dietitianIdParamsSchema, req.params);
  await ensureDietitianExists(dietitianId);

  const payload = parseOrThrow(createDietitianSlotSchema, req.body || {});
  ensureNotPastSlot(payload.date, payload.startTime);
  ensureTimeRange(payload.startTime, payload.endTime);

  const overlap = await hasOverlap({
    dietitianId,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
  });
  if (overlap) {
    throw new AppError('Time slot overlaps with an existing slot', HTTP_STATUS.CONFLICT);
  }

  const created = await DietitianScheduling.create({
    dietitianId,
    ...payload,
  });

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Time slot created successfully',
    data: created,
  });
});

export const updateDietitianSlot = asyncHandler(async (req, res) => {
  const { dietitianId, slotId } = parseOrThrow(dietitianSlotIdParamsSchema, req.params);
  await ensureDietitianExists(dietitianId);
  const payload = parseOrThrow(updateDietitianSlotSchema, req.body || {});

  const slot = await DietitianScheduling.findOne({ _id: slotId, dietitianId });
  if (!slot) {
    throw new AppError('Time slot not found', HTTP_STATUS.NOT_FOUND);
  }

  const nextDate = payload.date ?? slot.date;
  const nextStart = payload.startTime ?? slot.startTime;
  const nextEnd = payload.endTime ?? slot.endTime;
  ensureNotPastSlot(nextDate, nextStart);
  ensureTimeRange(nextStart, nextEnd);

  const overlap = await hasOverlap({
    dietitianId,
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
  if (typeof payload.notes === 'string') slot.notes = payload.notes;
  await slot.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Time slot updated successfully',
    data: slot,
  });
});

export const deleteDietitianSlot = asyncHandler(async (req, res) => {
  const { dietitianId, slotId } = parseOrThrow(dietitianSlotIdParamsSchema, req.params);
  await ensureDietitianExists(dietitianId);

  const deleted = await DietitianScheduling.findOneAndDelete({ _id: slotId, dietitianId });
  if (!deleted) {
    throw new AppError('Time slot not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Time slot deleted successfully',
  });
});
