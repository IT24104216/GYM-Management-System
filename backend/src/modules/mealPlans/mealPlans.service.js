import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { AppError } from '../../shared/errors/AppError.js';
import { User } from '../users/users.model.js';

export const ensureDietitianExists = async (dietitianId) => {
  const dietitian = await User.findOne({ _id: dietitianId, role: 'dietitian' }).select('_id');
  if (!dietitian) {
    throw new AppError('Dietitian not found', HTTP_STATUS.NOT_FOUND);
  }
};

export const ensureUserExists = async (userId) => {
  const user = await User.findById(userId).select('_id');
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }
};

export const hasAtLeastOneMealName = (payload) => {
  const sections = [payload.breakfast, payload.lunch, payload.dinner, payload.snacks];
  return sections.some((section) =>
    Array.isArray(section) && section.some((option) => String(option?.mealName || '').trim().length > 0));
};

export const getScopedUserId = (req, fallbackUserId = '') => {
  const role = String(req.user?.role || '');
  const authUserId = String(req.user?.id || '');
  if (role === 'admin') return String(fallbackUserId || '');
  if (role === 'user') return authUserId;
  return String(fallbackUserId || '');
};

export const getScopedDietitianId = (req, fallbackDietitianId = '') => {
  const role = String(req.user?.role || '');
  const authUserId = String(req.user?.id || '');
  if (role === 'admin') return String(fallbackDietitianId || '');
  if (role === 'dietitian') return authUserId;
  return String(fallbackDietitianId || '');
};

export const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const sectionMap = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];
