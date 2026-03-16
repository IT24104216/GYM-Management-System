import mongoose from 'mongoose';

const workoutExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['manual', 'category'],
      default: 'manual',
    },
    suggestionKey: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
  },
  {
    _id: false,
  },
);

const workoutPlanSchema = new mongoose.Schema(
  {
    coachId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    appointmentId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    planTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    planNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    planDurationMinutes: {
      type: Number,
      min: 1,
      max: 600,
      default: 45,
    },
    status: {
      type: String,
      enum: ['assigned', 'completed'],
      default: 'assigned',
      index: true,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    exercises: {
      type: [workoutExerciseSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one exercise is required',
      },
      default: [],
    },
    session: {
      status: {
        type: String,
        enum: ['idle', 'ongoing', 'completed'],
        default: 'idle',
      },
      startedAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
      elapsedSeconds: {
        type: Number,
        min: 0,
        default: 0,
      },
      exerciseProgress: {
        type: [{
          index: { type: Number, min: 0, required: true },
          done: { type: Boolean, default: false },
          completedAt: { type: Date, default: null },
        }],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

workoutPlanSchema.index({ coachId: 1, userId: 1, createdAt: -1 });

const exerciseCategorySchema = new mongoose.Schema(
  {
    coachId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryKey: {
      type: String,
      enum: ['weightGain', 'weightLoss'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

exerciseCategorySchema.index(
  { coachId: 1, categoryKey: 1, name: 1 },
  { unique: true },
);

export const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
export const ExerciseCategory = mongoose.model('ExerciseCategory', exerciseCategorySchema);
