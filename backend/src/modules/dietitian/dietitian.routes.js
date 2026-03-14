import { Router } from 'express';
import { getdietitianStatus } from './dietitian.controller.js';

const router = Router();

router.get('/', getdietitianStatus);

export { router as dietitianRouter };
