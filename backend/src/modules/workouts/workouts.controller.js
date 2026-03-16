import { Appointment } from '../appointments/appointments.model.js';
import { User } from '../users/users.model.js';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { ExerciseCategory, WorkoutPlan } from './workouts.model.js';
import {
  categoryIdParamsSchema,
  categoryQuerySchema,
  createCategorySchema,
  createWorkoutPlanSchema,
  planIdParamsSchema,
  updateCategorySchema,
  updateWorkoutPlanSchema,
  workoutQuerySchema,
} from './workouts.validation.js';

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

function getNoteValue(notes, key) {
  if (!notes) return '';
  const pattern = new RegExp(`${key}:\\s*([^|]+)`, 'i');
  const match = notes.match(pattern);
  return match?.[1]?.trim() || '';
}

function derivePriority(appointment) {
  const notePriority = getNoteValue(appointment.notes, 'Priority');
  if (['high', 'urgent'].includes(notePriority.toLowerCase())) return 'High';
  if (notePriority.toLowerCase() === 'low') return 'Low';
  return 'Medium';
}

function isOnlineAppointment(appointment) {
  const byNote = getNoteValue(appointment.notes, 'Appointment Type').toLowerCase();
  return byNote === 'online';
}

export const getworkoutsStatus = (_req, res) => {
  res.json({
    module: 'workouts',
    status: 'ready',
  });
};

export const getWorkoutRequests = asyncHandler(async (req, res) => {
  const query = parseOrThrow(workoutQuerySchema, req.query);
  if (!query.coachId) {
    throw new AppError('coachId is required', HTTP_STATUS.BAD_REQUEST);
  }

  const coachUser = await User.findOne({ _id: query.coachId, role: 'coach' }).select('_id');
  if (!coachUser) {
    throw new AppError('Coach not found', HTTP_STATUS.NOT_FOUND);
  }

  const approvedAppointments = await Appointment.find({
    coachId: query.coachId,
    status: { $in: ['approved', 'completed'] },
    sessionType: { $in: ['consultation', 'training', 'assessment', 'other'] },
  })
    .sort({ updatedAt: -1, startsAt: -1 })
    .limit(1000);

  const plans = await WorkoutPlan.find({ coachId: query.coachId }).select('userId');
  const plannedUserIds = new Set(plans.map((item) => String(item.userId)));

  const dedupByUser = new Map();

  approvedAppointments.forEach((appointment) => {
    if (!isOnlineAppointment(appointment)) return;
    const userId = String(appointment.userId);
    if (!userId) return;
    if (!dedupByUser.has(userId)) dedupByUser.set(userId, appointment);
  });

  const requests = Array.from(dedupByUser.values()).map((appointment) => {
    const userId = String(appointment.userId);
    const userName = getNoteValue(appointment.notes, 'User Name') || `User ${userId.slice(0, 6)}`;
    const goal = getNoteValue(appointment.notes, 'Goal') || 'General Fitness';
    const sessionsPerWeek = Number(getNoteValue(appointment.notes, 'Sessions')) || 3;

    return {
      appointmentId: String(appointment._id),
      userId,
      name: userName,
      avatar: userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'U',
      age: Number(getNoteValue(appointment.notes, 'Age')) || 25,
      goal,
      priority: derivePriority(appointment),
      requestedOn: appointment.createdAt.toISOString().slice(0, 10),
      sessionsPerWeek,
      notes: getNoteValue(appointment.notes, 'Description') || appointment.notes || '',
      hasPlan: plannedUserIds.has(userId),
    };
  });

  res.status(HTTP_STATUS.OK).json({
    data: requests,
  });
});

export const getWorkoutPlans = asyncHandler(async (req, res) => {
  const query = parseOrThrow(workoutQuerySchema, req.query);
  const filter = {};
  if (query.coachId) filter.coachId = query.coachId;
  if (query.userId) filter.userId = query.userId;

  const plans = await WorkoutPlan.find(filter)
    .sort({ createdAt: -1 })
    .limit(query.limit);

  res.status(HTTP_STATUS.OK).json({
    data: plans,
  });
});

export const createWorkoutPlan = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createWorkoutPlanSchema, req.body);

  const coachUser = await User.findOne({ _id: payload.coachId, role: 'coach' }).select('_id');
  if (!coachUser) {
    throw new AppError('Coach not found', HTTP_STATUS.NOT_FOUND);
  }

  const memberUser = await User.findOne({ _id: payload.userId }).select('_id');
  if (!memberUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const created = await WorkoutPlan.create(payload);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Workout plan created successfully',
    data: created,
  });
});

export const updateWorkoutPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);
  const payload = parseOrThrow(updateWorkoutPlanSchema, req.body);

  const plan = await WorkoutPlan.findById(id);
  if (!plan) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }

  Object.assign(plan, payload);
  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout plan updated successfully',
    data: plan,
  });
});

export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);

  const deleted = await WorkoutPlan.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout plan deleted successfully',
  });
});

export const getExerciseCategories = asyncHandler(async (req, res) => {
  const query = parseOrThrow(categoryQuerySchema, req.query);
  const categories = await ExerciseCategory.find({ coachId: query.coachId }).sort({
    categoryKey: 1,
    createdAt: -1,
  });

  res.status(HTTP_STATUS.OK).json({
    data: categories,
  });
});

export const createExerciseCategoryItem = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(createCategorySchema, req.body);
  const created = await ExerciseCategory.create(payload);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Exercise added successfully',
    data: created,
  });
});

export const updateExerciseCategoryItem = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(categoryIdParamsSchema, req.params);
  const payload = parseOrThrow(updateCategorySchema, req.body);

  const item = await ExerciseCategory.findById(id);
  if (!item) {
    throw new AppError('Exercise not found', HTTP_STATUS.NOT_FOUND);
  }

  Object.assign(item, payload);
  await item.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Exercise updated successfully',
    data: item,
  });
});

export const deleteExerciseCategoryItem = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(categoryIdParamsSchema, req.params);
  const deleted = await ExerciseCategory.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError('Exercise not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Exercise deleted successfully',
  });
});
