import { Bell, CheckCheck } from 'lucide-react';

import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../lib/format';

export function NotificationsPanel({ notifications, onMarkRead, onMarkAllRead }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
            Notifications
          </p>
          <h2 className="mt-2 font-display text-4xl">Keep the house in sync.</h2>
        </div>
        <Button variant="secondary" onClick={onMarkAllRead}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification._id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div
                    className={`mt-1 rounded-2xl p-3 ${
                      notification.readAt ? 'bg-app-sand/50 text-app-charcoal/45' : 'bg-app-mint/25 text-app-teal'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-app-charcoal/58">{notification.message}</p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-app-charcoal/45">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
                {!notification.readAt ? (
                  <Button size="sm" variant="ghost" onClick={() => onMarkRead(notification._id)}>
                    Mark read
                  </Button>
                ) : (
                  <span className="rounded-full bg-app-sand/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
                    Read
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications"
          description="Expense updates and reminders will show up here."
        />
      )}
    </div>
  );
}
