import { Router } from 'express';
import {
  deleteCoachProfile,
  getcoachStatus,
  getCoachProfile,
  getPublicCoaches,
  upsertCoachProfile,
} from './coach.controller.js';

const router = Router();

router.get('/', getcoachStatus);
router.get('/public', getPublicCoaches);
router.get('/profile/:coachId', getCoachProfile);
router.put('/profile/:coachId', upsertCoachProfile);
router.delete('/profile/:coachId', deleteCoachProfile);

export { router as coachRouter };
