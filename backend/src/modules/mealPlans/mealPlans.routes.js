import { Router } from 'express';
import {
  createUserFoodLog,
  createMealLibraryItem,
  deleteUserFoodLog,
  deleteDietPlan,
  deleteMealLibraryItem,
  getDietPlans,
  getUserFoodLogs,
  getMealLibraryItems,
  getmealPlansStatus,
  getUserActiveDietPlan,
  searchNutritionFoods,
  submitDietPlan,
  updateUserFoodLog,
  updateDietPlan,
  updateMealLibraryItem,
  upsertDietPlan,
} from './mealPlans.controller.js';

const router = Router();

router.get('/', getmealPlansStatus);
router.get('/user-plan', getUserActiveDietPlan);
router.get('/nutrition/search', searchNutritionFoods);
router.get('/food-logs', getUserFoodLogs);
router.post('/food-logs', createUserFoodLog);
router.put('/food-logs/:id', updateUserFoodLog);
router.delete('/food-logs/:id', deleteUserFoodLog);

router.get('/library', getMealLibraryItems);
router.post('/library', createMealLibraryItem);
router.put('/library/:id', updateMealLibraryItem);
router.delete('/library/:id', deleteMealLibraryItem);

router.get('/client-plans', getDietPlans);
router.post('/client-plans', upsertDietPlan);
router.put('/client-plans/:id', updateDietPlan);
router.patch('/client-plans/:id/submit', submitDietPlan);
router.delete('/client-plans/:id', deleteDietPlan);

export { router as mealPlansRouter };
