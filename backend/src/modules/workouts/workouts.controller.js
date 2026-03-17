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
  submitWorkoutPlanSchema,
  updateCategorySchema,
  updateWorkoutPlanSchema,
  workoutSessionFinishSchema,
  workoutSessionProgressSchema,
  workoutSessionStartSchema,
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

const toIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTotalWeeks = (planOrPayload) => {
  const durationDays = Number(planOrPayload?.durationDays) || 30;
  return Math.max(1, Math.ceil(durationDays / 7));
};

const normalizePublishedWeeks = (weeks = [], totalWeeks = 1) => (
  [...new Set((Array.isArray(weeks) ? weeks : [])
    .map((w) => Number(w))
    .filter((w) => Number.isInteger(w) && w >= 1 && w <= totalWeeks))]
    .sort((a, b) => a - b)
);

const getWeekNumberFromDay = (dayNumber) => Math.max(1, Math.ceil(Number(dayNumber) / 7));

const isWorkoutDayAssigned = (day) => {
  if (day?.isRest) return true;
  const hasAssignedExercises = Array.isArray(day?.assignedExerciseIndexes)
    && day.assignedExerciseIndexes.length > 0;
  return Boolean(day?.assigned) && hasAssignedExercises;
};

const buildProgramDays = (payload) => {
  if (Array.isArray(payload.programDays) && payload.programDays.length) {
    return payload.programDays
      .map((day, idx) => ({
        dayNumber: Number(day.dayNumber) || idx + 1,
        date: toIsoDate(day.date) || todayIso(),
        isRest: Boolean(day.isRest),
        title: String(day.title || ''),
        muscles: String(day.muscles || ''),
        durationMinutes: Number(day.durationMinutes) || Number(payload.planDurationMinutes) || 45,
        level: String(day.level || 'Coach Plan'),
        rating: Number(day.rating || 4.7),
        exerciseIndexes: Array.isArray(day.exerciseIndexes) ? day.exerciseIndexes.map((i) => Number(i)).filter((i) => Number.isInteger(i) && i >= 0) : [],
        assigned: Boolean(day.assigned),
        assignedAt: day.assignedAt ? new Date(day.assignedAt) : null,
        assignedExerciseIndexes: Array.isArray(day.assignedExerciseIndexes)
          ? day.assignedExerciseIndexes.map((i) => Number(i)).filter((i) => Number.isInteger(i) && i >= 0)
          : [],
        done: Boolean(day.done),
        completedAt: day.done ? (day.completedAt ? new Date(day.completedAt) : new Date()) : null,
      }))
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }

  const durationDays = Number(payload.durationDays) || 30;
  const daysPerWeek = Math.max(1, Math.min(7, Number(payload.daysPerWeek) || 4));
  const start = toIsoDate(payload.startDate) || todayIso();
  const startDate = new Date(`${start}T00:00:00`);
  const exercises = Array.isArray(payload.exercises) ? payload.exercises : [];
  const builderType = String(payload.builderType || 'template');

  const splitByDaysPerWeek = {
    1: ['Full Body'],
    2: ['Upper Body', 'Lower Body'],
    3: ['Push', 'Pull', 'Legs'],
    4: ['Upper Body', 'Lower Body', 'Push', 'Pull'],
    5: ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'],
    6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
    7: ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Core', 'Conditioning'],
  };
  const splitCycle = splitByDaysPerWeek[daysPerWeek] || splitByDaysPerWeek[4];
  const splitToMuscles = {
    Push: 'Chest, Shoulders, Triceps',
    Pull: 'Back, Rear Delts, Biceps',
    Legs: 'Quads, Hamstrings, Glutes, Calves',
    'Upper Body': 'Chest, Back, Shoulders, Arms',
    'Lower Body': 'Quads, Hamstrings, Glutes, Calves',
    'Full Body': 'Full Body',
    Core: 'Core, Stability',
    Conditioning: 'Cardio, Conditioning',
  };

  const days = [];
  let workoutDayCount = 0;
  for (let offset = 0; offset < durationDays; offset += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);
    const dateIso = toIsoDate(date) || start;
    const dayOfWeek = date.getDay(); // 0-6
    const positionInWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // 1-7
    const isWorkout = positionInWeek <= daysPerWeek;

    let dayTitle = 'Rest Day';
    let dayMuscles = 'Recovery';
    let exerciseIndexes = [];

    if (isWorkout) {
      const splitName = splitCycle[workoutDayCount % splitCycle.length] || 'Workout';
      const weekNumber = Math.floor(offset / 7) + 1;
      const phaseLabel =
        weekNumber <= 1
          ? 'Foundation'
          : weekNumber <= 2
            ? 'Progressive Load'
            : weekNumber <= 3
              ? 'Intensity'
              : 'Review';

      dayTitle = `${splitName} - ${phaseLabel}`;
      dayMuscles = splitToMuscles[splitName] || (payload.planTitle || 'Coach Plan');

      workoutDayCount += 1;
    }

    days.push({
      dayNumber: offset + 1,
      date: dateIso,
      isRest: !isWorkout,
      title:
        builderType === 'custom'
          ? isWorkout
            ? (payload.planTitle || `Day ${offset + 1} Workout`)
            : 'Rest Day'
          : dayTitle,
      muscles:
        builderType === 'custom'
          ? isWorkout
            ? (payload.planTitle || 'Coach Plan')
            : 'Recovery'
          : dayMuscles,
      durationMinutes: Number(payload.planDurationMinutes) || 45,
      level: 'Coach Plan',
      rating: 4.7,
      exerciseIndexes: isWorkout && exercises.length ? exerciseIndexes : [],
      assigned: !isWorkout,
      assignedAt: !isWorkout ? new Date() : null,
      assignedExerciseIndexes: [],
      done: false,
      completedAt: null,
    });
  }

  return days;
};

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

  const plans = await WorkoutPlan.find({ coachId: query.coachId }).select('userId isSubmitted');
  const plansByUser = new Map();
  plans.forEach((item) => {
    const userId = String(item.userId);
    if (!plansByUser.has(userId)) {
      plansByUser.set(userId, { hasPlan: true, hasSubmittedPlan: Boolean(item.isSubmitted) });
      return;
    }
    const prev = plansByUser.get(userId);
    plansByUser.set(userId, {
      hasPlan: true,
      hasSubmittedPlan: prev.hasSubmittedPlan || Boolean(item.isSubmitted),
    });
  });

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
      hasPlan: plansByUser.has(userId),
      hasSubmittedPlan: plansByUser.get(userId)?.hasSubmittedPlan || false,
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
  if (typeof query.submitted === 'boolean') filter.isSubmitted = query.submitted;

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

  const programDays = buildProgramDays(payload);
  const created = await WorkoutPlan.create({
    ...payload,
    startDate: toIsoDate(payload.startDate) || todayIso(),
    currentDayDate: toIsoDate(payload.startDate) || todayIso(),
    programDays,
    publishedWeeks: [],
  });

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
  if (plan.isSubmitted) {
    throw new AppError('Submitted workout plan cannot be edited', HTTP_STATUS.CONFLICT);
  }

  Object.assign(plan, payload);
  const nextPayload = {
    ...plan.toObject(),
    ...payload,
    exercises: payload.exercises || plan.exercises || [],
  };
  const nextProgramDays = buildProgramDays(nextPayload);
  plan.programDays = nextProgramDays;
  plan.startDate = toIsoDate(nextPayload.startDate) || plan.startDate || todayIso();
  plan.currentDayDate = plan.currentDayDate || plan.startDate;
  plan.publishedWeeks = normalizePublishedWeeks(plan.publishedWeeks, getTotalWeeks(plan));
  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout plan updated successfully',
    data: plan,
  });
});

