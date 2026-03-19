import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { DietitianProfile } from '../dietitian/dietitianProfile.model.js';
import { DietPlan, FoodLog, MealLibraryItem } from './mealPlans.model.js';
import { NutritionFood } from '../nutrition/nutrition.model.js';
import { User } from '../users/users.model.js';
import {
  createNotification,
  createNotificationForAdmins,
} from '../notifications/notifications.service.js';
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
import {
  ensureDietitianExists,
  ensureUserExists,
  escapeRegExp,
  getScopedDietitianId,
  getScopedUserId,
  hasAtLeastOneMealName,
} from './mealPlans.service.js';
import {
  mapActiveUserDietPlan,
  mapLocalNutritionRows,
  mapUsdaFoods,
} from './mealPlans.mapper.js';

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


export const getmealPlansStatus = (_req, res) => {
  res.json({
    module: 'mealPlans',
    status: 'ready',
  });
};

export const getMealLibraryItems = asyncHandler(async (req, res) => {
  const query = parseOrThrow(mealLibraryQuerySchema, req.query || {});
  const dietitianId = getScopedDietitianId(req, query.dietitianId);
  await ensureDietitianExists(dietitianId);

  const filter = { dietitianId };
  if (query.category) filter.category = query.category;

  const items = await MealLibraryItem.find(filter).sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ data: items });
});

export const createMealLibraryItem = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createMealLibrarySchema, req.body || {});
  const dietitianId = getScopedDietitianId(req, payload.dietitianId);
  await ensureDietitianExists(dietitianId);

  const created = await MealLibraryItem.create({
    ...payload,
    dietitianId,
  });

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Meal added successfully',
    data: created,
  });
});

export const updateMealLibraryItem = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const owner = parseOrThrow(ownerQuerySchema, req.query || {});
  const dietitianId = getScopedDietitianId(req, owner.dietitianId);
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
  const owner = parseOrThrow(ownerQuerySchema, req.query || {});
  const dietitianId = getScopedDietitianId(req, owner.dietitianId);
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
  const dietitianId = getScopedDietitianId(req, query.dietitianId);
  await ensureDietitianExists(dietitianId);

  const filter = { dietitianId };
  if (query.userId) filter.userId = query.userId;
  if (typeof query.submitted === 'boolean') filter.isSubmitted = query.submitted;

  const plans = await DietPlan.find(filter).sort({ updatedAt: -1, createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    data: plans,
  });
});

export const upsertDietPlan = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(upsertDietPlanSchema, req.body || {});
  const dietitianId = getScopedDietitianId(req, payload.dietitianId);
  await ensureDietitianExists(dietitianId);
  await ensureUserExists(payload.userId);

  if (!hasAtLeastOneMealName(payload)) {
    throw new AppError(
      'At least one meal option with meal name is required',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  const existing = await DietPlan.findOne({
    dietitianId,
    userId: payload.userId,
  });

  if (existing?.isSubmitted) {
    throw new AppError('Submitted diet plan cannot be edited', HTTP_STATUS.CONFLICT);
  }

  const dataToSave = {
    ...payload,
    dietitianId,
    isSubmitted: false,
    submittedAt: null,
  };

  const plan = await DietPlan.findOneAndUpdate(
    { dietitianId, userId: payload.userId },
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
  const owner = parseOrThrow(ownerQuerySchema, req.query || {});
  const dietitianId = getScopedDietitianId(req, owner.dietitianId);
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
  const owner = parseOrThrow(ownerQuerySchema, req.query || {});
  const dietitianId = getScopedDietitianId(req, owner.dietitianId);
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

  if (plan.isSubmitted) {
    await Promise.allSettled([
      createNotification({
        recipientId: plan.userId,
        recipientRole: 'user',
        type: 'meal',
        title: 'Meal Plan Published',
        message: 'Your dietitian submitted your meal plan.',
        entityType: 'meal-plan',
        entityId: String(plan._id),
      }),
      createNotificationForAdmins({
        title: 'Meal Plan Submitted',
        message: 'A dietitian submitted a meal plan for a client.',
        entityType: 'meal-plan',
        entityId: String(plan._id),
      }),
    ]);
  }

  res.status(HTTP_STATUS.OK).json({
    message: plan.isSubmitted ? 'Diet plan submitted successfully' : 'Diet plan moved to draft',
    data: plan,
  });
});

export const deleteDietPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const owner = parseOrThrow(ownerQuerySchema, req.query || {});
  const dietitianId = getScopedDietitianId(req, owner.dietitianId);
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

export const getUserActiveDietPlan = asyncHandler(async (req, res) => {
  const query = parseOrThrow(userPlanQuerySchema, req.query || {});
  const userId = getScopedUserId(req, query.userId);
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

  res.status(HTTP_STATUS.OK).json({
    data: mapActiveUserDietPlan(plan, dietitianUser, dietitianProfile),
  });
});

export const getUserFoodLogs = asyncHandler(async (req, res) => {
  const query = parseOrThrow(foodLogQuerySchema, req.query || {});
  const userId = getScopedUserId(req, query.userId);
  const { logDate } = query;
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
  const userId = getScopedUserId(req, payload.userId);
  await ensureUserExists(userId);

  const created = await FoodLog.create({
    ...payload,
    userId,
  });

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Food log added successfully',
    data: created,
  });
});

export const updateUserFoodLog = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const owner = parseOrThrow(foodLogOwnerQuerySchema, req.query || {});
  const userId = getScopedUserId(req, owner.userId);
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
  const owner = parseOrThrow(foodLogOwnerQuerySchema, req.query || {});
  const userId = getScopedUserId(req, owner.userId);
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
  const safe = escapeRegExp(query);
  const startsWithRegex = new RegExp(`^${safe}`, 'i');
  const containsRegex = new RegExp(safe, 'i');

  const localStartsWith = await NutritionFood.find({
    $or: [{ name: startsWithRegex }, { aliases: startsWithRegex }],
  })
    .sort({ name: 1 })
    .limit(10)
    .lean();

  let localRows = localStartsWith;
  if (localStartsWith.length < 10) {
    const excludedIds = localStartsWith.map((item) => item._id);
    const localContains = await NutritionFood.find({
      _id: { $nin: excludedIds },
      $or: [{ name: containsRegex }, { aliases: containsRegex }],
    })
      .sort({ name: 1 })
      .limit(10 - localStartsWith.length)
      .lean();
    localRows = [...localStartsWith, ...localContains];
  }

  const localResults = mapLocalNutritionRows(localRows);

  let externalResults = [];
  if (env.USDA_API_KEY) {
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${encodeURIComponent(env.USDA_API_KEY)}`;
    try {
      const response = await fetch(usdaUrl, { method: 'GET' });
      if (response.ok) {
        const json = await response.json();
        externalResults = mapUsdaFoods(json?.foods || []);
      }
    } catch {
      externalResults = [];
    }
  }

  const merged = [...localResults, ...externalResults];
  const seen = new Set();
  const deduped = merged.filter((item) => {
    const key = String(item.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  res.status(HTTP_STATUS.OK).json({ data: deduped.slice(0, 20) });
});
