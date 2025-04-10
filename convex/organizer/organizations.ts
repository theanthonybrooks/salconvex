import { filter } from "convex-helpers/server/filter";
import { ConvexError, v } from "convex/values";

import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "~/convex/_generated/dataModel";
import { query } from "~/convex/_generated/server";

export const isNewOrg = query({
  args: {
    organizationName: v.string(),
  },
  handler: async (ctx, args) => {
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .unique();
    return existingOrg === null;
  },
});

// export const searchOrganizationsByName = query({
//   args: {
//     query: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const q = args.query.toLowerCase()
//     const all = await ctx.db.query("organizations").collect()

//     return all.filter((org) => org.organizationName?.toLowerCase().includes(q))
//   },
// })

export const getUserOrganizations = query({
  args: {
    query: v.string(), // keep required
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    const q = args.query.toLowerCase();
    const filterFn = (org: Doc<"organizations">) =>
      q === "" || org.name?.toLowerCase().includes(q);

    if (user?.role.includes("admin")) {
      const all = await ctx.db.query("organizations").collect();
      return all.filter(filterFn);
    }

    const orgs = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .collect();
    return orgs.filter(filterFn);
  },
});

//
//
// ------------------------- Check New Organization Validity -----------------------
//
//
export const isOwnerOrIsNewOrg = query({
  args: {
    organizationName: v.string(),
  },
  handler: async (ctx, args) => {
    const inputName = args.organizationName.trim().toLowerCase();

    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) return null;

    const isAdmin = user.role.includes("admin");

    if (isAdmin) return "userIsAdmin";

    // const owner = await ctx.db
    //   .query("organizations")
    //   .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
    //   .filter((q) => q.eq(q.field("organizationName"), args.organizationName))
    //   .unique()
    const owner = await filter(
      ctx.db
        .query("organizations")
        .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id)),
      (org) => org.name.toLowerCase() === inputName,
    ).unique();

    console.log("owner", owner);

    if (owner && owner.ownerId === user._id) return "ownedByUser";
    if (owner) throw new ConvexError("Organization already exists");

    // const org = await ctx.db
    //   .query("organizations")
    //   .withIndex("by_organizationName", (q) =>
    //     q.eq("organizationName", args.organizationName)
    //   )
    //   .unique()
    const org = await filter(
      ctx.db.query("organizations"),
      (org) => org.name.toLowerCase() === inputName,
    ).unique();

    console.log("org", org);
    console.log("user id", userId);

    if (org) throw new ConvexError("Organization already exists");

    console.log("if org");
    if (inputName === "") return null;

    console.log("else");
    return "available";
  },
});

const getAllOrganizations = query({
  handler: async (ctx) => {
    const allOrgs = await ctx.db.query("organizations").collect();
    return allOrgs;
  },
});

export const getEventsByOrgId = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const events = await ctx.db
      .query("eventOrganizers")
      .withIndex("by_organizerId", (q) => q.eq("organizerId", org._id))
      .collect();

    return events;
  },
});
