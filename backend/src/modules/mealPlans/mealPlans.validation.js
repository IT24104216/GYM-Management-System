import { z } from 'zod';

const idSchema = z
  .union([
    z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    z.coerce.number({ required_error: 'is required' }).int().nonnegative(),
  ])
  .transform((value) => String(value));

const toZeroWhenEmpty = (value) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'string' && value.trim() === '') return 0;
  return value;
};

const numericWithBounds = (label, max) =>
  z.preprocess(
    toZeroWhenEmpty,
    z.coerce
      .number({ invalid_type_error: `${label} must be a valid number` })
      .finite(`${label} must be a valid number`)
      .min(0, `${label} cannot be negative`)
      .max(max, `${label} must be less than or equal to ${max}`),
  );

const caloriesSchema = numericWithBounds('Calories', 3000);
const macroSchema = numericWithBounds('Macro value', 500);
const quantitySchema = z.preprocess(
  toZeroWhenEmpty,
  z.coerce
    .number({ invalid_type_error: 'Quantity must be a valid number' })
    .finite('Quantity must be a valid number')
    .min(0.1, 'Quantity must be at least 0.1'),
);
const unitSchema = z.enum(['g', 'ml', 'cups', 'tbsp', 'tsp', 'piece']);

export const mealLibraryQuerySchema = z.object({
  dietitianId: idSchema,
  category: z.enum(['weight_gain', 'weight_loss', 'other']).optional(),
});

export const createMealLibrarySchema = z.object({
  dietitianId: idSchema,
  category: z.enum(['weight_gain', 'weight_loss', 'other']),
  mealName: z.string().trim().min(1, 'mealName is required').max(140),
  calories: caloriesSchema.optional().default(0),
  protein: macroSchema.optional().default(0),
  carbs: macroSchema.optional().default(0),
  lipids: macroSchema.optional().default(0),
  vitamins: z.string().trim().max(220).optional().default(''),
  quantity: quantitySchema.optional().default(1),
  unit: unitSchema.optional().default('g'),
  description: z.string().trim().max(600).optional().default(''),
});

export const updateMealLibrarySchema = z
  .object({
    category: z.enum(['weight_gain', 'weight_loss', 'other']).optional(),
    mealName: z.string().trim().min(1).max(140).optional(),
    calories: caloriesSchema.optional(),
    protein: macroSchema.optional(),
    carbs: macroSchema.optional(),
    lipids: macroSchema.optional(),
    vitamins: z.string().trim().max(220).optional(),
    quantity: quantitySchema.optional(),
    unit: unitSchema.optional(),
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
  calories: caloriesSchema.optional().default(0),
  protein: macroSchema.optional().default(0),
  carbs: macroSchema.optional().default(0),
  lipids: macroSchema.optional().default(0),
  vitamins: z.string().trim().max(220).optional().default(''),
  quantity: quantitySchema.optional().default(1),
  unit: unitSchema.optional().default('g'),
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
  calories: caloriesSchema.optional().default(0),
  protein: macroSchema.optional().default(0),
  carbs: macroSchema.optional().default(0),
  fat: macroSchema.optional().default(0),
  notes: z.string().trim().max(500).optional().default(''),
  quantity: quantitySchema.optional().default(1),
  unit: unitSchema.optional().default('g'),
});

export const updateFoodLogSchema = z
  .object({
    logDate: dateSchema.optional(),
    mealType: mealTypeSchema.optional(),
    name: z.string().trim().min(1).max(140).optional(),
    calories: caloriesSchema.optional(),
    protein: macroSchema.optional(),
    carbs: macroSchema.optional(),
    fat: macroSchema.optional(),
    notes: z.string().trim().max(500).optional(),
    quantity: quantitySchema.optional(),
    unit: unitSchema.optional(),
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
