import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../lib/format';

export function AuditLogPanel({ auditLogs }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
          Audit Logs
        </p>
        <h2 className="mt-2 font-display text-4xl">Who changed what.</h2>
      </div>

      {auditLogs.length ? (
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <Card key={log._id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold">
                    {log.user?.name} {log.action.replace('_', ' ')} {log.entityType}
                  </p>
                  <p className="mt-1 text-sm text-app-charcoal/58">
                    {log.after?.title || log.after?.memberId || log.before?.title || 'Household action'}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/45">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No audit entries"
          description="Edits, deletes, and role changes will be tracked here for admins."
        />
      )}
    </div>
  );
}
