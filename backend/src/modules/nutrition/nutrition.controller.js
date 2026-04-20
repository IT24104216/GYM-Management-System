import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { AppError } from '../../shared/errors/AppError.js';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { NutritionFood } from './nutrition.model.js';

export const searchNutritionFoods = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    throw new AppError('Query is required', HTTP_STATUS.BAD_REQUEST);
  }

  const limitRaw = Number(req.query.limit || 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), 25)
    : 10;

  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startsWithRegex = new RegExp(`^${safe}`, 'i');
  const containsRegex = new RegExp(safe, 'i');

  const startsWith = await NutritionFood.find({
    $or: [{ name: startsWithRegex }, { aliases: startsWithRegex }],
  })
    .sort({ name: 1 })
    .limit(limit)
    .lean();

  let rows = startsWith;
  if (startsWith.length < limit) {
    const excludedIds = startsWith.map((item) => item._id);
    const fallback = await NutritionFood.find({
      _id: { $nin: excludedIds },
      $or: [{ name: containsRegex }, { aliases: containsRegex }],
    })
      .sort({ name: 1 })
      .limit(limit - startsWith.length)
      .lean();
    rows = [...startsWith, ...fallback];
  }

  res.status(HTTP_STATUS.OK).json({
    data: rows.map((item) => ({
      id: String(item._id),
      name: item.name,
      calories: Number(item.calories || 0),
      protein: Number(item.protein || 0),
      carbs: Number(item.carbs || 0),
      fat: Number(item.fat || 0),
      serving: item.serving || '',
      category: item.category || '',
      source: item.source || 'sri-lanka-local',
    })),
  });
});

