import { Router } from 'express';
import { authenticateJWT } from '../../shared/middleware/auth/authenticateJWT.js';
import { authorizeRoles } from '../../shared/middleware/auth/authorizeRoles.js';
import { requireOwnership } from '../../shared/middleware/auth/requireOwnership.js';
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

router.put(
  '/profile/:dietitianId',
  authenticateJWT,
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'params', key: 'dietitianId' }], allowRoles: ['admin'] }),
  upsertDietitianProfile,
);
router.delete(
  '/profile/:dietitianId',
  authenticateJWT,
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'params', key: 'dietitianId' }], allowRoles: ['admin'] }),
  deleteDietitianProfile,
);
router.get('/scheduling/:dietitianId', listDietitianSlots);
router.post(
  '/scheduling/:dietitianId',
  authenticateJWT,
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'params', key: 'dietitianId' }], allowRoles: ['admin'] }),
  createDietitianSlot,
);
router.put(
  '/scheduling/:dietitianId/:slotId',
  authenticateJWT,
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'params', key: 'dietitianId' }], allowRoles: ['admin'] }),
  updateDietitianSlot,
);
router.delete(
  '/scheduling/:dietitianId/:slotId',
  authenticateJWT,
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'params', key: 'dietitianId' }], allowRoles: ['admin'] }),
  deleteDietitianSlot,
);

export { router as dietitianRouter };
