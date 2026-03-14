import { Router } from 'express';
import { getappointmentsStatus } from './appointments.controller.js';

const router = Router();

router.get('/', getappointmentsStatus);

export { router as appointmentsRouter };
