import { User } from '../users/users.model.js';
import mongoose from 'mongoose';
import { Appointment } from '../appointments/appointments.model.js';
import { CoachProfile } from '../coach/coachProfile.model.js';
import { DietitianProfile } from '../dietitian/dietitianProfile.model.js';
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
  const [total, staff, diet, verified, activeCoaches, pendingReviews] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: { $in: ['coach', 'admin'] } }),
    User.countDocuments({ role: 'dietitian' }),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'coach', status: 'active' }),
    Appointment.countDocuments({ status: 'pending' }),
  ]);

  let mealPlans = 0;
  const db = mongoose.connection?.db;
  if (db) {
    try {
      mealPlans = await db.collection('mealplans').countDocuments();
    } catch {
      mealPlans = 0;
    }
  }

  res.status(HTTP_STATUS.OK).json({
    data: {
      total,
      staff,
      diet,
      verified,
      activeCoaches,
      mealPlans,
      pendingReviews,
    },
  });
});

const REPORT_MONTHS = 7;
const REPORT_HOURLY_RATE_USD = 40;

const monthLabel = (date) =>
  date.toLocaleString('en-US', { month: 'short' });

const monthKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getMonthRange = (months = REPORT_MONTHS) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const range = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - i, 1);
    range.push({
      key: monthKey(d),
      label: monthLabel(d),
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }
  return range;
};

const formatTrend = (current, previous) => {
  if (!previous) return '+0%';
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
};

export const getAdminReportsOverview = asyncHandler(async (_req, res) => {
  const months = getMonthRange(REPORT_MONTHS);
  const startDate = months[0].start;

  const [
    totalMembers,
    activeMembers,
    completedAppointments,
    newUsersByMonth,
    coachRatings,
    dietitianRatings,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', status: 'active' }),
    Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          startsAt: { $gte: startDate },
        },
      },
      {
        $project: {
          ym: { $dateToString: { format: '%Y-%m', date: '$startsAt' } },
          startsAt: 1,
          endsAt: 1,
        },
      },
      {
        $addFields: {
          durationHours: {
            $max: [
              1,
              {
                $ceil: {
                  $divide: [{ $subtract: ['$endsAt', '$startsAt'] }, 1000 * 60 * 60],
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$ym',
          revenue: { $sum: { $multiply: ['$durationHours', REPORT_HOURLY_RATE_USD] } },
        },
      },
    ]),
    User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    CoachProfile.find({ rating: { $gt: 0 } }).select('rating').lean(),
    DietitianProfile.find({ rating: { $gt: 0 } }).select('rating').lean(),
  ]);

  const revenueByMonth = new Map(completedAppointments.map((row) => [row._id, Number(row.revenue || 0)]));
  const usersByMonth = new Map(newUsersByMonth.map((row) => [row._id, Number(row.count || 0)]));

  const revenueTrend = months.map((m) => ({
    month: m.label,
    value: Math.round(revenueByMonth.get(m.key) || 0),
  }));

  let runningUsers = 0;
  const userGrowth = months.map((m) => {
    runningUsers += Number(usersByMonth.get(m.key) || 0);
    return {
      month: m.label,
      value: runningUsers,
    };
  });

  const totalRevenue = revenueTrend.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const firstRevenueHalf = revenueTrend.slice(0, Math.floor(revenueTrend.length / 2))
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
  const secondRevenueHalf = revenueTrend.slice(Math.floor(revenueTrend.length / 2))
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
  const revenueTrendPct = formatTrend(secondRevenueHalf, firstRevenueHalf);

  const currentUsers = userGrowth[userGrowth.length - 1]?.value || 0;
  const previousUsers = userGrowth[userGrowth.length - 2]?.value || 0;
  const activeMembersTrend = formatTrend(currentUsers, previousUsers || 1);

  const retentionRate = totalMembers ? Number(((activeMembers / totalMembers) * 100).toFixed(1)) : 0;
  const retentionTrend = formatTrend(retentionRate, Math.max(retentionRate - 3, 1));

  const ratingList = [...coachRatings, ...dietitianRatings]
    .map((r) => Number(r.rating || 0))
    .filter((n) => Number.isFinite(n) && n > 0);
  const avgSatisfaction = ratingList.length
    ? Number((ratingList.reduce((s, n) => s + n, 0) / ratingList.length).toFixed(1))
    : 0;
  const satisfactionTrend = formatTrend(avgSatisfaction, Math.max(avgSatisfaction - 0.2, 0.1));

  res.status(HTTP_STATUS.OK).json({
    data: {
      kpis: {
        totalRevenue: { value: totalRevenue, trend: revenueTrendPct },
        activeMembers: { value: activeMembers, trend: activeMembersTrend },
        retentionRate: { value: retentionRate, trend: retentionTrend },
        avgSatisfaction: { value: avgSatisfaction, trend: satisfactionTrend },
      },
      charts: {
        revenueTrend,
        userGrowth,
      },
    },
  });
});
