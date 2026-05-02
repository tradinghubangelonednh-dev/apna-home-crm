import { Router } from 'express';

import { exportDashboardPdf, exportExpensesCsv } from '../controllers/exportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/expenses.csv', exportExpensesCsv);
router.get('/dashboard.pdf', exportDashboardPdf);

export default router;
