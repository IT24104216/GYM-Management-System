import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ownerName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 120,
    },
    subjectType: {
      type: String,
      enum: ['coach', 'dietitian'],
      required: true,
      trim: true,
      index: true,
    },
    subjectId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subjectName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 120,
    },
    bookingId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

feedbackSchema.index({ subjectType: 1, subjectId: 1, createdAt: -1 });
feedbackSchema.index({ ownerId: 1, createdAt: -1 });
feedbackSchema.index(
  { ownerId: 1, subjectType: 1, subjectId: 1, bookingId: 1 },
  { unique: true, partialFilterExpression: { bookingId: { $type: 'string', $ne: '' } } },
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
