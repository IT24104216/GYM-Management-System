import { Router } from 'express';
import {
  getProgressStatus,
  getUserProgress,
  upsertUserMeasurement,
} from './progress.controller.js';

const router = Router();

router.get('/', getProgressStatus);
router.get('/:userId', getUserProgress);
router.put('/:userId/measurements', upsertUserMeasurement);

export { router as progressRouter };

