import { randomNotificationType } from "@/constants/notificationConsts";

import { internalMutation } from "~/convex/_generated/server";

export const init = internalMutation(async (ctx) => {
  const existing = await ctx.db.query("notifications").collect();
  if (existing.length >= 205) return;

  const firstCreator = await ctx.db
    .query("userRoles")
    .withIndex("by_role", (q) => q.eq("role", "creator"))
    .first();

  for (let count = existing.length; count < 205; count++) {
    const random = Math.random();

    await ctx.db.insert("notifications", {
      type: randomNotificationType(),
      userId: random <= 0.5 ? (firstCreator?.userId ?? null) : null,
      //   userId: firstCreator?.userId ?? null,
      //   userId: null,
      targetRole: random > 0.5 ? "admin" : random <= 0.3 ? "user" : "all",
      //   targetRole: "admin",
      targetUserType: undefined,
      // random <= 0.3 ? "artist" : random > 0.7 ? "organizer" : undefined,
      importance: random <= 0.3 ? "low" : random > 0.7 ? "medium" : "high",
      displayText: "Random placeholder notification",
      redirectUrl: "/thelist/notifications",
      dedupeKey: `placeholder-${count}`,
      dismissed: false,
      updatedAt: Date.now(),
    });
  }
});
