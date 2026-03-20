import { Router } from 'express';
import { authenticateJWT } from '../../shared/middleware/auth/authenticateJWT.js';
import { authorizeRoles } from '../../shared/middleware/auth/authorizeRoles.js';
import { requireOwnership } from '../../shared/middleware/auth/requireOwnership.js';
import {
  getCoachMemberScores,
  getProgressStatus,
  getUserProgressScore,
  getUserProgress,
  upsertUserMeasurement,
} from './progress.controller.js';

const router = Router();

router.get('/', getProgressStatus);
router.get(
  '/coach/:coachId/member-scores',
  authenticateJWT,
  authorizeRoles('admin', 'coach'),
  requireOwnership({ checks: [{ from: 'params', key: 'coachId' }], allowRoles: ['admin'] }),
  getCoachMemberScores,
);
router.get(
  '/:userId/score',
  authenticateJWT,
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'params', key: 'userId' }], allowRoles: ['admin'] }),
  getUserProgressScore,
);
router.get(
  '/:userId',
  authenticateJWT,
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'params', key: 'userId' }], allowRoles: ['admin'] }),
  getUserProgress,
);
router.put(
  '/:userId/measurements',
  authenticateJWT,
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'params', key: 'userId' }], allowRoles: ['admin'] }),
  upsertUserMeasurement,
);

export { router as progressRouter };
