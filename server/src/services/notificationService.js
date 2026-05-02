import { Notification } from '../models/Notification.js';
import { emitHouseholdEvent } from '../config/socket.js';

export async function createNotifications({
  householdId,
  userIds,
  type,
  title,
  message,
  metadata = {}
}) {
  const uniqueUserIds = [...new Set(userIds.map((userId) => userId.toString()))];

  if (!uniqueUserIds.length) {
    return [];
  }

  const notifications = await Notification.insertMany(
    uniqueUserIds.map((userId) => ({
      household: householdId,
      user: userId,
      type,
      title,
      message,
      metadata
    }))
  );

  emitHouseholdEvent(householdId, 'notifications:changed', {
    householdId: householdId.toString(),
    count: notifications.length
  });

  return notifications;
}
