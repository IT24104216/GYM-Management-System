import { Router } from 'express';
import {
  deleteCoachProfile,
  getcoachStatus,
  getCoachProfile,
  getPublicCoaches,
  upsertCoachProfile,
} from './coach.controller.js';
import {
  createCoachSlot,
  deleteCoachSlot,
  listCoachSlots,
  updateCoachSlot,
} from './coachScheduling.controller.js';

const router = Router();

router.get('/', getcoachStatus);
router.get('/public', getPublicCoaches);
router.get('/profile/:coachId', getCoachProfile);
router.put('/profile/:coachId', upsertCoachProfile);
router.delete('/profile/:coachId', deleteCoachProfile);
router.get('/scheduling/:coachId', listCoachSlots);
router.post('/scheduling/:coachId', createCoachSlot);
router.put('/scheduling/:coachId/:slotId', updateCoachSlot);
router.delete('/scheduling/:coachId/:slotId', deleteCoachSlot);

export { router as coachRouter };
