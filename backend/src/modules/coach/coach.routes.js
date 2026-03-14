import { Router } from 'express';
import { getcoachStatus } from './coach.controller.js';

const router = Router();

router.get('/', getcoachStatus);

export { router as coachRouter };
