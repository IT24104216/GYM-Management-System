import { Router } from 'express';
import {
  createLocker,
  createLockerBookingRequest,
  deleteLocker,
  getLockers,
  getLockerBookings,
  getlockersStatus,
  updateLocker,
  updateLockerBookingStatus,
} from './lockers.controller.js';

const router = Router();

router.get('/', getlockersStatus);

router.get('/list', getLockers);
router.post('/list', createLocker);
router.put('/list/:id', updateLocker);
router.delete('/list/:id', deleteLocker);

router.get('/bookings', getLockerBookings);
router.post('/bookings', createLockerBookingRequest);
router.patch('/bookings/:id/status', updateLockerBookingStatus);

export { router as lockersRouter };
