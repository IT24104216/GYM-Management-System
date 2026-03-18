import { Router } from 'express';
import {
  changeAdminPassword,
  getAdminSettings,
  getAdminReportsOverview,
  deleteUser,
  getAdminStats,
  getAdminStatus,
  getUserById,
  getUsers,
  updateAdminSettings,
  updateUser,
} from './admin.controller.js';

const router = Router();

router.get('/', getAdminStatus);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getAdminStats);
router.get('/reports/overview', getAdminReportsOverview);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);
router.put('/settings/password', changeAdminPassword);

export { router as adminRouter };
