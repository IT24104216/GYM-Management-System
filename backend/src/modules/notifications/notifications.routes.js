import { Router } from 'express';
import { getnotificationsStatus } from './notifications.controller.js';

const router = Router();

router.get('/', getnotificationsStatus);

export { router as notificationsRouter };
