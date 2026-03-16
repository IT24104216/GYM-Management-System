import mongoose from 'mongoose';

const progressMeasurementSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    chest: { type: Number, min: 0, required: true },
    waist: { type: Number, min: 0, required: true },
    arms: { type: Number, min: 0, required: true },
    thighs: { type: Number, min: 0, required: true },
    bodyFat: { type: Number, min: 0, required: true },
    weight: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const progressTrackingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    measurements: {
      type: [progressMeasurementSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ProgressTracking = mongoose.model('ProgressTracking', progressTrackingSchema);

