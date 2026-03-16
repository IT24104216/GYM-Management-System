import { Router } from 'express';
import {
  createExerciseCategoryItem,
  createWorkoutPlan,
  deleteExerciseCategoryItem,
  deleteWorkoutPlan,
  getExerciseCategories,
  getworkoutsStatus,
  getWorkoutPlans,
  getWorkoutRequests,
  updateExerciseCategoryItem,
  updateWorkoutPlan,
} from './workouts.controller.js';

const router = Router();

router.get('/', getworkoutsStatus);
router.get('/requests', getWorkoutRequests);
router.get('/plans', getWorkoutPlans);
router.post('/plans', createWorkoutPlan);
router.put('/plans/:id', updateWorkoutPlan);
router.delete('/plans/:id', deleteWorkoutPlan);
router.get('/categories', getExerciseCategories);
router.post('/categories', createExerciseCategoryItem);
router.put('/categories/:id', updateExerciseCategoryItem);
router.delete('/categories/:id', deleteExerciseCategoryItem);

export { router as workoutsRouter };
