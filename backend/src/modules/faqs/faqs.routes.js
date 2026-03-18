import { Router } from 'express';
import {
  createFaq,
  deleteFaq,
  getFaqs,
  getfaqsStatus,
  updateFaq,
} from './faqs.controller.js';

const router = Router();

router.get('/', getfaqsStatus);
router.get('/list', getFaqs);
router.post('/list', createFaq);
router.put('/list/:id', updateFaq);
router.delete('/list/:id', deleteFaq);

export { router as faqsRouter };
