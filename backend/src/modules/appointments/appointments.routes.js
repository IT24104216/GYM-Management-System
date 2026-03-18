import { Router } from 'express';
import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from './appointments.controller.js';
import { authenticateJWT } from '../../shared/middleware/auth/authenticateJWT.js';
import { authorizeRoles } from '../../shared/middleware/auth/authorizeRoles.js';
import { requireOwnership } from '../../shared/middleware/auth/requireOwnership.js';

const router = Router();

const enforceAppointmentScope = (req, res, next) => {
  const role = String(req.user?.role || '');
  const authUserId = String(req.user?.id || '');
  if (!role || !authUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (role === 'admin') return next();

  const query = req.query || {};
  if (role === 'user' && query.userId && String(query.userId || '') !== authUserId) {
    return res.status(403).json({ message: 'Forbidden: userId scope mismatch' });
  }
  if (role === 'coach' && query.coachId && String(query.coachId || '') !== authUserId) {
    return res.status(403).json({ message: 'Forbidden: coachId scope mismatch' });
  }
  if (role === 'dietitian' && query.dietitianId && String(query.dietitianId || '') !== authUserId) {
    return res.status(403).json({ message: 'Forbidden: dietitianId scope mismatch' });
  }
  return next();
};

router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'user', 'coach', 'dietitian'), enforceAppointmentScope, getAppointments);
router.get('/:id', authorizeRoles('admin', 'user', 'coach', 'dietitian'), getAppointmentById);
router.post(
  '/',
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'body', key: 'userId' }], allowRoles: ['admin'] }),
  createAppointment,
);
router.patch('/:id', authorizeRoles('admin', 'user'), updateAppointment);
router.patch('/:id/status', authorizeRoles('admin', 'coach', 'dietitian'), updateAppointmentStatus);
router.delete('/:id', authorizeRoles('admin', 'user'), deleteAppointment);

export { router as appointmentsRouter };
