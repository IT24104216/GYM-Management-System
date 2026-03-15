import { Router } from 'express';
import {
  createDietitianSlot,
  deleteDietitianProfile,
  deleteDietitianSlot,
  getdietitianStatus,
  getDietitianProfile,
  getPublicDietitians,
  listDietitianSlots,
  updateDietitianSlot,
  upsertDietitianProfile,
} from './dietitian.controller.js';

const router = Router();

router.get('/', getdietitianStatus);
router.get('/public', getPublicDietitians);
router.get('/profile/:dietitianId', getDietitianProfile);
router.put('/profile/:dietitianId', upsertDietitianProfile);
router.delete('/profile/:dietitianId', deleteDietitianProfile);
router.get('/scheduling/:dietitianId', listDietitianSlots);
router.post('/scheduling/:dietitianId', createDietitianSlot);
router.put('/scheduling/:dietitianId/:slotId', updateDietitianSlot);
router.delete('/scheduling/:dietitianId/:slotId', deleteDietitianSlot);

export { router as dietitianRouter };
