import { z } from 'zod';

const idSchema = z
  .union([
    z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    z.coerce.number({ required_error: 'is required' }).int().nonnegative(),
  ])
  .transform((value) => String(value));

const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(120),
  amount: z.string().trim().min(1, 'amount is required').max(80),
  description: z.string().trim().max(500).optional().default(''),
  sourceType: z.enum(['manual', 'category']).optional().default('manual'),
  suggestionKey: z.string().trim().max(120).optional().default(''),
});

export const workoutQuerySchema = z.object({
  coachId: idSchema.optional(),
  userId: idSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
});

export const createWorkoutPlanSchema = z.object({
  coachId: idSchema,
  userId: idSchema,
  appointmentId: z.string().trim().optional().default(''),
  planTitle: z.string().trim().min(1, 'planTitle is required').max(150),
  planNote: z.string().trim().max(1000).optional().default(''),
  exercises: z.array(exerciseSchema).min(1, 'at least one exercise is required'),
});

export const updateWorkoutPlanSchema = z.object({
  planTitle: z.string().trim().min(1).max(150).optional(),
  planNote: z.string().trim().max(1000).optional(),
  status: z.enum(['assigned', 'completed']).optional(),
  exercises: z.array(exerciseSchema).min(1).optional(),
});

export const planIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
});

export const categoryQuerySchema = z.object({
  coachId: idSchema,
});

export const createCategorySchema = z.object({
  coachId: idSchema,
  categoryKey: z.enum(['weightGain', 'weightLoss']),
  name: z.string().trim().min(1).max(120),
  amount: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional().default(''),
});

export const updateCategorySchema = z.object({
  categoryKey: z.enum(['weightGain', 'weightLoss']).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  amount: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional(),
});

export const categoryIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
});
