import {
  SOCIAL_NOTIFICATION_TYPES,
  SUB_NOTIFICATION_TYPES,
} from "@/constants/notificationConsts";

import type { NotificationItemType } from "@/types/notificationTypes";

import type { NotificationType } from "~/convex/schema";

export type ExtendedNotificationType =
  | NotificationType
  | "all"
  | "subscription"
  | "socials";

const GROUPS = {
  subscription: SUB_NOTIFICATION_TYPES,
  socials: SOCIAL_NOTIFICATION_TYPES,
} as const;

type GroupKey = keyof typeof GROUPS;

function isGroupKey(value: ExtendedNotificationType): value is GroupKey {
  return value in GROUPS;
}

export function filterNotificationsByType(
  notifications: NotificationItemType[],
  filterType: ExtendedNotificationType,
): NotificationItemType[] {
  if (filterType === "all") return notifications;

  if (isGroupKey(filterType)) {
    const allowed = new Set<NotificationType>(GROUPS[filterType]);
    return notifications.filter((n) => allowed.has(n.type));
  }

  return notifications.filter((n) => n.type === filterType);
}
