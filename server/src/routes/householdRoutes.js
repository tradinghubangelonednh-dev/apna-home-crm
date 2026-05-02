import { Router } from 'express';

import {
  addMember,
  getHousehold,
  updateMemberRole
} from '../controllers/householdController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getHousehold);
router.post('/members', requireRole('admin'), addMember);
router.patch('/members/:memberId/role', requireRole('admin'), updateMemberRole);

export default router;
