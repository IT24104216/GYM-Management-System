import mongoose from 'mongoose';
import { DEFAULT_BRANCH } from '../../shared/constants/branches.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'coach', 'dietitian'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    branch: {
      type: String,
      trim: true,
      default: DEFAULT_BRANCH,
      index: true,
    },
    roleChangedAt: {
      type: Date,
      default: null,
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model('User', userSchema);
