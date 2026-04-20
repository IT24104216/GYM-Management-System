import { z } from 'zod';

const idSchema = z
  .union([
    z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    z.coerce.number({ required_error: 'is required' }).int().nonnegative(),
  ])
  .transform((value) => String(value));

const optionalText = (max) =>
  z.string().trim().max(max).optional().default('');

export const feedbackIdParamsSchema = z.object({
  id: idSchema,
});

export const feedbackQuerySchema = z.object({
  subjectType: z.enum(['coach', 'dietitian']).optional(),
  subjectId: z.string().trim().min(1).optional(),
  ownerId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(20),
});

export const createFeedbackSchema = z.object({
  ownerId: idSchema,
  ownerName: optionalText(120),
  subjectType: z.enum(['coach', 'dietitian']),
  subjectId: idSchema,
  subjectName: optionalText(120),
  bookingId: optionalText(120),
  rating: z.coerce.number().min(1).max(5),
  comment: optionalText(2000),
});

export const updateFeedbackSchema = z.object({
  ownerId: idSchema,
  rating: z.coerce.number().min(1).max(5).optional(),
  comment: z.string().trim().max(2000).optional(),
}).refine(
  (value) => value.rating !== undefined || value.comment !== undefined,
  { message: 'At least one field (rating/comment) must be provided' },
);

export const deleteFeedbackSchema = z.object({
  ownerId: idSchema,
});
