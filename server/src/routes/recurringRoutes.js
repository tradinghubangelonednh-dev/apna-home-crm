import { Router } from 'express';

import {
  createRecurringExpense,
  listRecurringExpenses,
  runRecurringExpenses,
  toggleRecurringExpense,
  updateRecurringExpense
} from '../controllers/recurringController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', listRecurringExpenses);
router.post('/', createRecurringExpense);
router.put('/:recurringId', updateRecurringExpense);
router.patch('/:recurringId/toggle', toggleRecurringExpense);
router.post('/run', runRecurringExpenses);

export default router;
