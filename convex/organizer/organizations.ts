import { filter } from "convex-helpers/server/filter";
import { ConvexError, v } from "convex/values";

import { supportEmail } from "@/constants/siteInfo";
import { EventCategory, EventData, SubmissionFormState } from "@/types/event";
import { Organizer } from "@/types/organizer";
import { getAuthUserId } from "@convex-dev/auth/server";
import slugify from "slugify";
import { Doc, Id } from "~/convex/_generated/dataModel";
import {
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "~/convex/_generated/server";

export async function updateOrgOwner(
  ctx: MutationCtx,
  orgId: Id<"organizations">,
  userId: Id<"users">,
  updatedBy?: Id<"users">,
) {
  await ctx.db.patch(orgId, {
    ownerId: userId,
    updatedAt: Date.now(),
    lastUpdatedBy: updatedBy ?? userId,
  });
}

export async function updateOrgOwnerBeforeDelete(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  if (!userId) return;
  const adminUser = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", ["admin"]))
    .first();
  const adminUserId = adminUser?._id as Id<"users">;
  const userOrgs = await ctx.db
    .query("organizations")
    .withIndex("by_complete_with_ownerId", (q) =>
      q.eq("isComplete", true).eq("ownerId", userId),
    )
    .collect();
  for (const org of userOrgs) {
    await updateOrgOwner(ctx, org._id, adminUserId, userId);
  }
}

export async function checkOrgStatus(
  ctx: QueryCtx,
  organizationName: string,
  email?: string,
): Promise<{
  isNew: boolean;
  orgId: Id<"organizations"> | undefined;
  orgOwnerId: Id<"users"> | undefined;
  orgOwnerIsAdmin: boolean | undefined;
  orgDomain: string | undefined;
  emailDomain: string | undefined;
  domainsMatch: boolean | undefined;
}> {
  let orgDomain: string | undefined;
  const emailDomain = email?.split("@")[1]?.toLowerCase();
  const slug = slugify(organizationName, { lower: true, strict: true });

  const existingOrg = await ctx.db
    .query("organizations")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  let orgOwnerIsAdmin: boolean | undefined = undefined;
  let emailMatches = false;
  if (existingOrg) {
    const orgOwnerId = existingOrg.ownerId;
    const orgEmail = existingOrg.links?.email?.toLowerCase();
    emailMatches = typeof orgEmail === "string" && orgEmail === email;
    orgDomain = orgEmail?.split("@")[1].toLowerCase();
    const orgOwner = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", orgOwnerId))
      .unique();
    orgOwnerIsAdmin = orgOwner?.role?.includes("admin");
  }

  const domainsMatch =
    typeof orgDomain === "string" &&
    (orgDomain !== "gmail.com" || emailMatches) &&
    orgDomain === emailDomain;

  return {
    isNew: existingOrg === null,
    orgOwnerId: existingOrg?.ownerId,
    orgId: existingOrg?._id,
    orgOwnerIsAdmin,
    orgDomain,
    emailDomain,
    domainsMatch,
  };
}

export const getOrgContactInfo = query({
  args: {
    orgId: v.id("organizations"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;
    const orgOwner = org?.ownerId;
    if (!orgOwner) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", orgOwner))
      .unique();
    if (!user) return null;
    return {
      orgOwnerEmail: user.email,
      eventName: event.name,
    };
  },
});

export const isNewOrg = query({
  args: {
    organizationName: v.string(),
    email: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // console.log("args", args);
    const results = await checkOrgStatus(
      ctx,
      args.organizationName,
      args.email,
    );
    const {
      isNew,
      orgOwnerId,
      orgOwnerIsAdmin,
      orgDomain,
      emailDomain,
      domainsMatch,
    } = results;

    // console.log("isNew", isNew);
    // console.log("orgOwnerIsAdmin", orgOwnerIsAdmin);
    // console.log("orgDomain", orgDomain);
    // console.log("emailDomain", emailDomain);
    // console.log("domainsMatch", domainsMatch);

    if (domainsMatch) {
      if (orgOwnerIsAdmin) {
        return true;
      } else {
        let orgOwnerEmail: string | undefined = undefined;
        // console.log("orgOwnerId", orgOwnerId);
        if (orgOwnerId) {
          const orgOwner = await ctx.db
            .query("users")
            .withIndex("by_id", (q) => q.eq("_id", orgOwnerId))
            .unique();
          console.log("orgOwner", orgOwner);
          if (orgOwner) {
            // console.log("orgOwner", orgOwner);
            // console.log("orgOwner.email", orgOwner.email);
            // console.log("args.email", args.email);
            orgOwnerEmail = orgOwner.email;
            return orgOwnerEmail === args.email;
          }
        }
        console.log("orgOwnerEmail", orgOwnerEmail);

        throw new ConvexError({
          message:
            "An admin already exists for this organization. Please contact us for additional admins.",
          contactUrl: supportEmail,
        });
      }
    } else if (orgDomain === "gmail.com" && emailDomain === "gmail.com") {
      // throw new ConvexError(
      //   "Please contact us to add you to this organization. We're unable to automatically verify you using a Gmail account.",
      // );
      throw new ConvexError({
        message:
          "Please contact us to add you to this organization. We're unable to automatically verify you using a Gmail account.",
        contactUrl: supportEmail,
      });
    } else if (orgDomain === "gmail.com" && emailDomain !== "gmail.com") {
      // throw new ConvexError(
      //   "Please contact us to add you to this organization. We need to verify your email address before you can be added.",
      // );
      throw new ConvexError({
        message:
          "Please contact us to add you to this organization. We need to verify your email address before you can be added.",
        contactUrl: supportEmail,
      });
    } else {
      return isNew;
    }
  },
});

export const createNewOrg = mutation({
  args: {
    organizationName: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
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
            format: v.optional(v.string()),
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
    if (args.logoStorageId) {
      fileUrl = await ctx.storage.getUrl(args.logoStorageId);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }
    const userAccountTypes = user?.accountType ?? [];

    if (!userAccountTypes.includes("organizer")) {
      const userSub = await ctx.db
        .query("userSubscriptions")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .first();

      const userHadTrial = userSub?.hadTrial || false;

      const userLog = await ctx.db
        .query("userLog")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .unique();

      await ctx.db.patch(user._id, {
        accountType: [...user.accountType, "organizer"],
        updatedAt: Date.now(),
      });
      if (!userLog) {
        await ctx.db.insert("userLog", {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          active: true,
          banned: false,
          hadTrial: userHadTrial,
          bannedReason: undefined,
          bannedTimestamp: undefined,
          banningAuthority: undefined,
          deleted: false,
          deletedReason: undefined,
          deletedTimestamp: undefined,
          deletedBy: undefined,
          accountTypes: ["organizer"],
          userEmail: user.email,
        });
      } else {
        await ctx.db.patch(userLog._id, {
          accountTypes: [...userLog.accountTypes, "organizer"],
        });
      }
    }

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
        slug: slugify(args.organizationName, { lower: true, strict: true }),
        logo: fileUrl || args.logo,
        logoStorageId: args.logoStorageId,
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
      const updatedOrg = await ctx.db.get(org._id);
      return { orgId: org._id, org: updatedOrg, fileUrl };
    }

    const orgId = await ctx.db.insert("organizations", {
      ownerId: user._id,
      name: args.organizationName,
      slug: slugify(args.organizationName, { lower: true, strict: true }),
      events: [],
      logo: fileUrl || "/1.jpg",
      logoStorageId: args.logoStorageId,
      location: args.location,
      hadFreeCall: false,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
      isComplete: false,
    });

    const newOrg = await ctx.db.get(orgId);
    return { orgId, org: newOrg };
  },
});

export const getOrgById = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;
    return org;
  },
});

