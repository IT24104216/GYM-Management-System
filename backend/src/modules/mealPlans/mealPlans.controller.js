import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { User } from '../users/users.model.js';
import { DietitianProfile } from '../dietitian/dietitianProfile.model.js';
import { DietPlan, FoodLog, MealLibraryItem } from './mealPlans.model.js';
import {
  createFoodLogSchema,
  createMealLibrarySchema,
  foodLogOwnerQuerySchema,
  foodLogQuerySchema,
  idParamSchema,
  mealLibraryQuerySchema,
  nutritionSearchQuerySchema,
  ownerQuerySchema,
  planQuerySchema,
  submitDietPlanSchema,
  updateFoodLogSchema,
  updateDietPlanSchema,
  updateMealLibrarySchema,
  userPlanQuerySchema,
  upsertDietPlanSchema,
} from './mealPlans.validation.js';

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
  const dietitian = await User.findOne({ _id: dietitianId, role: 'dietitian' }).select('_id');
  if (!dietitian) {
    throw new AppError('Dietitian not found', HTTP_STATUS.NOT_FOUND);
  }
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId).select('_id');
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }
};

const hasAtLeastOneMealName = (payload) => {
  const sections = [payload.breakfast, payload.lunch, payload.dinner, payload.snacks];
  return sections.some((section) =>
    Array.isArray(section) && section.some((option) => String(option?.mealName || '').trim().length > 0));
};

export const getmealPlansStatus = (_req, res) => {
  res.json({
    module: 'mealPlans',
    status: 'ready',
  });
};

export const getMealLibraryItems = asyncHandler(async (req, res) => {
  const query = parseOrThrow(mealLibraryQuerySchema, req.query || {});
  await ensureDietitianExists(query.dietitianId);

  const filter = { dietitianId: query.dietitianId };
  if (query.category) filter.category = query.category;

  const items = await MealLibraryItem.find(filter).sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ data: items });
});

export const createMealLibraryItem = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createMealLibrarySchema, req.body || {});
  await ensureDietitianExists(payload.dietitianId);

  const created = await MealLibraryItem.create(payload);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Meal added successfully',
    data: created,
  });
});

export const updateMealLibraryItem = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { dietitianId } = parseOrThrow(ownerQuerySchema, req.query || {});
  const payload = parseOrThrow(updateMealLibrarySchema, req.body || {});
  await ensureDietitianExists(dietitianId);

  const item = await MealLibraryItem.findOne({ _id: id, dietitianId });
  if (!item) {
    throw new AppError('Meal not found', HTTP_STATUS.NOT_FOUND);
  }

  Object.assign(item, payload);
  await item.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Meal updated successfully',
    data: item,
  });
});

export const deleteMealLibraryItem = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { dietitianId } = parseOrThrow(ownerQuerySchema, req.query || {});
  await ensureDietitianExists(dietitianId);

  const deleted = await MealLibraryItem.findOneAndDelete({ _id: id, dietitianId });
  if (!deleted) {
    throw new AppError('Meal not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Meal deleted successfully',
  });
});

export const getDietPlans = asyncHandler(async (req, res) => {
  const query = parseOrThrow(planQuerySchema, req.query || {});
  await ensureDietitianExists(query.dietitianId);

  const filter = { dietitianId: query.dietitianId };
  if (query.userId) filter.userId = query.userId;
  if (typeof query.submitted === 'boolean') filter.isSubmitted = query.submitted;

  const plans = await DietPlan.find(filter).sort({ updatedAt: -1, createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    data: plans,
  });
});

