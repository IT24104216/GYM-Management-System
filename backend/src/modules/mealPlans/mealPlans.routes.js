import { Router } from 'express';
import {
  createMealLibraryItem,
  deleteDietPlan,
  deleteMealLibraryItem,
  getDietPlans,
  getMealLibraryItems,
  getmealPlansStatus,
  submitDietPlan,
  updateDietPlan,
  updateMealLibraryItem,
  upsertDietPlan,
} from './mealPlans.controller.js';

const router = Router();

router.get('/', getmealPlansStatus);

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
