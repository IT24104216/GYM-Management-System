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

export const createAppointment = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createAppointmentSchema, req.body);

  const overlapping = await Appointment.findOne({
    coachId: payload.coachId,
    status: { $in: ['pending', 'approved'] },
    startsAt: { $lt: payload.endsAt },
    endsAt: { $gt: payload.startsAt },
  });

  if (overlapping) {
    throw new AppError('Coach already has a booking in this time range', HTTP_STATUS.CONFLICT);
  }

  const created = await Appointment.create(payload);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Appointment created successfully',
    data: created,
  });
});

export const getAppointments = asyncHandler(async (req, res) => {
  const query = parseOrThrow(appointmentQuerySchema, req.query);

  const filter = {};
  if (query.coachId) filter.coachId = query.coachId;
  if (query.userId) filter.userId = query.userId;
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

  res.status(HTTP_STATUS.OK).json({ data: item });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(appointmentIdParamsSchema, req.params);
  const payload = parseOrThrow(updateAppointmentStatusSchema, req.body);

  const item = await Appointment.findById(id);
  if (!item) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }

  item.status = payload.status;
  if (typeof payload.notes === 'string') {
    item.notes = payload.notes;
  }

  await item.save();

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

  const overlapping = await Appointment.findOne({
    _id: { $ne: id },
    coachId: item.coachId,
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

  const deleted = await Appointment.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Appointment deleted successfully',
  });
});
