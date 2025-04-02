import { filter } from "convex-helpers/server/filter";
import { v } from "convex/values";

import { getAuthUserId } from "@convex-dev/auth/server";
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
    const filterFn = (org: any) =>
      q === "" || org.organizationName?.toLowerCase().includes(q);

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
    if (owner) return "ownedByOther";

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

    if (org) return "orgNameExists";

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
