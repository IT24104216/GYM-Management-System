import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../users/users.model.js';
import { createNotification } from '../notifications/notifications.service.js';
import { Feedback } from './feedbacks.model.js';
import {
  createFeedbackSchema,
  deleteFeedbackSchema,
  feedbackIdParamsSchema,
  feedbackQuerySchema,
  updateFeedbackSchema,
} from './feedbacks.validation.js';

function parseOrThrow(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(
      'Validation failed',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      result.error.flatten(),
    );
  }
  return result.data;
}

const toDto = (row) => ({
  id: String(row._id),
  ownerId: row.ownerId,
  ownerName: row.ownerName || '',
  subjectType: row.subjectType,
  subjectId: row.subjectId,
  subjectName: row.subjectName || '',
  bookingId: row.bookingId || '',
  rating: Number(row.rating || 0),
  comment: row.comment || '',
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId).select('_id');
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }
};

export const getfeedbacksStatus = (_req, res) => {
  res.json({
    module: 'feedbacks',
    status: 'ready',
  });
};

export const getFeedbacks = asyncHandler(async (req, res) => {
  const query = parseOrThrow(feedbackQuerySchema, req.query || {});
  const filter = {};
  if (query.subjectType) filter.subjectType = query.subjectType;
  if (query.subjectId) filter.subjectId = query.subjectId;
  if (query.ownerId) filter.ownerId = query.ownerId;

  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Feedback.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    data: rows.map(toDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  });
});

export const createFeedback = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createFeedbackSchema, req.body || {});
  await ensureUserExists(payload.ownerId);

  try {
    const created = await Feedback.create(payload);

    await Promise.allSettled([
      createNotification({
        recipientId: payload.ownerId,
        recipientRole: 'user',
        type: 'feedback',
        title: 'Feedback Submitted',
        message: `Your feedback for ${payload.subjectName || payload.subjectType} was submitted successfully.`,
        entityType: 'feedback',
        entityId: String(created._id),
      }),
      createNotification({
        recipientId: payload.subjectId,
        recipientRole: payload.subjectType,
        type: 'feedback',
        title: 'New Feedback Received',
        message: `${payload.ownerName || 'A user'} submitted new feedback.`,
        entityType: 'feedback',
        entityId: String(created._id),
      }),
    ]);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Feedback created successfully',
      data: toDto(created),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(
        'You already submitted feedback for this booking',
        HTTP_STATUS.CONFLICT,
      );
    }
    throw error;
  }
});

export const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(feedbackIdParamsSchema, req.params || {});
  const payload = parseOrThrow(updateFeedbackSchema, req.body || {});

  const row = await Feedback.findById(id);
  if (!row) {
    throw new AppError('Feedback not found', HTTP_STATUS.NOT_FOUND);
  }

  if (String(row.ownerId) !== String(payload.ownerId)) {
    throw new AppError(
      'Only feedback owner can edit this feedback',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (payload.rating !== undefined) row.rating = payload.rating;
  if (payload.comment !== undefined) row.comment = payload.comment;
  await row.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Feedback updated successfully',
    data: toDto(row),
  });
});

export const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(feedbackIdParamsSchema, req.params || {});
  const { ownerId } = parseOrThrow(deleteFeedbackSchema, req.body || {});

  const row = await Feedback.findById(id);
  if (!row) {
    throw new AppError('Feedback not found', HTTP_STATUS.NOT_FOUND);
  }

  if (String(row.ownerId) !== String(ownerId)) {
    throw new AppError(
      'Only feedback owner can delete this feedback',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  await Feedback.findByIdAndDelete(id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Feedback deleted successfully',
  });
});
