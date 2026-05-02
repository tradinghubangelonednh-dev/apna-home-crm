import { Router } from 'express';

import {
  completeSettlement,
  createSettlement,
  listSettlements,
  sendSettlementReminder
} from '../controllers/settlementController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', listSettlements);
router.post('/', createSettlement);
router.patch('/:settlementId/complete', completeSettlement);
router.post('/:settlementId/remind', sendSettlementReminder);

export default router;