export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);
  const plan = await WorkoutPlan.findById(id);
  if (!plan) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }
  if (plan.isSubmitted) {
    throw new AppError('Submitted workout plan cannot be deleted', HTTP_STATUS.CONFLICT);
  }
  const deleted = await WorkoutPlan.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout plan deleted successfully',
  });
});

export const submitWorkoutPlan = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);
  const payload = parseOrThrow(submitWorkoutPlanSchema, req.body || {});

  const plan = await WorkoutPlan.findById(id);
  if (!plan) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }
  if (plan.isSubmitted && payload.mode === 'all') {
    return res.status(HTTP_STATUS.OK).json({
      message: 'Workout plan already submitted',
      data: plan,
    });
  }
  if (!Array.isArray(plan.programDays) || !plan.programDays.length) {
    plan.programDays = buildProgramDays(plan);
  }
  if (!plan.currentDayDate) {
    plan.currentDayDate = plan.startDate || todayIso();
  }

  const totalWeeks = getTotalWeeks(plan);
  let publishedWeeks = normalizePublishedWeeks(plan.publishedWeeks, totalWeeks);

  if (payload.mode === 'week') {
    const weekNumber = Number(payload.weekNumber);
    if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > totalWeeks) {
      throw new AppError('Valid weekNumber is required for week publish', HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
    const weekDays = (plan.programDays || []).filter((day) => getWeekNumberFromDay(day.dayNumber) === weekNumber);
    if (!weekDays.length) {
      throw new AppError(`No program days found for week ${weekNumber}`, HTTP_STATUS.CONFLICT);
    }
    const missingWeekDays = weekDays.filter((day) => !isWorkoutDayAssigned(day));
    if (missingWeekDays.length > 0) {
      const sample = missingWeekDays.slice(0, 6).map((day) => day.dayNumber).join(', ');
      throw new AppError(
        `Complete week ${weekNumber} before publish. Missing day assignments: ${sample}${missingWeekDays.length > 6 ? '...' : ''}`,
        HTTP_STATUS.CONFLICT,
      );
    }
    publishedWeeks = normalizePublishedWeeks([...publishedWeeks, weekNumber], totalWeeks);
    plan.publishedWeeks = publishedWeeks;
    const allWeeksPublished = publishedWeeks.length >= totalWeeks;
    plan.isSubmitted = allWeeksPublished ? Boolean(payload.submitted) : false;
    plan.submittedAt = allWeeksPublished ? new Date() : null;
    await plan.save();

    return res.status(HTTP_STATUS.OK).json({
      message: allWeeksPublished
        ? 'Workout plan submitted successfully'
        : `Week ${weekNumber} published successfully`,
      data: plan,
    });
  }

  const unassignedWorkoutDays = (plan.programDays || []).filter((day) => !isWorkoutDayAssigned(day));
  if (unassignedWorkoutDays.length > 0) {
    const sample = unassignedWorkoutDays.slice(0, 6).map((day) => day.dayNumber).join(', ');
    throw new AppError(
      `Complete all workout days before publish. Missing day assignments: ${sample}${unassignedWorkoutDays.length > 6 ? '...' : ''}`,
      HTTP_STATUS.CONFLICT,
    );
  }
  plan.publishedWeeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  plan.isSubmitted = Boolean(payload.submitted);
  plan.submittedAt = plan.isSubmitted ? new Date() : null;

  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout plan submitted successfully',
    data: plan,
  });
});