export const upsertDietPlan = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(upsertDietPlanSchema, req.body || {});
  await ensureDietitianExists(payload.dietitianId);
  await ensureUserExists(payload.userId);

  if (!hasAtLeastOneMealName(payload)) {
    throw new AppError(
      'At least one meal option with meal name is required',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  const existing = await DietPlan.findOne({
    dietitianId: payload.dietitianId,
    userId: payload.userId,
  });

  if (existing?.isSubmitted) {
    throw new AppError('Submitted diet plan cannot be edited', HTTP_STATUS.CONFLICT);
  }

  const dataToSave = {
    ...payload,
    isSubmitted: false,
    submittedAt: null,
  };

  const plan = await DietPlan.findOneAndUpdate(
    { dietitianId: payload.dietitianId, userId: payload.userId },
    { $set: dataToSave },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(HTTP_STATUS.OK).json({
    message: existing ? 'Diet plan updated successfully' : 'Diet plan created successfully',
    data: plan,
  });
});

export const updateDietPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { dietitianId } = parseOrThrow(ownerQuerySchema, req.query || {});
  const payload = parseOrThrow(updateDietPlanSchema, req.body || {});
  await ensureDietitianExists(dietitianId);

  const plan = await DietPlan.findOne({ _id: id, dietitianId });
  if (!plan) {
    throw new AppError('Diet plan not found', HTTP_STATUS.NOT_FOUND);
  }
  if (plan.isSubmitted) {
    throw new AppError('Submitted diet plan cannot be edited', HTTP_STATUS.CONFLICT);
  }

  const merged = {
    breakfast: payload.breakfast ?? plan.breakfast,
    lunch: payload.lunch ?? plan.lunch,
    dinner: payload.dinner ?? plan.dinner,
    snacks: payload.snacks ?? plan.snacks,
    additionalNotes: payload.additionalNotes ?? plan.additionalNotes,
  };

  if (!hasAtLeastOneMealName(merged)) {
    throw new AppError(
      'At least one meal option with meal name is required',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  Object.assign(plan, payload);
  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Diet plan updated successfully',
    data: plan,
  });
});

export const submitDietPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { dietitianId } = parseOrThrow(ownerQuerySchema, req.query || {});
  const payload = parseOrThrow(submitDietPlanSchema, req.body || {});
  await ensureDietitianExists(dietitianId);

  const plan = await DietPlan.findOne({ _id: id, dietitianId });
  if (!plan) {
    throw new AppError('Diet plan not found', HTTP_STATUS.NOT_FOUND);
  }

  if (payload.submitted && !hasAtLeastOneMealName(plan)) {
    throw new AppError(
      'At least one meal option with meal name is required',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  plan.isSubmitted = Boolean(payload.submitted);
  plan.submittedAt = plan.isSubmitted ? new Date() : null;
  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: plan.isSubmitted ? 'Diet plan submitted successfully' : 'Diet plan moved to draft',
    data: plan,
  });
});

export const deleteDietPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { dietitianId } = parseOrThrow(ownerQuerySchema, req.query || {});
  await ensureDietitianExists(dietitianId);

  const plan = await DietPlan.findOne({ _id: id, dietitianId });
  if (!plan) {
    throw new AppError('Diet plan not found', HTTP_STATUS.NOT_FOUND);
  }
  if (plan.isSubmitted) {
    throw new AppError('Submitted diet plan cannot be deleted', HTTP_STATUS.CONFLICT);
  }

  await DietPlan.findByIdAndDelete(id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Diet plan deleted successfully',
  });
});

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const sectionMap = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];

