import { z } from 'zod';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Notification } from './notifications.model.js';

const querySchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(['user', 'coach', 'dietitian', 'admin']).optional().default('user'),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

const markBodySchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(['user', 'coach', 'dietitian', 'admin']).optional().default('user'),
});

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

const toDto = (item) => ({
  id: String(item._id),
  title: item.title,
  message: item.message,
  type: item.type,
  read: Boolean(item.isRead),
  time: item.createdAt,
  createdAt: item.createdAt,
  entityType: item.entityType || '',
  entityId: item.entityId || '',
  actionUrl: item.actionUrl || '',
});

const getScopedNotificationOwner = (req, userId, role) => {
  const authUserId = String(req.user?.id || '');
  const authRole = String(req.user?.role || '');
  if (!authUserId || !authRole) {
    throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }
  if (authRole === 'admin') {
    return {
      userId: String(userId || ''),
      role: String(role || 'user'),
    };
  }
  return {
    userId: authUserId,
    role: authRole,
  };
};

export const getnotificationsStatus = (_req, res) => {
  res.json({
    module: 'notifications',
    status: 'ready',
  });
};

export const getNotifications = asyncHandler(async (req, res) => {
  const query = parseOrThrow(querySchema, req.query || {});
  const scope = getScopedNotificationOwner(req, query.userId, query.role);
  const rows = await Notification.find({
    recipientId: scope.userId,
    recipientRole: scope.role,
  })
    .sort({ createdAt: -1 })
    .limit(query.limit);

  res.status(HTTP_STATUS.OK).json({
    data: rows.map(toDto),
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(idParamsSchema, req.params);
  const payload = parseOrThrow(markBodySchema, req.body || {});
  const scope = getScopedNotificationOwner(req, payload.userId, payload.role);

  const row = await Notification.findOne({
    _id: id,
    recipientId: scope.userId,
    recipientRole: scope.role,
  });

  if (!row) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
  }

  row.isRead = true;
  await row.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Notification marked as read',
    data: toDto(row),
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(markBodySchema, req.body || {});
  const scope = getScopedNotificationOwner(req, payload.userId, payload.role);

  await Notification.updateMany(
    {
      recipientId: scope.userId,
      recipientRole: scope.role,
      isRead: false,
    },
    { $set: { isRead: true } },
  );

  res.status(HTTP_STATUS.OK).json({
    message: 'All notifications marked as read',
  });
});
