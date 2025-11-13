import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "~/convex/_generated/server";
import { v } from "convex/values";

export const getOrganizationStaff = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return { data: null, success: false, error: "Not authenticated" };
    const user = await ctx.db.get(userId);
    if (!user) return { data: null, success: false, error: "User not found" };

    const org = await ctx.db.get(args.orgId);
    if (!org) return { data: null, success: false, error: "Org not found" };

    const orgOwnerId = org.ownerId;
    if (orgOwnerId && orgOwnerId !== userId && !user.role.includes("admin")) {
      return { data: null, success: false, error: "User not authorized" };
    }
    const orgOwner = await ctx.db.get(orgOwnerId);

    const members = await ctx.db
      .query("orgStaff")
      .withIndex("by_orgId", (q) => q.eq("organizationId", args.orgId))
      .collect();

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          name: user?.name ?? "",
        };
      }),
    );

    return { data: enrichedMembers, success: true, error: null };
  },
});

// export const updateOrganizationStaff = mutation({
//   args: {
//     orgId: v.id("organizations"),
//     userId: v.id("users"),
//     role: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) return null;
//     const user = await ctx.db.get(userId);
//     if (!user) return null;

//     const org = await ctx.db.get(args.orgId);
//     if (!org) return null;

//     const orgOwner = org.ownerId;
//     if (orgOwner && orgOwner !== userId && !user.role.includes("admin")) {
//       return null;
//     }

//     const member = await ctx.db
//       .query("orgStaff")
//       .withIndex("by_orgId", (q) => q.eq("organizationId", args.orgId))
//       .first();

//     if (!member) return null;

//     await ctx.db.patch(member._id, {
//       role: args.role,
//       lastUpdatedAt: Date.now(),
//       lastUpdatedBy: userId,
//     });
//   },
// });