export const startWorkoutSession = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);
  const payload = parseOrThrow(workoutSessionStartSchema, req.body || {});

  const plan = await WorkoutPlan.findById(id);
  if (!plan) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }
  const publishedWeeks = normalizePublishedWeeks(plan.publishedWeeks, getTotalWeeks(plan));
  if (!plan.isSubmitted && !publishedWeeks.length) {
    throw new AppError('Workout plan is not published yet', HTTP_STATUS.CONFLICT);
  }
  if (String(plan.userId) !== payload.userId) {
    throw new AppError('Workout plan does not belong to this user', HTTP_STATUS.FORBIDDEN);
  }
  if (plan.session?.status === 'completed') {
    throw new AppError('Workout session is already completed', HTTP_STATUS.CONFLICT);
  }

  if (plan.session?.status !== 'ongoing') {
    plan.session = {
      ...(plan.session?.toObject ? plan.session.toObject() : plan.session || {}),
      status: 'ongoing',
      startedAt: plan.session?.startedAt || new Date(),
      completedAt: null,
      elapsedSeconds: Number(plan.session?.elapsedSeconds || 0),
      exerciseProgress: Array.isArray(plan.session?.exerciseProgress)
        ? plan.session.exerciseProgress
        : [],
    };
    await plan.save();
  }
  if (Array.isArray(plan.programDays) && plan.programDays.length) {
    const today = todayIso();
    const nextPending = plan.programDays.find((day) => !day.isRest && !day.done && day.date <= today)
      || plan.programDays.find((day) => !day.isRest && !day.done);
    if (nextPending?.date) {
      plan.currentDayDate = nextPending.date;
      await plan.save();
    }
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout session started',
    data: plan,
  });
});

