import { Router } from 'express';
import { getworkoutsStatus } from './workouts.controller.js';

const router = Router();

router.get('/', getworkoutsStatus);

export { router as workoutsRouter };
