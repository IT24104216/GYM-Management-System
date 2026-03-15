import { User } from '../users/users.model.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { AppError } from '../../shared/errors/AppError.js';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';

const ROLE_SET = new Set(['user', 'coach', 'dietitian', 'admin']);
const STATUS_SET = new Set(['active', 'inactive', 'suspended']);

const toUiRole = {
  user: 'Member',
  coach: 'Coach',
  dietitian: 'Dietician',
  admin: 'Admin',
};

const toUiStatus = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
};

function toUserDto(userDoc) {
  const roleChangedAt = userDoc.roleChangedAt || null;
  return {
    id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    role: toUiRole[userDoc.role] || 'Member',
    status: toUiStatus[userDoc.status] || 'Active',
    joined: new Date(userDoc.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    avatar: userDoc.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U',
    roleChangedAt,
    roleChangedAtLabel: roleChangedAt
      ? new Date(roleChangedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      : null,
  };
}

export const getAdminStatus = (_req, res) => {
  res.json({
    module: 'admin',
    status: 'ready',
  });
};

export const getUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const role = String(req.query.role || '').trim().toLowerCase();
  const status = String(req.query.status || '').trim().toLowerCase();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && ROLE_SET.has(role)) {
    filter.role = role;
  }
  if (status && STATUS_SET.has(status)) {
    filter.status = status;
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    data: users.map(toUserDto),
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    data: toUserDto(user),
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const nextRole = String(req.body?.role || '').trim().toLowerCase();
  const nextStatus = String(req.body?.status || '').trim().toLowerCase();

  if (nextRole) {
    if (!ROLE_SET.has(nextRole)) {
      throw new AppError('Invalid role value', HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
    if (user.role !== nextRole) {
      user.role = nextRole;
      user.roleChangedAt = new Date();
    }
  }

  if (nextStatus) {
    if (!STATUS_SET.has(nextStatus)) {
      throw new AppError('Invalid status value', HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
    user.status = nextStatus;
  }

  if (req.body?.name) {
    user.name = String(req.body.name).trim();
  }

  await user.save();

  res.status(HTTP_STATUS.OK).json({
    message: 'User updated successfully',
    data: toUserDto(user),
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'User deleted successfully',
  });
});

export const getAdminStats = asyncHandler(async (_req, res) => {
  const [total, staff, diet, verified] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: { $in: ['coach', 'admin'] } }),
    User.countDocuments({ role: 'dietitian' }),
    User.countDocuments({ status: 'active' }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    data: {
      total,
      staff,
      diet,
      verified,
    },
  });
});
