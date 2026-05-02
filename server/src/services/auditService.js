import { AuditLog } from '../models/AuditLog.js';

export async function recordAuditLog({
  householdId,
  userId,
  entityType,
  entityId,
  action,
  before = null,
  after = null
}) {
  return AuditLog.create({
    household: householdId,
    user: userId,
    entityType,
    entityId,
    action,
    before,
    after
  });
}
