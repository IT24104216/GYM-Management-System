import mongoose from 'mongoose';

const dietitianProfileSchema = new mongoose.Schema(
  {
    dietitianId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    qualifications: {
      type: String,
      trim: true,
      default: '',
      maxlength: 180,
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
      maxlength: 140,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
      max: 80,
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 30,
    },
    joinDate: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    slots: {
      type: String,
      trim: true,
      default: 'No upcoming slots',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DietitianProfile = mongoose.model('DietitianProfile', dietitianProfileSchema);

