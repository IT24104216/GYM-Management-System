import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../users/users.model.js';
import { DietPlan, MealLibraryItem } from './mealPlans.model.js';
import {
  createMealLibrarySchema,
  idParamSchema,
  mealLibraryQuerySchema,
  ownerQuerySchema,
  planQuerySchema,
  submitDietPlanSchema,
  updateDietPlanSchema,
  updateMealLibrarySchema,
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
