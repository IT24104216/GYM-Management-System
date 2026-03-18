import { Router } from 'express';
import {
  getCoachMemberScores,
  getProgressStatus,
  getUserProgressScore,
  getUserProgress,
  upsertUserMeasurement,
} from './progress.controller.js';

const router = Router();

router.get('/', getProgressStatus);
router.get('/coach/:coachId/member-scores', getCoachMemberScores);
router.get('/:userId/score', getUserProgressScore);
router.get('/:userId', getUserProgress);
router.put('/:userId/measurements', upsertUserMeasurement);

export { router as progressRouter };
