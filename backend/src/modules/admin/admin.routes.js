import { Router } from 'express';
import { getadminStatus } from './admin.controller.js';

const router = Router();

router.get('/', getadminStatus);

export { router as adminRouter };