export const markOrganizationComplete = mutation({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    console.log(args);
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    await ctx.db.patch(org._id, {
      isComplete: true,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    });
  },
});

export const updateOrganization = mutation({
  args: {
    orgId: v.id("organizations"),
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
        continent: v.optional(v.string()),
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
            format: v.optional(v.string()),
          }),
        ),
        demonym: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
      }),
    ),
    about: v.optional(v.string()),
    contact: v.optional(
      v.object({
        organizer: v.optional(v.string()),
        primaryContact: v.string(),
      }),
    ),
    links: v.optional(
      v.object({
        website: v.optional(v.string()),
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
        threads: v.optional(v.string()),
        email: v.optional(v.string()),
        vk: v.optional(v.string()),
        youTube: v.optional(v.string()),
        phone: v.optional(v.string()),
        linkAggregate: v.optional(v.string()),
        other: v.optional(v.string()),
      }),
    ),
    lastUpdatedBy: v.optional(v.string()),
    name: v.string(),
    slug: v.string(),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }
    //TODO: Include check for user role or ownership of the org
    const organization = await ctx.db.get(args.orgId);
    let primaryContactForm = null;

    if (!organization) {
      throw new ConvexError("Organization not found");
    }
    const sanitizedLinks = {
      ...args.links,
      email:
        args.links?.email?.trim() === "none@mail.com"
          ? undefined
          : args.links?.email,
    };

    let orgIsComplete = false;
    if (organization.isComplete !== true) {
      if (args.isComplete === true) {
        orgIsComplete = true;
      }
    }

    await ctx.db.patch(organization._id, {
      name: args.name.trim(),
      slug: args.slug,
      logo: args.logo,
      location: {
        ...args.location,
        country: args.location?.country ?? "",
        countryAbbr: args.location?.countryAbbr ?? "",
        continent: args.location?.continent ?? "",
      },
      about: args.about,
      contact: {
        organizer: args.contact?.organizer,
        primaryContact: args.contact?.primaryContact || "",
      },
      links: sanitizedLinks,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
      isComplete: orgIsComplete,
    });

    const updatedOrg = await ctx.db.get(organization._id);

    if (!updatedOrg) {
      throw new ConvexError("Organization not found");
    }
    return { orgId: updatedOrg._id, org: updatedOrg };
  },
});

