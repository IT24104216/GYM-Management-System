import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    coachId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    sessionType: {
      type: String,
      enum: ['consultation', 'training', 'assessment', 'nutrition', 'other'],
      default: 'consultation',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

appointmentSchema.index({ coachId: 1, startsAt: 1, endsAt: 1 });
appointmentSchema.index({ userId: 1, coachId: 1, startsAt: -1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
