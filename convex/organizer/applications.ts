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
    const isAdmin = user?.role?.includes("admin");
    const isOrganizer = userId === args.ownerId;

    if (!isAdmin || !isOrganizer) {
      throw new ConvexError("You don't have permission to view this");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_openCallId", (q) => q.eq("openCallId", args.openCallId))
      .collect();

    const applicationChartData = applications.map((application) => {
      const date = new Date(application._creationTime);
      return {
        date: date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate(),
        applied: application.applicationStatus === "applied" ? 1 : 0,
        accepted: application.applicationStatus === "accepted" ? 1 : 0,
        rejected: application.applicationStatus === "rejected" ? 1 : 0,
      };
    });

    return applicationChartData;
  },
});
