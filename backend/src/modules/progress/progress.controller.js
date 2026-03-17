import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../users/users.model.js';
import { WorkoutPlan } from '../workouts/workouts.model.js';
import { ProgressTracking } from './progress.model.js';
import {
  calculateCoachMemberScores,
  calculateUserProgressScore,
} from './progress.scoring.js';
import {
  progressCoachParamsSchema,
  progressScoreQuerySchema,
  progressUserParamsSchema,
  upsertMeasurementSchema,
} from './progress.validation.js';

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

const toIsoDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const mapMeasurementsByDate = (measurements = []) => {
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const weightHistoryByDate = {};
  const measurementsByDate = {};

  sorted.forEach((entry) => {
    weightHistoryByDate[entry.date] = Number(entry.weight);
    measurementsByDate[entry.date] = {
      chest: Number(entry.chest),
      waist: Number(entry.waist),
      arms: Number(entry.arms),
      thighs: Number(entry.thighs),
      bodyFat: Number(entry.bodyFat),
    };
  });

  return {
    weightHistoryByDate,
    measurementsByDate,
  };
};

const getWorkoutCompletionDates = async (userId) => {
  const plans = await WorkoutPlan.find({
    userId,
    $or: [{ status: 'completed' }, { 'session.status': 'completed' }],
  }).select('session.completedAt updatedAt');

  const dates = plans
    .map((plan) => toIsoDate(plan?.session?.completedAt || plan.updatedAt))
    .filter(Boolean);

  const uniqueSorted = Array.from(new Set(dates)).sort();
  return {
    workoutCompletionDates: uniqueSorted,
    completionDate: uniqueSorted.length ? uniqueSorted[uniqueSorted.length - 1] : '',
  };
};

export const getProgressStatus = (_req, res) => {
  res.json({
    module: 'progress',
    status: 'ready',
  });
};

export const getUserProgress = asyncHandler(async (req, res) => {
  const { userId } = parseOrThrow(progressUserParamsSchema, req.params);
  const { days } = parseOrThrow(progressScoreQuerySchema, req.query || {});

  const memberUser = await User.findById(userId).select('_id');
  if (!memberUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const progressDoc = await ProgressTracking.findOne({ userId });
  const { weightHistoryByDate, measurementsByDate } = mapMeasurementsByDate(progressDoc?.measurements || []);
  const [completion, score] = await Promise.all([
    getWorkoutCompletionDates(userId),
    calculateUserProgressScore(userId, { daysWindow: days }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    data: {
      userId,
      weightHistoryByDate,
      measurementsByDate,
      ...completion,
      score,
    },
  });
});

export const upsertUserMeasurement = asyncHandler(async (req, res) => {
  const { userId } = parseOrThrow(progressUserParamsSchema, req.params);
  const { days } = parseOrThrow(progressScoreQuerySchema, req.query || {});
  const payload = parseOrThrow(upsertMeasurementSchema, req.body || {});

  const memberUser = await User.findById(userId).select('_id');
  if (!memberUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const doc = await ProgressTracking.findOne({ userId });
  if (!doc) {
    await ProgressTracking.create({
      userId,
      measurements: [payload],
    });
  } else {
    const idx = doc.measurements.findIndex((item) => item.date === payload.date);
    if (idx === -1) {
      doc.measurements.push(payload);
    } else {
      doc.measurements[idx] = payload;
    }
    await doc.save();
  }

  const latestDoc = await ProgressTracking.findOne({ userId });
  const { weightHistoryByDate, measurementsByDate } = mapMeasurementsByDate(latestDoc?.measurements || []);
  const [completion, score] = await Promise.all([
    getWorkoutCompletionDates(userId),
    calculateUserProgressScore(userId, { daysWindow: days }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    message: `Progress updated for ${payload.date}`,
    data: {
      userId,
      weightHistoryByDate,
      measurementsByDate,
      ...completion,
      score,
    },
  });
});

export const getUserProgressScore = asyncHandler(async (req, res) => {
  const { userId } = parseOrThrow(progressUserParamsSchema, req.params);
  const { days } = parseOrThrow(progressScoreQuerySchema, req.query || {});

  const memberUser = await User.findById(userId).select('_id');
  if (!memberUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const score = await calculateUserProgressScore(userId, { daysWindow: days });

  res.status(HTTP_STATUS.OK).json({
    data: score,
  });
});

export const getCoachMemberScores = asyncHandler(async (req, res) => {
  const { coachId } = parseOrThrow(progressCoachParamsSchema, req.params);
  const { days } = parseOrThrow(progressScoreQuerySchema, req.query || {});

  const scoreData = await calculateCoachMemberScores(coachId, { daysWindow: days });

  res.status(HTTP_STATUS.OK).json({
    data: scoreData,
  });
});