export const updateWorkoutSessionProgress = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);
  const payload = parseOrThrow(workoutSessionProgressSchema, req.body || {});

  const plan = await WorkoutPlan.findById(id);
  if (!plan) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }
  const publishedWeeks = normalizePublishedWeeks(plan.publishedWeeks, getTotalWeeks(plan));
  if (!plan.isSubmitted && !publishedWeeks.length) {
    throw new AppError('Workout plan is not published yet', HTTP_STATUS.CONFLICT);
  }
  if (String(plan.userId) !== payload.userId) {
    throw new AppError('Workout plan does not belong to this user', HTTP_STATUS.FORBIDDEN);
  }
  if (plan.session?.status === 'completed') {
    throw new AppError('Workout session is already completed', HTTP_STATUS.CONFLICT);
  }
  if (!Array.isArray(plan.exercises) || payload.exerciseIndex >= plan.exercises.length) {
    throw new AppError('Exercise index is invalid', HTTP_STATUS.BAD_REQUEST);
  }

  const nextSession = {
    ...(plan.session?.toObject ? plan.session.toObject() : plan.session || {}),
    status: 'ongoing',
    startedAt: plan.session?.startedAt || new Date(),
    completedAt: null,
    elapsedSeconds: Number.isFinite(payload.elapsedSeconds)
      ? payload.elapsedSeconds
      : Number(plan.session?.elapsedSeconds || 0),
    exerciseProgress: Array.isArray(plan.session?.exerciseProgress)
      ? [...plan.session.exerciseProgress]
      : [],
  };

  const progressIndex = nextSession.exerciseProgress.findIndex(
    (item) => Number(item.index) === payload.exerciseIndex,
  );
  const nextProgressItem = {
    index: payload.exerciseIndex,
    done: payload.done,
    completedAt: payload.done ? new Date() : null,
  };

  if (progressIndex === -1) {
    nextSession.exerciseProgress.push(nextProgressItem);
  } else {
    nextSession.exerciseProgress[progressIndex] = nextProgressItem;
  }

  plan.session = nextSession;
  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout progress updated',
    data: plan,
  });
});

export const finishWorkoutSession = asyncHandler(async (req, res) => {
  const { id } = parseOrThrow(planIdParamsSchema, req.params);
  const payload = parseOrThrow(workoutSessionFinishSchema, req.body || {});

  const plan = await WorkoutPlan.findById(id);
  if (!plan) {
    throw new AppError('Workout plan not found', HTTP_STATUS.NOT_FOUND);
  }
  const publishedWeeks = normalizePublishedWeeks(plan.publishedWeeks, getTotalWeeks(plan));
  if (!plan.isSubmitted && !publishedWeeks.length) {
    throw new AppError('Workout plan is not published yet', HTTP_STATUS.CONFLICT);
  }
  if (String(plan.userId) !== payload.userId) {
    throw new AppError('Workout plan does not belong to this user', HTTP_STATUS.FORBIDDEN);
  }
  if (plan.session?.status === 'completed') {
    return res.status(HTTP_STATUS.OK).json({
      message: 'Workout session already completed',
      data: plan,
    });
  }

  const progressMap = new Map(
    (Array.isArray(plan.session?.exerciseProgress) ? plan.session.exerciseProgress : [])
      .map((item) => [Number(item.index), Boolean(item.done)]),
  );
  const incompleteExists = plan.exercises.some((_, index) => !progressMap.get(index));
  if (incompleteExists) {
    throw new AppError('Complete all exercises before finishing', HTTP_STATUS.CONFLICT);
  }

  const effectiveDay = toIsoDate(payload.dayDate) || todayIso();
  if (Array.isArray(plan.programDays) && plan.programDays.length) {
    const targetIndex = plan.programDays.findIndex(
      (day) => !day.isRest && !day.done && day.date <= effectiveDay,
    );
    if (targetIndex >= 0) {
      plan.programDays[targetIndex].done = true;
      plan.programDays[targetIndex].completedAt = new Date();
      const nextPending = plan.programDays.find(
        (day) => !day.isRest && !day.done && day.date >= plan.programDays[targetIndex].date,
      );
      plan.currentDayDate = nextPending?.date || plan.programDays[targetIndex].date;
    }
    const pendingWorkoutDays = plan.programDays.some((day) => !day.isRest && !day.done);
    plan.status = pendingWorkoutDays ? 'assigned' : 'completed';
  }

  plan.session = {
    ...(plan.session?.toObject ? plan.session.toObject() : plan.session || {}),
    status: 'completed',
    completedAt: new Date(),
    elapsedSeconds: Number.isFinite(payload.elapsedSeconds)
      ? payload.elapsedSeconds
      : Number(plan.session?.elapsedSeconds || 0),
  };
  await plan.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'Workout session completed',
    data: plan,
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
