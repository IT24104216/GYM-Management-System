import { z } from 'zod';

const idSchema = z
  .union([
    z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    z.coerce.number({ required_error: 'is required' }).int().nonnegative(),
  ])
  .transform((value) => String(value));

const dateSchema = z.coerce.date({
  invalid_type_error: 'must be a valid date',
});

export const createAppointmentSchema = z
  .object({
    userId: idSchema,
    coachId: idSchema,
    startsAt: dateSchema,
    endsAt: dateSchema,
    sessionType: z
      .enum(['consultation', 'training', 'assessment', 'nutrition', 'other'])
      .optional()
      .default('consultation'),
    notes: z.string().trim().max(1000).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'must be later than startsAt',
      });
    }
  });

export const appointmentQuerySchema = z.object({
  coachId: idSchema.optional(),
  userId: idSchema.optional(),
  status: z
    .enum(['pending', 'approved', 'rejected', 'cancelled', 'completed'])
    .optional(),
  sessionType: z
    .enum(['consultation', 'training', 'assessment', 'nutrition', 'other'])
    .optional(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const appointmentIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled', 'completed']),
  notes: z.string().trim().max(1000).optional(),
});

export const updateAppointmentSchema = z
  .object({
    startsAt: dateSchema,
    endsAt: dateSchema,
    sessionType: z
      .enum(['consultation', 'training', 'assessment', 'nutrition', 'other'])
      .optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'must be later than startsAt',
      });
    }
  });
