import type { Query, QueryInitializer } from "convex/server";

import { addWeeks, subMonths } from "date-fns";

import type { DataModel, Doc, Id } from "~/convex/_generated/dataModel";
import type { MutationCtx } from "~/convex/_generated/server";
import type {
  AccountType,
  FullRole,
  Importance,
  NotificationType,
} from "~/convex/schema";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "~/convex/_generated/server";
import schema, { fullRoleValidator } from "~/convex/schema";
import { doc } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";

type UserPrefsDoc = Doc<"userPreferences">;
type Notifications = NonNullable<UserPrefsDoc["notifications"]>;
type InAppPrefs = Notifications["inAppNotifications"];

export function isNotificationEnabled(
  prefs: InAppPrefs,
  type: Doc<"notifications">["type"],
): boolean {
  if (Object.keys(prefs).length === 0) return false;
  let enabled: boolean = false;
  console.log("prefs: ", prefs);
  switch (type) {
    // public
    case "newEvent":
      enabled = prefs.events ?? false;
      break;
    case "newOpenCall":
      enabled = prefs.openCalls ?? false;
      break;
    case "newResource":
      enabled = prefs.resources ?? false;
      break;
    case "account":
      enabled = prefs.account ?? false;
      break;

    // admin
    case "newSubmission":
      enabled = prefs.submissions ?? false;
      break;
    case "newTaskAssignment":
    case "newSac":
      enabled = prefs.tasks ?? false;
      break;

    // online events
    case "newOERegistration":
      enabled = prefs.onlineEvents?.registrations ?? false;
      break;
    case "newOECancellation":
      enabled = prefs.onlineEvents?.cancellations ?? false;
      break;

    // support
    case "newSupport":
      enabled = prefs.support?.ticketCreated ?? false;
      break;
    case "supportUpdated":
      enabled = prefs.support?.ticketUpdated ?? false;
      break;

    // social
    case "newSocial":
      enabled = prefs.social?.scheduled ?? false;
      break;
    case "socialUpdated":
      enabled = prefs.social?.unscheduled ?? false;
      break;

    // newsletter
    case "campaignCreated":
      enabled = prefs.newsletter?.campaign.created ?? false;
      break;
    case "campaignCompleted":
      enabled = prefs.newsletter?.campaign.completed ?? false;
      break;
    case "campaignFailed":
      enabled = prefs.newsletter?.campaign.failed ?? false;
      break;
    case "audienceSubscribed":
      enabled = prefs.newsletter?.audience.subscribed ?? false;
      break;
    case "audienceUnsubscribed":
      enabled = prefs.newsletter?.audience.unsubscribed ?? false;
      break;

    // other – decide if these should be controlled by prefs or always on
    case "newMessage":
    case "newFollow":
    case "newResponse":
    case "newApplication":
      enabled = false;
      break;
  }
  console.log("enabled: ", enabled, type);
  return enabled;
}

export async function cloneNotificationForUser(
  ctx: MutationCtx,
  notification: Doc<"notifications">,
  userId: Id<"users">,
) {
  const { _id, _creationTime, userId: _oldUserId, ...rest } = notification;
  await ctx.db.insert("notifications", {
    ...rest,
    userId,
    dismissed: true,
    updatedAt: Date.now(),
  });
}

export const unarchiveNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) return null;
    const dedupeKey = notification.dedupeKey;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", dedupeKey))
      .collect();
    if (notifications.length === 0)
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Notification not found",
      });
    if (notifications.length === 1) {
      await ctx.db.patch(notification._id, {
        dismissed: false,
        updatedAt: Date.now(),
      });
    } else {
      const userNotifications = notifications.filter((n) => n.userId);

      for (const userNotification of userNotifications) {
        await ctx.db.delete("notifications", userNotification._id);
      }
    }
  },
});

