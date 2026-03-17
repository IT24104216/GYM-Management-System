import { Router } from 'express';
import {
  createPromotion,
  deletePromotion,
  getPromotions,
  getPromotionsStatus,
  getPublicPromotions,
  updatePromotion,
} from './promotions.controller.js';

const router = Router();

router.get('/', getPromotionsStatus);
router.get('/public', getPublicPromotions);
router.get('/list', getPromotions);
router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

export { router as promotionsRouter };

