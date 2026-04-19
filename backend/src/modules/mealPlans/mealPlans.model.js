import mongoose from 'mongoose';

const mealLibrarySchema = new mongoose.Schema(
  {
    dietitianId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['weight_gain', 'weight_loss', 'other'],
      required: true,
      index: true,
    },
    mealName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    calories: {
      type: Number,
      min: 0,
      default: 0,
    },
    protein: {
      type: Number,
      min: 0,
      default: 0,
    },
    carbs: {
      type: Number,
      min: 0,
      default: 0,
    },
    lipids: {
      type: Number,
      min: 0,
      default: 0,
    },
    vitamins: {
      type: String,
      trim: true,
      maxlength: 220,
      default: '',
    },
    quantity: {
      type: Number,
      min: 0.1,
      default: 1,
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cups', 'tbsp', 'tsp', 'piece'],
      default: 'g',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

mealLibrarySchema.index({ dietitianId: 1, category: 1, createdAt: -1 });

const mealOptionSchema = new mongoose.Schema(
  {
    mealName: {
      type: String,
      trim: true,
      maxlength: 140,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    calories: {
      type: Number,
      min: 0,
      default: 0,
    },
    protein: {
      type: Number,
      min: 0,
      default: 0,
    },
    carbs: {
      type: Number,
      min: 0,
      default: 0,
    },
    lipids: {
      type: Number,
      min: 0,
      default: 0,
    },
    vitamins: {
      type: String,
      trim: true,
      maxlength: 220,
      default: '',
    },
    quantity: {
      type: Number,
      min: 0.1,
      default: 1,
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cups', 'tbsp', 'tsp', 'piece'],
      default: 'g',
    },
  },
  {
    _id: false,
  },
);

const dietPlanSchema = new mongoose.Schema(
  {
    dietitianId: {
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
    memberName: {
      type: String,
      trim: true,
      maxlength: 140,
      default: '',
    },
    appointmentId: {
      type: String,
      trim: true,
      default: '',
    },
    breakfast: {
      type: [mealOptionSchema],
      default: [],
    },
    lunch: {
      type: [mealOptionSchema],
      default: [],
    },
    dinner: {
      type: [mealOptionSchema],
      default: [],
    },
    snacks: {
      type: [mealOptionSchema],
      default: [],
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

dietPlanSchema.index({ dietitianId: 1, userId: 1 }, { unique: true });

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    logDate: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    calories: {
      type: Number,
      min: 0,
      default: 0,
    },
    protein: {
      type: Number,
      min: 0,
      default: 0,
    },
    carbs: {
      type: Number,
      min: 0,
      default: 0,
    },
    fat: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    quantity: {
      type: Number,
      min: 0.1,
      default: 1,
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cups', 'tbsp', 'tsp', 'piece'],
      default: 'g',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

foodLogSchema.index({ userId: 1, logDate: 1, mealType: 1, createdAt: -1 });

export const MealLibraryItem = mongoose.model('MealLibraryItem', mealLibrarySchema);
export const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export const FoodLog = mongoose.model('FoodLog', foodLogSchema);
