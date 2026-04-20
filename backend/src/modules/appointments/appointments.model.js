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
      required: false,
      trim: true,
      index: true,
    },
    dietitianId: {
      type: String,
      required: false,
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
    priority: {
      type: String,
      enum: ['urgent', 'normal', 'low'],
      default: 'normal',
      index: true,
    },
    queuePosition: {
      type: Number,
      default: null,
      index: true,
    },
    queueEnteredAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastEscalatedAt: {
      type: Date,
      default: null,
    },
    escalationHistory: {
      type: [
        new mongoose.Schema(
          {
            fromPriority: {
              type: String,
              enum: ['urgent', 'normal', 'low'],
              required: true,
            },
            toPriority: {
              type: String,
              enum: ['urgent', 'normal', 'low'],
              required: true,
            },
            escalatedAt: {
              type: Date,
              required: true,
            },
            reason: {
              type: String,
              trim: true,
              default: '',
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    slaDeadline: {
      type: Date,
      default: null,
      index: true,
    },
    slaBreached: {
      type: Boolean,
      default: false,
      index: true,
    },
    snoozedUntil: {
      type: Date,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    delegatedByCoachId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    delegatedByCoachName: {
      type: String,
      trim: true,
      default: '',
    },
    delegatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

appointmentSchema.index({ coachId: 1, startsAt: 1, endsAt: 1 });
appointmentSchema.index({ dietitianId: 1, startsAt: 1, endsAt: 1 });
appointmentSchema.index({ userId: 1, coachId: 1, startsAt: -1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