export const clearNotificationsBatch = internalMutation({
  args: v.object({
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
    mode: v.union(v.literal("user"), v.literal("role")),
    role: v.optional(fullRoleValidator),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const { cursor, numItems, mode, role, userId } = args;

    const tableQuery: QueryInitializer<DataModel["notifications"]> =
      ctx.db.query("notifications");

    let indexedQuery: Query<DataModel["notifications"]> = tableQuery;

    if (mode === "user") {
      indexedQuery = tableQuery.withIndex(
        "by_userId_dismissed_updatedAt",
        (q) => q.eq("userId", userId).eq("dismissed", false),
      );
    } else {
      if (!role) return { cursor: null, isDone: true };
      indexedQuery = tableQuery.withIndex(
        "by_role_userId_dismissed_updatedAt",
        (q) =>
          q.eq("targetRole", role).eq("userId", null).eq("dismissed", false),
      );
    }

    const { page, isDone, continueCursor } = await indexedQuery.paginate({
      cursor,
      numItems,
    });

    for (const notification of page) {
      if (mode === "user") {
        if (notification.userId) {
          await ctx.db.patch(notification._id, {
            dismissed: true,
            updatedAt: Date.now(),
          });
        } else {
          await cloneNotificationForUser(ctx, notification, userId);
        }
      } else {
        if (!notification.userId) {
          await cloneNotificationForUser(ctx, notification, userId);
        }
      }
    }

    return { cursor: continueCursor, isDone };
  },
});

const MAX_BATCHES = 10;
export const clearAllNotificationsForCurrentUser = internalAction({
  args: {
    user: doc(schema, "users"),
  },
  handler: async (ctx, args) => {
    const { user } = args;
    const userRoles = user.role;
    const extendedRoles: FullRole = [...userRoles, "all"];

    {
      let cursor: string | null = null;
      let isDone = false;
      let batches = 0;

      while (!isDone && batches < MAX_BATCHES) {
        const res: { cursor: string | null; isDone: boolean } =
          await ctx.runMutation(
            internal.general.notifications.clearNotificationsBatch,
            {
              mode: "user",
              userId: user._id,
              cursor,
              numItems: 100,
            },
          );
        cursor = res.cursor;
        isDone = res.isDone;
        batches++;
      }
      if (!isDone) {
        throw new Error("clearAllNotifications: exceeded max batches for user");
      }
    }

    for (const role of extendedRoles) {
      let cursor: string | null = null;
      let isDone = false;
      let batches = 0;

      while (!isDone && batches < MAX_BATCHES) {
        const res: { cursor: string | null; isDone: boolean } =
          await ctx.runMutation(
            internal.general.notifications.clearNotificationsBatch,
            {
              mode: "role",
              role,
              userId: user._id,
              cursor,
              numItems: 100,
            },
          );
        cursor = res.cursor;
        isDone = res.isDone;
        batches++;
      }
      if (!isDone) {
        throw new Error(
          `clearAllNotifications: exceeded max batches for role ${role}`,
        );
      }
    }
  },
});

export const clearNotifications = mutation({
  args: {
    notificationId: v.optional(v.id("notifications")),
  },
  handler: async (ctx, args) => {
    const { notificationId } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    if (notificationId) {
      const notification = await ctx.db.get(notificationId);
      if (!notification) return null;

      if (notification.userId) {
        await ctx.db.patch(notificationId, {
          dismissed: true,
          updatedAt: Date.now(),
        });
      } else {
        await cloneNotificationForUser(ctx, notification, userId);
      }
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.general.notifications.clearAllNotificationsForCurrentUser,
        { user },
      );
    }

    return null;
  },
});
export const getNotifications = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!userPrefs) return null;
    const inAppNotifications =
      userPrefs.notifications?.inAppNotifications ?? {};
    const oneMonthAgo = subMonths(new Date(), 1).getTime();

    const userRoles = user.role;
    const extendedRoles: FullRole = [...userRoles, "all"];
    const [userNotifications, roleResults, dismissedNotifications] =
      await Promise.all([
        ctx.db
          .query("notifications")
          .withIndex("by_userId_dismissed_updatedAt", (q) =>
            q
              .eq("userId", userId)
              .eq("dismissed", false)
              .gte("updatedAt", oneMonthAgo),
          )
          .order("desc")
          .take(50),
        Promise.all(
          extendedRoles.map((role) =>
            ctx.db
              .query("notifications")
              .withIndex("by_role_userId_dismissed_updatedAt", (q) =>
                q
                  .eq("targetRole", role)
                  .eq("userId", null)
                  .eq("dismissed", false)
                  .gte("updatedAt", oneMonthAgo),
              )
              .order("desc")
              .take(50),
          ),
        ),

        ctx.db
          .query("notifications")
          .withIndex("by_userId_dismissed_updatedAt", (q) =>
            q.eq("userId", userId).eq("dismissed", true),
          )
          .order("desc")
          .take(50),
      ]);

    const roleNotifications = roleResults.flat();
    const dismissedDedupeKeys = new Set(
      dismissedNotifications.map((n) => n.dedupeKey),
    );

    const filterNotifications = (srcArray: Doc<"notifications">[]) =>
      srcArray.filter(
        (n) =>
          !dismissedDedupeKeys.has(n.dedupeKey) &&
          (n.minPlan ?? 0) <= (user.plan ?? 0) &&
          isNotificationEnabled(inAppNotifications, n.type),
      );

    const dedupeNotifications = (
      notifications: Doc<"notifications">[],
    ): Doc<"notifications">[] => {
      const map = new Map<string, Doc<"notifications">>();

      for (const n of notifications) {
        const existing = map.get(n.dedupeKey);

        if (!existing) {
          map.set(n.dedupeKey, n);
          continue;
        }

        if (existing.userId === null && n.userId !== null) {
          map.set(n.dedupeKey, n);
          continue;
        }

        if (existing.userId === n.userId && n.updatedAt > existing.updatedAt) {
          map.set(n.dedupeKey, n);
        }
      }

      return Array.from(map.values());
    };

    const filteredActiveNotifications = filterNotifications([
      ...roleNotifications,
      ...userNotifications,
    ]);

    const dedupedActiveNotifications = dedupeNotifications(
      filteredActiveNotifications,
    );

    return {
      userNotifications: dedupedActiveNotifications,
      dismissedNotifications,
    };
  },
});

export async function upsertNotification(
  ctx: MutationCtx,
  notification: {
    type: NotificationType;
    userId: Id<"users"> | null;
    targetRole: FullRole[number];
    targetUserType?: AccountType[number];
    importance: Importance;
    minPlan?: number;
    deadline?: number;
    displayText: string;
    redirectUrl: string;
    dedupeKey: string;
  },
) {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();
  const oneWeekFromToday = addWeeks(today, 1).getTime();
  const outputDedupeKey = `${notification.dedupeKey}-${month}-${day}`;
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", outputDedupeKey))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      ...notification,
      dedupeKey: `${notification.dedupeKey}-${month}-${day}`,
      dismissed: false,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("notifications", {
      ...notification,
      dedupeKey: `${notification.dedupeKey}-${month}-${day}`,
      deadline: notification.deadline ?? oneWeekFromToday,
      dismissed: false,
      updatedAt: Date.now(),
    });
  }
}