export const getUserActiveDietPlan = asyncHandler(async (req, res) => {
  const { userId } = parseOrThrow(userPlanQuerySchema, req.query || {});
  await ensureUserExists(userId);

  const plan = await DietPlan.findOne({ userId, isSubmitted: true })
    .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 });

  if (!plan) {
    return res.status(HTTP_STATUS.OK).json({ data: null });
  }

  const [dietitianUser, dietitianProfile] = await Promise.all([
    User.findById(plan.dietitianId).select('name email'),
    DietitianProfile.findOne({ dietitianId: plan.dietitianId }).select('specialization experienceYears'),
  ]);

  const sectionData = sectionMap.map((section) => {
    const rawItems = Array.isArray(plan[section.key]) ? plan[section.key] : [];
    const items = rawItems
      .filter((item) => String(item?.mealName || '').trim().length > 0)
      .map((item) => ({
        name: item.mealName,
        description: item.description || '',
        cals: toNumber(item.calories),
        p: toNumber(item.protein),
        c: toNumber(item.carbs),
        f: toNumber(item.lipids),
        vitamins: item.vitamins || '',
      }));

    return {
      key: section.key,
      type: section.label,
      items,
      total: items.reduce((sum, item) => sum + item.cals, 0),
    };
  });

  const summary = sectionData.reduce(
    (acc, section) => {
      section.items.forEach((item) => {
        acc.totalCalories += item.cals;
        acc.protein += item.p;
        acc.carbs += item.c;
        acc.fat += item.f;
      });
      return acc;
    },
    { totalCalories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  res.status(HTTP_STATUS.OK).json({
    data: {
      planId: String(plan._id),
      userId: String(plan.userId),
      memberName: plan.memberName || '',
      additionalNotes: plan.additionalNotes || '',
      isSubmitted: Boolean(plan.isSubmitted),
      submittedAt: plan.submittedAt,
      updatedAt: plan.updatedAt,
      dietitian: {
        id: String(plan.dietitianId),
        name: dietitianUser?.name || 'Dietitian',
        email: dietitianUser?.email || '',
        specialization: dietitianProfile?.specialization || 'Nutrition',
        experienceYears: Number(dietitianProfile?.experienceYears || 0),
      },
      summary,
      sections: sectionData,
    },
  });
});

export const getUserFoodLogs = asyncHandler(async (req, res) => {
  const { userId, logDate } = parseOrThrow(foodLogQuerySchema, req.query || {});
  await ensureUserExists(userId);

  const filter = { userId };
  if (logDate) filter.logDate = logDate;

  const logs = await FoodLog.find(filter).sort({ mealType: 1, createdAt: 1 });

  res.status(HTTP_STATUS.OK).json({
    data: logs,
  });
});

export const createUserFoodLog = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createFoodLogSchema, req.body || {});
  await ensureUserExists(payload.userId);

  const created = await FoodLog.create(payload);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Food log added successfully',
    data: created,
  });
});

export const updateUserFoodLog = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { userId } = parseOrThrow(foodLogOwnerQuerySchema, req.query || {});
  const payload = parseOrThrow(updateFoodLogSchema, req.body || {});
  await ensureUserExists(userId);

  const log = await FoodLog.findOne({ _id: id, userId });
  if (!log) {
    throw new AppError('Food log not found', HTTP_STATUS.NOT_FOUND);
  }

  Object.assign(log, payload);
  await log.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Food log updated successfully',
    data: log,
  });
});

export const deleteUserFoodLog = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const { userId } = parseOrThrow(foodLogOwnerQuerySchema, req.query || {});
  await ensureUserExists(userId);

  const deleted = await FoodLog.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    throw new AppError('Food log not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Food log deleted successfully',
  });
});

export const searchNutritionFoods = asyncHandler(async (req, res) => {
  const { q } = parseOrThrow(nutritionSearchQuerySchema, req.query || {});
  const query = q.trim();

  if (!env.USDA_API_KEY) {
    throw new AppError('USDA API key is missing', HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=12&api_key=${encodeURIComponent(env.USDA_API_KEY)}`;
  let externalResults = [];

  try {
    const response = await fetch(usdaUrl, { method: 'GET' });

    if (response.ok) {
      const json = await response.json();
      externalResults = (json?.foods || []).map((food) => {
        const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];
        const getNutrient = (names) => {
          const hit = nutrients.find((n) =>
            names.some((name) => String(n?.nutrientName || '').toLowerCase() === name.toLowerCase()));
          return Number(hit?.value || 0);
        };

        return {
          source: 'usda',
          id: String(food.fdcId || ''),
          name: String(food.description || '').trim(),
          calories: getNutrient(['Energy', 'Energy (Atwater General Factors)', 'Energy (Atwater Specific Factors)']),
          protein: getNutrient(['Protein']),
          carbs: getNutrient(['Carbohydrate, by difference']),
          fat: getNutrient(['Total lipid (fat)']),
          notes: '',
          vitamins: '',
        };
      }).filter((item) => item.name);
    }
  } catch (_error) {
    throw new AppError('USDA lookup failed', HTTP_STATUS.BAD_GATEWAY);
  }
  res.status(HTTP_STATUS.OK).json({ data: externalResults.slice(0, 12) });
});
