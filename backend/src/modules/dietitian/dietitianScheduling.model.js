import mongoose from 'mongoose';

const dietitianSchedulingSchema = new mongoose.Schema(
  {
    dietitianId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    notes: {
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

dietitianSchedulingSchema.index({ dietitianId: 1, date: 1, startTime: 1, endTime: 1 });

export const DietitianScheduling = mongoose.model('DietitianScheduling', dietitianSchedulingSchema);

