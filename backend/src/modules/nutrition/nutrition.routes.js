import { Router } from 'express';
import { authenticateJWT } from '../../shared/middleware/auth/authenticateJWT.js';
import { authorizeRoles } from '../../shared/middleware/auth/authorizeRoles.js';
import { searchNutritionFoods } from './nutrition.controller.js';

const router = Router();

router.get('/search', authenticateJWT, authorizeRoles('admin', 'user', 'coach', 'dietitian'), searchNutritionFoods);

export { router as nutritionRouter };

