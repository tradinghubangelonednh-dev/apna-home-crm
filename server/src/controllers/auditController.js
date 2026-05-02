import { AuditLog } from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const auditLogs = await AuditLog.find({ household: req.user.household })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ auditLogs });
});
