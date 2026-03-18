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
import { authenticateJWT } from '../../shared/middleware/auth/authenticateJWT.js';
import { authorizeRoles } from '../../shared/middleware/auth/authorizeRoles.js';
import { requireOwnership } from '../../shared/middleware/auth/requireOwnership.js';

const router = Router();

router.get('/', getmealPlansStatus);

router.use(authenticateJWT);

router.get(
  '/user-plan',
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'query', key: 'userId' }], allowRoles: ['admin'] }),
  getUserActiveDietPlan,
);
router.get('/nutrition/search', authorizeRoles('admin', 'user', 'dietitian', 'coach'), searchNutritionFoods);
router.get(
  '/food-logs',
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'query', key: 'userId' }], allowRoles: ['admin'] }),
  getUserFoodLogs,
);
router.post(
  '/food-logs',
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'body', key: 'userId' }], allowRoles: ['admin'] }),
  createUserFoodLog,
);
router.put(
  '/food-logs/:id',
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'query', key: 'userId' }], allowRoles: ['admin'] }),
  updateUserFoodLog,
);
router.delete(
  '/food-logs/:id',
  authorizeRoles('admin', 'user'),
  requireOwnership({ checks: [{ from: 'query', key: 'userId' }], allowRoles: ['admin'] }),
  deleteUserFoodLog,
);

router.get(
  '/library',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  getMealLibraryItems,
);
router.post(
  '/library',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'body', key: 'dietitianId' }], allowRoles: ['admin'] }),
  createMealLibraryItem,
);
router.put(
  '/library/:id',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  updateMealLibraryItem,
);
router.delete(
  '/library/:id',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  deleteMealLibraryItem,
);

router.get(
  '/client-plans',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  getDietPlans,
);
router.post(
  '/client-plans',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'body', key: 'dietitianId' }], allowRoles: ['admin'] }),
  upsertDietPlan,
);
router.put(
  '/client-plans/:id',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  updateDietPlan,
);
router.patch(
  '/client-plans/:id/submit',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  submitDietPlan,
);
router.delete(
  '/client-plans/:id',
  authorizeRoles('admin', 'dietitian'),
  requireOwnership({ checks: [{ from: 'query', key: 'dietitianId' }], allowRoles: ['admin'] }),
  deleteDietPlan,
);

export { router as mealPlansRouter };
