import { Router } from 'express';
import { login, logout, refresh, register } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

export { router as authRouter };
