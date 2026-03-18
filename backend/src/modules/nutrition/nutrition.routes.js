import { Router } from 'express';
import { searchNutritionFoods } from './nutrition.controller.js';

const router = Router();

router.get('/search', searchNutritionFoods);

export { router as nutritionRouter };

