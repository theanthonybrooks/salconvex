import type { FunctionReturnType } from "convex/server";

import type { api } from "~/convex/_generated/api";

type NotificationItemsType = FunctionReturnType<
  typeof api.general.notifications.getNotifications
>;
export type NotificationItemType =
  NonNullable<NotificationItemsType>["userNotifications"][number];
