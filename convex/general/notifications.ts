import type { Query, QueryInitializer } from "convex/server";

import { subMonths } from "date-fns";

import type { DataModel, Doc, Id } from "~/convex/_generated/dataModel";
import type { MutationCtx } from "~/convex/_generated/server";
import type {
  AccountType,
  Importance,
  NotificationType,
  UserRole,
} from "~/convex/schema";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "~/convex/_generated/server";
import schema, { userRoleValidator } from "~/convex/schema";
import { doc } from "convex-helpers/validators";
import { v } from "convex/values";

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

export const clearNotificationsBatch = internalMutation({
  args: v.object({
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
    mode: v.union(v.literal("user"), v.literal("role")),
    role: v.optional(userRoleValidator),
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
        (q) => q.eq("userId", userId),
      );
    } else {
      if (!role) return { cursor: null, isDone: true };
      indexedQuery = tableQuery.withIndex("by_role_dismissed_updatedAt", (q) =>
        q.eq("targetRole", role).eq("dismissed", false),
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

export const clearAllNotificationsForCurrentUser = internalAction({
  args: {
    user: doc(schema, "users"),
  },
  handler: async (ctx, args) => {
    const { user } = args;
    const userRoles = user.role;

    {
      let cursor: string | null = null;
      let isDone = false;

      while (!isDone) {
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
      }
    }

    for (const role of userRoles) {
      let cursor: string | null = null;
      let isDone = false;

      while (!isDone) {
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
    const oneMonthAgo = subMonths(new Date(), 1).getTime();

    const userRoles = user.role;
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
          userRoles.map((role) =>
            ctx.db
              .query("notifications")
              .withIndex("by_role_dismissed_updatedAt", (q) =>
                q
                  .eq("targetRole", role)
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
          (n.minPlan ?? 0) <= (user.plan ?? 0),
      );

    const filteredUserNotifications = filterNotifications(userNotifications);
    const filteredRoleNotifications = filterNotifications(roleNotifications);

    return {
      userNotifications: filteredUserNotifications,
      roleNotifications: filteredRoleNotifications,
      dismissedNotifications,
    };
  },
});

export async function upsertNotification(
  ctx: MutationCtx,
  notification: {
    type: NotificationType;
    userId: Id<"users"> | null;
    targetRole: UserRole[number];
    targetUserType?: AccountType[number];
    importance: Importance;
    minPlan?: number;
    deadline?: number;
    displayText: string;
    redirectUrl: string;
    dedupeKey: string;
  },
) {
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const outputDedupeKey = `${notification.dedupeKey}-${month}-${day}`;
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", outputDedupeKey))
    .first();

  console.log(existing);

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
      dismissed: false,
      updatedAt: Date.now(),
    });
  }
}