export const deleteOrganization = mutation({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const isAdmin = user?.role?.includes("admin");

    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    if (!isAdmin) {
      throw new ConvexError(
        "You don't have permission to delete this organization",
      );
    }

    await ctx.db.delete(args.orgId);
    const events = await ctx.db
      .query("events")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", org._id))
      .collect();

    for (const event of events) {
      await ctx.db.patch(event._id, {
        state: "archived",
        lastEditedAt: Date.now(),
        approvedBy: userId,
      });
    }
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

    const q = args.query.trim().toLowerCase();
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

    // console.log("owner", owner);

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

    // console.log("org", org);
    // console.log("user id", userId);

    if (org) throw new ConvexError("Organization already exists");

    // console.log("if org");
    if (inputName === "") return null;

    // console.log("else");
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

export const getOrganizerBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let events = null;
    let userIsOrganizer = false;
    const organizer = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    // console.log("userId: ", userId);
    if (userId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (!user) return null;

      const orgOwner = organizer?.ownerId;
      if (orgOwner && orgOwner === user._id) {
        userIsOrganizer = true;
      }
    }

    // console.log(organizer);

    if (!organizer) throw new ConvexError("No organizer found");

    if (organizer.isComplete === false) {
      if (userIsOrganizer) {
        throw new ConvexError("Organizer is not complete");
      }
      throw new ConvexError("No organizer found");
    }
    const rawEvents = await ctx.db
      .query("events")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", organizer._id))
      .collect();

    events = rawEvents.map((e) => ({
      ...e,
      category: e.category as EventCategory,
      state: e.state as SubmissionFormState,
      type: Array.isArray(e.type) ? e.type.slice(0, 2) : [],
    })) as EventData[];

    // console.log(events);

    return { organizer: organizer as Organizer, events };
  },
});

export const checkIfOrgOwner = query({
  args: {
    eventSlug: v.string(),
    edition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) return false;

    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.eventSlug))
      .filter((q) => q.eq(q.field("dates.edition"), args.edition))
      .first();

    if (!event) return false;

    const org = await ctx.db
      .query("organizations")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .first();

    if (!org) return false;
    return org.ownerId === userId;
  },
});
