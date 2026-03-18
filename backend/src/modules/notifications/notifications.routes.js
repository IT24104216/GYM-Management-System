import { Router } from 'express';
import {
  getnotificationsStatus,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications.controller.js';

const router = Router();

router.get('/', getnotificationsStatus);
router.get('/list', getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

export { router as notificationsRouter };
