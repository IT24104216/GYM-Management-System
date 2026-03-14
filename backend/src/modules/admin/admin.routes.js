import { Router } from 'express';
import {
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

export { router as adminRouter };
