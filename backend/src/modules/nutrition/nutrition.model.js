import mongoose from 'mongoose';

const nutritionFoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    calories: {
      type: Number,
      default: 0,
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fat: {
      type: Number,
      default: 0,
      min: 0,
    },
    serving: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    source: {
      type: String,
      default: 'sri-lanka-local',
      trim: true,
      maxlength: 120,
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

nutritionFoodSchema.index({ name: 'text', aliases: 'text' });

export const NutritionFood = mongoose.model('NutritionFood', nutritionFoodSchema);

