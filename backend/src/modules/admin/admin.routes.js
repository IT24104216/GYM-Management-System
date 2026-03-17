import { Router } from 'express';
import {
  getAdminReportsOverview,
  deleteUser,
  getAdminStats,
  getAdminStatus,
  getUserById,
  getUsers,
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

export { router as adminRouter };
