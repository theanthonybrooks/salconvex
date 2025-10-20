//add functions here for organizers to handle/manage applications later
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "~/convex/_generated/server";

export const getOpenCallApplications = query({
  args: {
    openCallId: v.id("openCalls"),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) throw new ConvexError("User not found");

    const isAdmin = user.role?.includes("admin");
    const isOrganizer = userId === args.ownerId;

    if (!isAdmin && !isOrganizer) {
      throw new ConvexError("You don't have permission to view this");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_openCallId", (q) => q.eq("openCallId", args.openCallId))
      .collect();

    const totalsByDate = new Map<
      string,
      { applied: number; accepted: number; rejected: number }
    >();

    for (const app of applications) {
      const date = new Date(app._creationTime);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      const current = totalsByDate.get(dateKey) ?? {
        applied: 0,
        accepted: 0,
        rejected: 0,
      };

      if (app.applicationStatus === "applied") current.applied += 1;
      if (app.applicationStatus === "accepted") current.accepted += 1;
      if (app.applicationStatus === "rejected") current.rejected += 1;

      totalsByDate.set(dateKey, current);
    }

    const applicationChartData = Array.from(totalsByDate.entries()).map(
      ([date, counts]) => ({
        date,
        ...counts,
      }),
    );

    applicationChartData.sort((a, b) => a.date.localeCompare(b.date));

    return applicationChartData;
  },
});


export const getAllApplications = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user || !user.role?.includes("admin")) return null;

    const applications = await ctx.db.query("applications").collect();

    // Use a Map to aggregate by date
    const totalsByDate = new Map<
      string,
      { applied: number; accepted: number; rejected: number }
    >();

    for (const app of applications) {
      const date = new Date(app._creationTime);
      // Format: YYYY-MM-DD
      const dateKey = date.toISOString().split("T")[0];

      const current = totalsByDate.get(dateKey) ?? {
        applied: 0,
        accepted: 0,
        rejected: 0,
      };

      if (app.applicationStatus === "applied") current.applied += 1;
      if (app.applicationStatus === "accepted") current.accepted += 1;
      if (app.applicationStatus === "rejected") current.rejected += 1;

      totalsByDate.set(dateKey, current);
    }

    // Convert map to array
    const appChartData = Array.from(totalsByDate.entries()).map(
      ([date, counts]) => ({
        date,
        ...counts,
      }),
    );

    // Optional: sort by date
    appChartData.sort((a, b) => a.date.localeCompare(b.date));

    return appChartData;
  },
});
