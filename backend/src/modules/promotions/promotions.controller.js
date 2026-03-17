import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Promotion } from './promotions.model.js';
import {
  createPromotionSchema,
  promotionIdParamsSchema,
  promotionQuerySchema,
  publicPromotionQuerySchema,
  updatePromotionSchema,
} from './promotions.validation.js';

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

const toDto = (doc) => ({
  id: String(doc._id),
  title: doc.title,
  placement: doc.placement,
  target: doc.target,
  status: doc.status,
  budget: Number(doc.budget || 0),
  startDate: doc.startDate ? new Date(doc.startDate).toISOString().slice(0, 10) : '',
  endDate: doc.endDate ? new Date(doc.endDate).toISOString().slice(0, 10) : '',
  link: doc.link || '',
  description: doc.description || '',
  image: doc.image || '',
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const getPromotionsStatus = (_req, res) => {
  res.json({ module: 'promotions', status: 'ready' });
};

export const getPromotions = asyncHandler(async (req, res) => {
  const query = parseOrThrow(promotionQuerySchema, req.query || {});
  const filter = {};
  if (query.status) filter.status = query.status;

  const promotions = await Promotion.find(filter)
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(query.limit);

  res.status(HTTP_STATUS.OK).json({
    data: promotions.map(toDto),
  });
});

export const createPromotion = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createPromotionSchema, req.body || {});
  const created = await Promotion.create(payload);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Promotion created successfully',
    data: toDto(created),
  });
});

export const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(promotionIdParamsSchema, req.params || {});
  const payload = parseOrThrow(updatePromotionSchema, req.body || {});

  const promotion = await Promotion.findById(id);
  if (!promotion) {
    throw new AppError('Promotion not found', HTTP_STATUS.NOT_FOUND);
  }

  if (payload.startDate && !payload.endDate && promotion.endDate && payload.startDate > promotion.endDate) {
    throw new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, {
      fieldErrors: { startDate: ['startDate must be earlier than endDate'] },
    });
  }
  if (payload.endDate && !payload.startDate && promotion.startDate && payload.endDate < promotion.startDate) {
    throw new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, {
      fieldErrors: { endDate: ['endDate must be later than startDate'] },
    });
  }

  Object.assign(promotion, payload);
  await promotion.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Promotion updated successfully',
    data: toDto(promotion),
  });
});

export const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(promotionIdParamsSchema, req.params || {});
  const deleted = await Promotion.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Promotion not found', HTTP_STATUS.NOT_FOUND);
  }
  res.status(HTTP_STATUS.OK).json({ message: 'Promotion deleted successfully' });
});

export const getPublicPromotions = asyncHandler(async (req, res) => {
  const { limit } = parseOrThrow(publicPromotionQuerySchema, req.query || {});
  const now = new Date();
  const promotions = await Promotion.find({
    status: 'ACTIVE',
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(limit);

  res.status(HTTP_STATUS.OK).json({
    data: promotions.map(toDto),
  });
});

