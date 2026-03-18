import { Router } from 'express';
import {
  createFeedback,
  deleteFeedback,
  getfeedbacksStatus,
  getFeedbacks,
  updateFeedback,
} from './feedbacks.controller.js';

const router = Router();

router.get('/', getfeedbacksStatus);
router.get('/list', getFeedbacks);
router.post('/', createFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export { router as feedbacksRouter };
