import { z } from 'zod';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../users/users.model.js';
import { CoachProfile } from './coachProfile.model.js';

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SLASH_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

const isValidDateInput = (value) => {
  if (!value) return true;

  if (ISO_DATE_REGEX.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
  }

  if (SLASH_DATE_REGEX.test(value)) {
    const [mmRaw, ddRaw, yyyyRaw] = value.split('/').map(Number);
    if (!mmRaw || !ddRaw || !yyyyRaw) return false;
    const parsed = new Date(Date.UTC(yyyyRaw, mmRaw - 1, ddRaw));
    return (
      parsed.getUTCFullYear() === yyyyRaw
      && parsed.getUTCMonth() === mmRaw - 1
      && parsed.getUTCDate() === ddRaw
    );
  }

  return false;
};

const profileSchema = z.object({
  specialization: z.string().trim().max(120).optional(),
  experienceYears: z.coerce.number().min(0).max(80).optional(),
  certifications: z.string().trim().max(300).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) => !value || PHONE_REGEX.test(value),
      { message: 'Invalid phone format. Use digits with optional leading +.' },
    )
    .optional(),
  preferredTrainingType: z.string().trim().max(120).optional(),
  coachingStyle: z.string().trim().max(500).optional(),
  joinedDate: z
    .string()
    .trim()
    .max(40)
    .refine(
      (value) => isValidDateInput(value),
      { message: 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY.' },
    )
    .optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  slots: z.string().trim().max(120).optional(),
});

const parsePayload = (schema, payload) => {
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

const toAvatar = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'C';

const toTags = (preferredTrainingType = '', specialization = '') => {
  const base = preferredTrainingType || specialization;
  if (!base) return ['General'];
  return base
    .split(/[\/,]/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const toProfileDto = (userDoc, profileDoc) => ({
  id: String(userDoc._id),
  name: userDoc.name,
  email: userDoc.email,
  avatar: toAvatar(userDoc.name),
  specialty: profileDoc.specialization || 'General Fitness',
  experience: `${profileDoc.experienceYears || 0} years`,
  rating: Number(profileDoc.rating || 4.8),
  slots: profileDoc.slots || 'Mon - Fri, 6:00 AM - 10:00 AM',
  qualification: profileDoc.preferredTrainingType || 'Certified Fitness Coach',
  certificates: profileDoc.certifications || '-',
  tags: toTags(profileDoc.preferredTrainingType, profileDoc.specialization),
  profile: {
    specialization: profileDoc.specialization || '',
    experienceYears: String(profileDoc.experienceYears ?? ''),
    certifications: profileDoc.certifications || '',
    phone: profileDoc.phone || '',
    preferredTrainingType: profileDoc.preferredTrainingType || '',
    coachingStyle: profileDoc.coachingStyle || '',
    joinedDate: profileDoc.joinedDate || '',
    slots: profileDoc.slots || '',
    rating: Number(profileDoc.rating || 4.8),
  },
});

export const getcoachStatus = (_req, res) => {
  res.json({
    module: 'coach',
    status: 'ready',
  });
};

export const getCoachProfile = asyncHandler(async (req, res) => {
  const coachId = String(req.params.coachId || '').trim();
  if (!coachId) {
    throw new AppError('Coach id is required', HTTP_STATUS.BAD_REQUEST);
  }

  const [coachUser, profile] = await Promise.all([
    User.findOne({ _id: coachId, role: 'coach' }),
    CoachProfile.findOne({ coachId }),
  ]);

  if (!coachUser) {
    throw new AppError('Coach not found', HTTP_STATUS.NOT_FOUND);
  }

  if (!profile) {
    return res.status(HTTP_STATUS.OK).json({
      data: null,
    });
  }

  res.status(HTTP_STATUS.OK).json({
    data: toProfileDto(coachUser, profile),
  });
});

export const upsertCoachProfile = asyncHandler(async (req, res) => {
  const coachId = String(req.params.coachId || '').trim();
  if (!coachId) {
    throw new AppError('Coach id is required', HTTP_STATUS.BAD_REQUEST);
  }

  const coachUser = await User.findOne({ _id: coachId, role: 'coach' });
  if (!coachUser) {
    throw new AppError('Coach not found', HTTP_STATUS.NOT_FOUND);
  }

  const payload = parsePayload(profileSchema, req.body || {});
  const update = {
    ...payload,
    coachId,
  };

  const profile = await CoachProfile.findOneAndUpdate(
    { coachId },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(HTTP_STATUS.OK).json({
    message: 'Coach profile saved successfully',
    data: toProfileDto(coachUser, profile),
  });
});

export const deleteCoachProfile = asyncHandler(async (req, res) => {
  const coachId = String(req.params.coachId || '').trim();
  if (!coachId) {
    throw new AppError('Coach id is required', HTTP_STATUS.BAD_REQUEST);
  }

  await CoachProfile.findOneAndDelete({ coachId });

  res.status(HTTP_STATUS.OK).json({
    message: 'Coach profile deleted successfully',
  });
});

export const getPublicCoaches = asyncHandler(async (_req, res) => {
  const [coachUsers, profiles] = await Promise.all([
    User.find({ role: 'coach', status: 'active' }).sort({ createdAt: -1 }),
    CoachProfile.find({}).sort({ updatedAt: -1 }),
  ]);

  const profileByCoachId = new Map(
    profiles.map((profile) => [String(profile.coachId), profile]),
  );

  const coaches = coachUsers
    .map((coachUser) => {
      const profile = profileByCoachId.get(String(coachUser._id));
      if (!profile) return null;
      return toProfileDto(coachUser, profile);
    })
    .filter(Boolean);

  res.status(HTTP_STATUS.OK).json({
    data: coaches,
  });
});
