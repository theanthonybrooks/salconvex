import { filter } from "convex-helpers/server/filter";
import { ConvexError, v } from "convex/values";

import { getAuthUserId } from "@convex-dev/auth/server";
import slugify from "slugify";
import { Doc } from "~/convex/_generated/dataModel";
import { mutation, query } from "~/convex/_generated/server";

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

export const createNewOrg = mutation({
  args: {
    organizationName: v.string(),
    logoId: v.optional(v.id("_storage")),
    logo: v.optional(v.string()),
    location: v.optional(
      v.object({
        full: v.optional(v.string()),
        locale: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        stateAbbr: v.optional(v.string()),
        region: v.optional(v.string()),
        country: v.string(),
        countryAbbr: v.string(),
        continent: v.string(),
        coordinates: v.optional(
          v.object({
            latitude: v.number(),
            longitude: v.number(),
          }),
        ),
        currency: v.optional(
          v.object({
            code: v.string(),
            name: v.string(),
            symbol: v.string(),
          }),
        ),
        demonym: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    let fileUrl = null;
    if (args.logoId) {
      fileUrl = await ctx.storage.getUrl(args.logoId);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // const org = await ctx.db
    //   .query("organizations")
    //   .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
    //   .filter((q) => q.eq(q.field("name"), args.organizationName))
    //   .unique();
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .unique();

    if (org) {
      const isOwner = org.ownerId === user._id;

      const userRole = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      // .then((user) => user?.role)

      const isAdmin = userRole && userRole?.role?.includes("admin");

      if (!isOwner && !isAdmin) {
        throw new ConvexError(
          "You don't have permission to update this organization",
        );
      }

      //logic to check if the user is the owner of the organization
      //if not, check if the user has a role of admin
      //if not, throw an error

      //if user is the owner and it exists, patch the organization (no duplicate organizations allowed)
      //if user is not the owner and is an admin, patch the organization (don't change the ownerId)
      //if user is not the owner and is not an admin, throw an error
      // else if org doesn't exist, create a new organization with current user as the ownerId

      //TODO: Ensure that at some point, you can also edit the organization name. Perhaps this won't be from the form, though, but rather the admin's dashboard. Makes more sense.

      await ctx.db.patch(org._id, {
        name: args.organizationName,
        slug: slugify(args.organizationName),
        logo: fileUrl || args.logo,
        location: args.location,
        updatedAt: Date.now(),
        lastUpdatedBy: userId,
      });

      if (args.location?.timezone && args.location?.timezoneOffset) {
        await ctx.db.patch(org._id, {
          location: {
            ...args.location,
            timezone: args.location.timezone,
            timezoneOffset: args.location.timezoneOffset,
          },
        });
      }

      return { orgId: org._id };
    }

    const orgId = await ctx.db.insert("organizations", {
      ownerId: user._id,
      name: args.organizationName,
      slug: slugify(args.organizationName),
      events: [],
      logo: fileUrl || "/1.jpg",
      location: args.location,
      hadFreeCall: false,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    });

    return { orgId };
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
