import { z } from 'zod';

const idSchema = z
  .union([
    z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    z.coerce.number({ required_error: 'is required' }).int().nonnegative(),
  ])
  .transform((value) => String(value));

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

const positiveNumberField = z.coerce.number().positive();

export const progressUserParamsSchema = z.object({
  userId: idSchema,
});

export const upsertMeasurementSchema = z.object({
  date: isoDateSchema,
  chest: positiveNumberField,
  waist: positiveNumberField,
  arms: positiveNumberField,
  thighs: positiveNumberField,
  bodyFat: positiveNumberField,
  weight: positiveNumberField,
});

