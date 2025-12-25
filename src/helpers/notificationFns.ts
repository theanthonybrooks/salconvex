import type { NotificationItemType } from "@/types/notificationTypes";

import type { NotificationType } from "~/convex/schema";

type ExtendedNotificationType = NotificationType | "all";
export function filterNotificationsByType(
  notifications: NotificationItemType[],
  filterType: ExtendedNotificationType,
) {
  if (filterType === "all") return notifications;
  return notifications.filter((n) => n.type === filterType);
}
