import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "~/convex/_generated/server";

export const getStaffUsers = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.role?.includes("admin")) return null;
    const staffUsersData = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "staff"))
      .collect();

    const staffUsers = (
      await Promise.all(staffUsersData.map((staff) => ctx.db.get(staff.userId)))
    ).filter((user) => user !== null);

    return staffUsers;
  },
});
