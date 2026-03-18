import { Appointment } from './appointments.model.js';
import {
  appointmentIdParamsSchema,
  appointmentQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from './appointments.validation.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import {
  createNotification,
  createNotificationForAdmins,
} from '../notifications/notifications.service.js';

function parseOrThrow(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, result.error.flatten());
  }
  return result.data;
}

function buildDateRange(dateText) {
  const start = new Date(`${dateText}T00:00:00.000Z`);
  const end = new Date(`${dateText}T23:59:59.999Z`);
  return { start, end };
}

function getProviderLabel(sessionType) {
  return sessionType === 'nutrition' ? 'dietitian' : 'coach';
}

function statusToTitle(status) {
  if (status === 'approved') return 'Booking Approved';
  if (status === 'rejected') return 'Booking Rejected';
  if (status === 'cancelled') return 'Booking Cancelled';
  if (status === 'completed') return 'Session Completed';
  return 'Booking Updated';
}

function enforceAppointmentAccess(item, authUser) {
  const role = String(authUser?.role || '');
  const authUserId = String(authUser?.id || '');
  if (!item || !role || !authUserId) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }
  if (role === 'admin') return;
  if (role === 'user' && String(item.userId) === authUserId) return;
  if (role === 'coach' && String(item.coachId || '') === authUserId) return;
  if (role === 'dietitian' && String(item.dietitianId || '') === authUserId) return;
  throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
}

export const createAppointment = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createAppointmentSchema, req.body);
  if (req.user?.role !== 'admin' && String(payload.userId) !== String(req.user?.id || '')) {
    throw new AppError('Forbidden: userId mismatch', HTTP_STATUS.FORBIDDEN);
  }
  const providerField = payload.sessionType === 'nutrition' ? 'dietitianId' : 'coachId';
  const providerValue = payload[providerField];

  const overlapping = await Appointment.findOne({
    [providerField]: providerValue,
    status: { $in: ['pending', 'approved'] },
    startsAt: { $lt: payload.endsAt },
    endsAt: { $gt: payload.startsAt },
  });

  if (overlapping) {
    throw new AppError(
      payload.sessionType === 'nutrition'
        ? 'Dietitian already has a booking in this time range'
        : 'Coach already has a booking in this time range',
      HTTP_STATUS.CONFLICT,
    );
  }

  const created = await Appointment.create(payload);

  await Promise.allSettled([
    createNotification({
      recipientId: payload.userId,
      recipientRole: 'user',
      type: 'booking',
      title: 'Booking Request Sent',
      message: `Your ${payload.sessionType} booking request was submitted successfully.`,
      entityType: 'appointment',
      entityId: String(created._id),
    }),
    payload[providerField]
      ? createNotification({
          recipientId: payload[providerField],
          recipientRole: payload.sessionType === 'nutrition' ? 'dietitian' : 'coach',
          type: 'booking',
          title: 'New Booking Request',
          message: `You received a new ${payload.sessionType} booking request.`,
          entityType: 'appointment',
          entityId: String(created._id),
        })
      : Promise.resolve(null),
    createNotificationForAdmins({
      title: 'New Booking Received',
      message: `A new ${payload.sessionType} booking request was created.`,
      entityType: 'appointment',
      entityId: String(created._id),
    }),
  ]);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Appointment created successfully',
    data: created,
  });
});

export const getAppointments = asyncHandler(async (req, res) => {
  const query = parseOrThrow(appointmentQuerySchema, req.query);
  const authRole = String(req.user?.role || '');
  const authUserId = String(req.user?.id || '');

  const filter = {};
  if (authRole === 'admin') {
    if (query.coachId) filter.coachId = query.coachId;
    if (query.dietitianId) filter.dietitianId = query.dietitianId;
    if (query.userId) filter.userId = query.userId;
  } else if (authRole === 'user') {
    filter.userId = authUserId;
  } else if (authRole === 'coach') {
    filter.coachId = authUserId;
  } else if (authRole === 'dietitian') {
    filter.dietitianId = authUserId;
  } else {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }
  if (query.status) filter.status = query.status;
  if (query.sessionType) filter.sessionType = query.sessionType;

  if (query.date) {
    const { start, end } = buildDateRange(query.date);
    filter.startsAt = { $gte: start, $lte: end };
  }

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Appointment.find(filter).sort({ startsAt: 1 }).skip(skip).limit(query.limit),
    Appointment.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    data: items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(appointmentIdParamsSchema, req.params);

  const item = await Appointment.findById(id);
  if (!item) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }
  enforceAppointmentAccess(item, req.user);

  res.status(HTTP_STATUS.OK).json({ data: item });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(appointmentIdParamsSchema, req.params);
  const payload = parseOrThrow(updateAppointmentStatusSchema, req.body);

  const item = await Appointment.findById(id);
  if (!item) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }
  enforceAppointmentAccess(item, req.user);
  if (req.user?.role === 'user') {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }

  item.status = payload.status;
  if (typeof payload.notes === 'string') {
    item.notes = payload.notes;
  }

  await item.save();

  await Promise.allSettled([
    createNotification({
      recipientId: item.userId,
      recipientRole: 'user',
      type: 'booking',
      title: statusToTitle(payload.status),
      message: `Your booking was ${payload.status} by ${getProviderLabel(item.sessionType)}.`,
      entityType: 'appointment',
      entityId: String(item._id),
    }),
    createNotificationForAdmins({
      title: 'Booking Status Changed',
      message: `A booking was marked as ${payload.status}.`,
      entityType: 'appointment',
      entityId: String(item._id),
    }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    message: 'Appointment status updated',
    data: item,
  });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(appointmentIdParamsSchema, req.params);
  const payload = parseOrThrow(updateAppointmentSchema, req.body);

  const item = await Appointment.findById(id);
  if (!item) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }
  enforceAppointmentAccess(item, req.user);
  if (!['admin', 'user'].includes(String(req.user?.role || ''))) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }

  const providerField = item.sessionType === 'nutrition' ? 'dietitianId' : 'coachId';
  const providerValue = item[providerField];

  const overlapping = await Appointment.findOne({
    _id: { $ne: id },
    [providerField]: providerValue,
    status: { $in: ['pending', 'approved'] },
    startsAt: { $lt: payload.endsAt },
    endsAt: { $gt: payload.startsAt },
  });

  if (overlapping) {
    throw new AppError('Coach already has a booking in this time range', HTTP_STATUS.CONFLICT);
  }

  item.startsAt = payload.startsAt;
  item.endsAt = payload.endsAt;
  if (payload.sessionType) item.sessionType = payload.sessionType;
  if (typeof payload.notes === 'string') item.notes = payload.notes;
  if (item.status === 'cancelled' || item.status === 'rejected') {
    item.status = 'pending';
  }

  await item.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Appointment updated successfully',
    data: item,
  });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(appointmentIdParamsSchema, req.params);

  const item = await Appointment.findById(id);
  if (!item) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }
  enforceAppointmentAccess(item, req.user);
  if (!['admin', 'user'].includes(String(req.user?.role || ''))) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }
  await item.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    message: 'Appointment deleted successfully',
  });
});
