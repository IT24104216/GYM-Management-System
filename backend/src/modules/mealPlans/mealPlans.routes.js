import { Router } from 'express';
import { getmealPlansStatus } from './mealPlans.controller.js';

const router = Router();

router.get('/', getmealPlansStatus);

export { router as mealPlansRouter };
