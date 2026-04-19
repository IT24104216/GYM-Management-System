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
const appointmentPrioritySchema = z.enum(['urgent', 'normal', 'low']);

export const createAppointmentSchema = z
  .object({
    userId: idSchema,
    coachId: idSchema.optional(),
    dietitianId: idSchema.optional(),
    startsAt: dateSchema,
    endsAt: dateSchema,
    sessionType: z
      .enum(['consultation', 'training', 'assessment', 'nutrition', 'other'])
      .optional()
      .default('consultation'),
    priority: appointmentPrioritySchema.optional().default('normal'),
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

    if (data.sessionType === 'nutrition' && !data.dietitianId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dietitianId'],
        message: 'is required for nutrition appointments',
      });
    }

    if (data.sessionType !== 'nutrition' && !data.coachId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coachId'],
        message: 'is required for coach appointments',
      });
    }
  });

export const appointmentQuerySchema = z.object({
  coachId: idSchema.optional(),
  dietitianId: idSchema.optional(),
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
  limit: z.coerce.number().int().min(1).max(1000).optional().default(20),
});

export const appointmentIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled', 'completed']).optional(),
  priority: appointmentPrioritySchema.optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field is required',
});

export const updateAppointmentSchema = z
  .object({
    startsAt: dateSchema,
    endsAt: dateSchema,
    sessionType: z
      .enum(['consultation', 'training', 'assessment', 'nutrition', 'other'])
      .optional(),
    priority: appointmentPrioritySchema.optional(),
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

export const delegateAppointmentSchema = z.object({
  subCoachId: idSchema,
});
