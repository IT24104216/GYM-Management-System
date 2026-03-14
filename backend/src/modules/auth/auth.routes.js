import { Router } from 'express';
import { getauthStatus } from './auth.controller.js';

const router = Router();

router.get('/', getauthStatus);

export { router as authRouter };
