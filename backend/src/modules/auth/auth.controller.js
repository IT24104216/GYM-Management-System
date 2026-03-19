import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../users/users.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { env } from '../../config/env.js';
import { createNotificationForAdmins } from '../notifications/notifications.service.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.validation.js';
import { normalizeRole } from '../../shared/utils/roles.js';

function parseOrThrow(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, result.error.flatten());
  }
  return result.data;
}

function toPublicUser(userDoc) {
  return {
    id: String(userDoc._id),
    branchUserId: userDoc.branchUserId || '',
    name: userDoc.name,
    email: userDoc.email,
    role: normalizeRole(userDoc.role),
    status: userDoc.status,
    branch: userDoc.branch || '',
  };
}

const getBranchCode = (branch) => {
  const normalized = String(branch || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '');
  if (!normalized) return 'BR';
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts.map((part) => part[0]).join('').slice(0, 3);
};

const generateBranchUserId = async (branch) => {
  const code = getBranchCode(branch);
  const escapedBranch = String(branch || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existingCount = await User.countDocuments({
    branch: { $regex: `^${escapedBranch}$`, $options: 'i' },
    role: 'user',
  });

  let sequence = existingCount + 1;
  while (sequence < 1000000) {
    const candidate = `${code}${String(sequence).padStart(4, '0')}`;
    const alreadyUsed = await User.exists({ branchUserId: candidate });
    if (!alreadyUsed) {
      return candidate;
    }
    sequence += 1;
  }

  throw new AppError('Failed to generate branch user id', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '7d' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
}

export const register = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(registerSchema, req.body);

  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError('Account already exists with this email', HTTP_STATUS.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const branchUserId = await generateBranchUserId(payload.branch);

  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    branch: payload.branch,
    branchUserId,
    passwordHash,
    role: 'user',
    status: 'active',
  });

  const safeUser = toPublicUser(user);
  const token = signAccessToken(safeUser);
  const refreshToken = signRefreshToken(safeUser);

  await Promise.allSettled([
    createNotificationForAdmins({
      title: 'New User Registration',
      message: `${safeUser.name} joined the platform.`,
      entityType: 'user',
      entityId: safeUser.id,
    }),
  ]);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Registration successful',
    token,
    refreshToken,
    user: safeUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = parseOrThrow(loginSchema, req.body);

  const identifier = payload.identifier.trim();
  const byEmail = identifier.toLowerCase();
  const user = await User.findOne({
    $or: [
      { email: byEmail },
      { name: { $regex: `^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
    ],
  });
  if (!user) {
    throw new AppError('Invalid username or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid username or password', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.status !== 'active') {
    throw new AppError('Your account is inactive. Please contact admin.', HTTP_STATUS.FORBIDDEN);
  }

  const safeUser = toPublicUser(user);
  const token = signAccessToken(safeUser);
  const refreshToken = signRefreshToken(safeUser);

  res.status(HTTP_STATUS.OK).json({
    message: 'Login successful',
    token,
    refreshToken,
    user: safeUser,
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    message: 'Logged out successfully',
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.body?.token
    || req.headers['x-refresh-token']
    || req.headers.authorization?.replace('Bearer ', '');

  const payload = parseOrThrow(refreshSchema, { token: rawToken });

  let decoded;
  try {
    decoded = jwt.verify(payload.token, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.status !== 'active') {
    throw new AppError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED);
  }

  const safeUser = toPublicUser(user);
  const token = signAccessToken(safeUser);

  res.status(HTTP_STATUS.OK).json({
    message: 'Token refreshed',
    token,
    user: safeUser,
  });
});
