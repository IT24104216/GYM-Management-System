import { z } from 'zod';

const idSchema = z
  .union([
    z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    z.coerce.number({ required_error: 'is required' }).int().nonnegative(),
  ])
  .transform((value) => String(value));

const numberLikeSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') return 0;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
  });

export const mealLibraryQuerySchema = z.object({
  dietitianId: idSchema,
  category: z.enum(['weight_gain', 'weight_loss', 'other']).optional(),
});

export const createMealLibrarySchema = z.object({
  dietitianId: idSchema,
  category: z.enum(['weight_gain', 'weight_loss', 'other']),
  mealName: z.string().trim().min(1, 'mealName is required').max(140),
  calories: numberLikeSchema,
  protein: numberLikeSchema,
  carbs: numberLikeSchema,
  lipids: numberLikeSchema,
  vitamins: z.string().trim().max(220).optional().default(''),
  description: z.string().trim().max(600).optional().default(''),
});

export const updateMealLibrarySchema = z
  .object({
    category: z.enum(['weight_gain', 'weight_loss', 'other']).optional(),
    mealName: z.string().trim().min(1).max(140).optional(),
    calories: numberLikeSchema,
    protein: numberLikeSchema,
    carbs: numberLikeSchema,
    lipids: numberLikeSchema,
    vitamins: z.string().trim().max(220).optional(),
    description: z.string().trim().max(600).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required',
  });

export const planQuerySchema = z.object({
  dietitianId: idSchema,
  userId: idSchema.optional(),
  submitted: z
    .union([
      z.boolean(),
      z.enum(['true', 'false']).transform((value) => value === 'true'),
    ])
    .optional(),
});

export const userPlanQuerySchema = z.object({
  userId: idSchema,
});

const mealOptionSchema = z.object({
  mealName: z.string().trim().max(140).optional().default(''),
  description: z.string().trim().max(600).optional().default(''),
  calories: numberLikeSchema,
  protein: numberLikeSchema,
  carbs: numberLikeSchema,
  lipids: numberLikeSchema,
  vitamins: z.string().trim().max(220).optional().default(''),
});

const mealSectionSchema = z.array(mealOptionSchema).min(1).max(12);

export const upsertDietPlanSchema = z.object({
  dietitianId: idSchema,
  userId: idSchema,
  memberName: z.string().trim().max(140).optional().default(''),
  appointmentId: z.string().trim().max(80).optional().default(''),
  breakfast: mealSectionSchema,
  lunch: mealSectionSchema,
  dinner: mealSectionSchema,
  snacks: mealSectionSchema,
  additionalNotes: z.string().trim().max(3000).optional().default(''),
});

export const updateDietPlanSchema = z
  .object({
    breakfast: mealSectionSchema.optional(),
    lunch: mealSectionSchema.optional(),
    dinner: mealSectionSchema.optional(),
    snacks: mealSectionSchema.optional(),
    additionalNotes: z.string().trim().max(3000).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required',
  });

export const submitDietPlanSchema = z.object({
  submitted: z.boolean().optional().default(true),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
});

export const ownerQuerySchema = z.object({
  dietitianId: idSchema,
});

const dateSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/);
const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snacks']);

export const foodLogQuerySchema = z.object({
  userId: idSchema,
  logDate: dateSchema.optional(),
});

export const createFoodLogSchema = z.object({
  userId: idSchema,
  logDate: dateSchema,
  mealType: mealTypeSchema,
  name: z.string().trim().min(1, 'name is required').max(140),
  calories: numberLikeSchema,
  protein: numberLikeSchema,
  carbs: numberLikeSchema,
  fat: numberLikeSchema,
  notes: z.string().trim().max(500).optional().default(''),
});

export const updateFoodLogSchema = z
  .object({
    logDate: dateSchema.optional(),
    mealType: mealTypeSchema.optional(),
    name: z.string().trim().min(1).max(140).optional(),
    calories: numberLikeSchema,
    protein: numberLikeSchema,
    carbs: numberLikeSchema,
    fat: numberLikeSchema,
    notes: z.string().trim().max(500).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required',
  });

export const foodLogOwnerQuerySchema = z.object({
  userId: idSchema,
});

export const nutritionSearchQuerySchema = z.object({
  q: z.string().trim().min(2, 'q must be at least 2 characters').max(120),
});
