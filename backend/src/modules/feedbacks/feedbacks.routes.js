import { Router } from 'express';
import { authenticateJWT } from '../../shared/middleware/auth/authenticateJWT.js';
import { authorizeRoles } from '../../shared/middleware/auth/authorizeRoles.js';
import { requireOwnership } from '../../shared/middleware/auth/requireOwnership.js';
import {
  createFeedback,
  deleteFeedback,
  getfeedbacksStatus,
  getFeedbacks,
  updateFeedback,
} from './feedbacks.controller.js';

const router = Router();

router.get('/', getfeedbacksStatus);
router.get('/list', getFeedbacks);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'body', key: 'ownerId' }], allowRoles: ['admin'] }),
  createFeedback,
);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'body', key: 'ownerId' }], allowRoles: ['admin'] }),
  updateFeedback,
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'body', key: 'ownerId' }], allowRoles: ['admin'] }),
  deleteFeedback,
);

export { router as feedbacksRouter };
