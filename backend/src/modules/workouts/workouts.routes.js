import { Router } from 'express';
import {
  createExerciseCategoryItem,
  createWorkoutPlan,
  deleteExerciseCategoryItem,
  deleteWorkoutPlan,
  finishWorkoutSession,
  getExerciseCategories,
  getworkoutsStatus,
  getWorkoutPlans,
  getWorkoutRequests,
  startWorkoutSession,
  submitWorkoutPlan,
  updateExerciseCategoryItem,
  updateWorkoutSessionProgress,
  updateWorkoutPlan,
} from './workouts.controller.js';

const router = Router();

router.get('/', getworkoutsStatus);
router.get('/requests', getWorkoutRequests);
router.get('/plans', getWorkoutPlans);
router.post('/plans', createWorkoutPlan);
router.put('/plans/:id', updateWorkoutPlan);
router.patch('/plans/:id/submit', submitWorkoutPlan);
router.post('/plans/:id/session/start', startWorkoutSession);
router.patch('/plans/:id/session/progress', updateWorkoutSessionProgress);
router.patch('/plans/:id/session/finish', finishWorkoutSession);
router.delete('/plans/:id', deleteWorkoutPlan);
router.get('/categories', getExerciseCategories);
router.post('/categories', createExerciseCategoryItem);
router.put('/categories/:id', updateExerciseCategoryItem);
router.delete('/categories/:id', deleteExerciseCategoryItem);

export { router as workoutsRouter };
