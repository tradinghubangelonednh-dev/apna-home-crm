import { Router } from 'express';

import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense
} from '../controllers/expenseController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', listExpenses);
router.post('/', createExpense);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

export default router;
