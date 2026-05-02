import { Router } from 'express';

import { listAuditLogs } from '../controllers/auditController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('admin'), listAuditLogs);

export default router;
