import { supportEmail } from "@/constants/siteInfo";

import {
  EventCategory,
  EventData,
  SubmissionFormState,
} from "@/types/eventTypes";
import { Organizer } from "@/types/organizer";

import slugify from "slugify";

import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "~/convex/_generated/dataModel";
import {
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "~/convex/_generated/server";
import { linksValidator, locationFullFields } from "~/convex/schema";
import { filter } from "convex-helpers/server/filter";
import { ConvexError, v } from "convex/values";

const genericEmailDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
  "live.com",
];

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
  const user = await ctx.db.get(userId);
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
    await ctx.db.patch(org._id, {
      ownerId: adminUserId,
      updatedAt: Date.now(),
      lastUpdatedBy: user?.name ?? "deleted user",
    });
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
  orgEmailDomain: string | undefined;
  orgDomain: string | undefined;
  emailDomain: string | undefined;
  domainsMatch: boolean | undefined;
}> {
  let orgDomain: string | undefined;
  let orgEmailDomain: string | undefined;
  const emailDomain = email?.split("@")[1]?.toLowerCase();
  const slug = slugify(organizationName, { lower: true, strict: true });
  console.log(emailDomain, slug);

  const existingOrg = await ctx.db
    .query("organizations")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  let orgOwnerIsAdmin: boolean | undefined = undefined;
  let emailMatches = false;
  if (existingOrg) {
    const orgOwnerId = existingOrg.ownerId;
    const orgEmail = existingOrg.links?.email?.toLowerCase();
    orgDomain = existingOrg.links?.website?.toLowerCase();

    emailMatches = typeof orgEmail === "string" && orgEmail === email;
    orgEmailDomain = orgEmail?.split("@")[1].toLowerCase();
    const orgOwner = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", orgOwnerId))
      .unique();
    orgOwnerIsAdmin = orgOwner?.role?.includes("admin");
  }
  const websiteMatch =
    typeof orgDomain === "string" && orgDomain.includes(emailDomain ?? "");

  const domainsMatch =
    (typeof orgEmailDomain === "string" &&
      (!genericEmailDomains.includes(orgEmailDomain) || emailMatches) &&
      orgEmailDomain === emailDomain) ||
    websiteMatch;

  return {
    isNew: existingOrg === null,
    orgOwnerId: existingOrg?.ownerId,
    orgId: existingOrg?._id,
    orgOwnerIsAdmin,
    orgEmailDomain,
    orgDomain,
    emailDomain,
    domainsMatch,
  };
}

// export const getIsOrgOwner = query({
//   args: {
//     orgId: v.id("organizations"),
//     userId: v.id("users"),
//   },
//   handler: async (ctx, args) => {
//     const org = await ctx.db.get(args.orgId);
//     if (!org) return false;
//     const ownerId = org.ownerId;
//     const user = await ctx.db.get(args.userId);
//     if (!user) return false;
//     return ownerId === user._id;
//   },
// });

export const getOrgContactInfo = query({
  args: {
    orgId: v.id("organizations"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;
    const userIsAdmin = user.role.includes("admin");
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;
    const orgOwnerId = org?.ownerId;
    if (!orgOwnerId) return null;
    const orgOwner = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", orgOwnerId))
      .unique();
    if (!orgOwner) return null;

    const idMatch = userId === orgOwnerId;
    const emailMatch =
      typeof user.email === "string" && user.email === orgOwner.email;

    const contactEmail = userIsAdmin ? org.links?.email : orgOwner.email;
    return {
      orgOwnerEmail: contactEmail,
      emailMatch,
      orgOwnerId,
      idMatch,
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
      orgEmailDomain,
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
        const orgOwner = orgOwnerId
          ? await ctx.db
              .query("users")
              .withIndex("by_id", (q) => q.eq("_id", orgOwnerId))
              .unique()
          : null;

        if (!orgOwner)
          throw new ConvexError({
            message:
              "An admin already exists for this organization. Please contact us for additional admins.",
            contactUrl: supportEmail,
          });

        // console.log("orgOwner", orgOwner);
        // console.log("orgOwner.email", orgOwner.email);
        // console.log("args.email", args.email);
        const orgOwnerEmail = orgOwner?.email;
        return orgOwnerEmail === args.email;
      }
    } else if (
      genericEmailDomains.includes(orgEmailDomain ?? "") &&
      emailDomain === orgEmailDomain
    ) {
      // throw new ConvexError(
      //   "Please contact us to add you to this organization. We're unable to automatically verify you using a Gmail account.",
      // );
      throw new ConvexError({
        message:
          "Please contact us to add you to this organization. We're unable to automatically verify you without an organization email.",
        contactUrl: supportEmail,
      });
    } else if (
      genericEmailDomains.includes(orgEmailDomain ?? "") &&
      emailDomain !== orgEmailDomain
    ) {
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

    location: v.optional(
      v.object({
        ...locationFullFields,
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

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }
    const isAdmin = user?.role?.includes("admin");
    const userAccountTypes = user?.accountType ?? [];

    if (!userAccountTypes.includes("organizer") && !isAdmin) {
      const userLog = await ctx.db
        .query("userLog")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      await ctx.db.patch(userId, {
        accountType: [...user.accountType, "organizer"],
        updatedAt: Date.now(),
      });
      if (userLog) {
        await ctx.db.patch(userLog._id, {
          accountTypes: [...userLog.accountTypes, "organizer"],
        });
      } else {
        console.error("userLog not found for userId: ", userId);
      }
    }

    const org = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .unique();

    if (org) {
      const isOwner = org.ownerId === userId;

      if (!isOwner && !isAdmin) {
        throw new ConvexError(
          "You don't have permission to update this organization",
        );
      }
      await ctx.db.patch(org._id, {
        name: args.organizationName,
        slug: slugify(args.organizationName, { lower: true, strict: true }),
        logo: fileUrl || org.logo || "/1.jpg",
        logoStorageId: args.logoStorageId || org.logoStorageId,
        location: args.location || org.location,
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
    logoStorageId: v.optional(v.id("_storage")),
    location: v.optional(
      v.object({
        ...locationFullFields,
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
        organizerTitle: v.optional(v.string()),
        primaryContact: v.string(),
      }),
    ),
    links: v.optional(linksValidator),
    lastUpdatedBy: v.optional(v.string()),
    name: v.string(),
    slug: v.string(),
    isComplete: v.boolean(),
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

    await ctx.db.patch(organization._id, {
      name: args.name.trim(),
      slug: args.slug,
      logo: args.logo,
      ...(args.logoStorageId && { logoStorageId: args.logoStorageId }),
      location: {
        ...args.location,
        country: args.location?.country ?? "",
        countryAbbr: args.location?.countryAbbr ?? "",
        continent: args.location?.continent ?? "",
      },
      about: args.about,
      contact: {
        organizer: args.contact?.organizer,
        organizerTitle: args.contact?.organizerTitle,
        primaryContact: args.contact?.primaryContact || "",
      },
      links: sanitizedLinks,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
      isComplete: args.isComplete,
    });

    const updatedOrg = await ctx.db.get(organization._id);

    if (!updatedOrg) {
      throw new ConvexError("Organization not found");
    }
    const eventLookupOrgEvents = await ctx.db
      .query("eventLookup")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", updatedOrg._id))
      .collect();
    const eventLookupOrgIds = eventLookupOrgEvents.map((e) => e._id);
    await Promise.all(
      eventLookupOrgIds.map(async (id) => {
        await ctx.db.patch(id, {
          mainOrgId: updatedOrg._id,
          orgName: updatedOrg.name,
          ownerId: updatedOrg.ownerId,
          orgSlug: updatedOrg.slug,
          orgLocation: updatedOrg.location,
        });
      }),
    );

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

    const user = await ctx.db.get(userId);
    if (!user) return null;

    if (user?.role.includes("admin")) {
      // const all = await ctx.db.query("organizations").collect();
      // return all.filter(filterFn);
      const all = await ctx.db
        .query("organizations")
        .withSearchIndex("search_by_name", (q) =>
          q.search("name", args.query.trim().toLowerCase()),
        )
        .collect();

      const filteredResults = all.filter((org) =>
        org?.name?.toLowerCase().includes(args.query?.toLowerCase()),
      );
      return filteredResults;
    } else {
      // const orgs = await ctx.db
      //   .query("organizations")
      //   .withIndex("by_name_ownerId", (q) =>
      //     q.eq("name", args.query.trim().toLowerCase()).eq("ownerId", user._id),
      //   )
      //   .order("asc")
      //   .collect();
      const orgs = await ctx.db
        .query("organizations")
        .withSearchIndex("search_by_name", (q) =>
          q
            .search("name", args.query.trim().toLowerCase())
            .eq("ownerId", user._id),
        )
        .collect();
      const filteredResults = orgs.filter((org) =>
        org?.name?.toLowerCase().includes(args.query?.toLowerCase()),
      );
      const sortedOrgs = filteredResults.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      return sortedOrgs;
    }
  },
});

export const getUserOrgEvents = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const isOrganizer = user.accountType?.includes("organizer");
    if (!isOrganizer) return null;

    const orgs = await ctx.db
      .query("organizations")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();
    const completeOrgs = orgs.filter((org) => org.isComplete === true);

    const orgIds = completeOrgs.map((org) => org._id);

    const orgsWithEvents = [];
    for (const orgId of orgIds) {
      const event = await ctx.db
        .query("events")
        .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", orgId))
        .first();
      if (event) {
        orgsWithEvents.push(orgId);
      }
    }

    const hasOrgEvents = orgsWithEvents.length > 0;
    return { orgsWithEvents, hasOrgEvents, orgIds };
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

    const owner = await ctx.db
      .query("organizations")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.organizationName).eq("ownerId", user._id),
      )
      .first();

    if (owner && owner.ownerId === user._id) return "ownedByUser";
    if (owner) throw new ConvexError("Organization already exists");

    const org = await filter(
      ctx.db.query("organizations"),
      (org) => org.name.toLowerCase() === inputName,
    ).unique();

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
      const user = await ctx.db.get(userId);

      if (!user) return null;

      const orgOwner = organizer?.ownerId;
      if (orgOwner && orgOwner === user._id) {
        userIsOrganizer = true;
      }
    }

    // console.log(organizer);

    if (!organizer)
      throw new ConvexError(`No organizer found for ${args.slug}`);

    if (organizer.isComplete === false) {
      if (userIsOrganizer) {
        throw new ConvexError(`Organizer is not complete for ${args.slug}`);
      }
      throw new ConvexError(`No organizer found for ${args.slug}`);
    }
    const [publishedEvents, archivedEvents] = await Promise.all([
      ctx.db
        .query("events")
        .withIndex("by_mainOrgId_and_state", (q) =>
          q.eq("mainOrgId", organizer._id).eq("state", "published"),
        )
        .collect(),
      ctx.db
        .query("events")
        .withIndex("by_mainOrgId_and_state", (q) =>
          q.eq("mainOrgId", organizer._id).eq("state", "archived"),
        )
        .collect(),
    ]);

    const rawEvents = [...publishedEvents, ...archivedEvents];

    events = rawEvents.map((e) => ({
      ...e,
      isUserOrg: userIsOrganizer,
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
    const user = await ctx.db.get(userId);

    if (!user) return false;

    const event = await ctx.db
      .query("events")
      .withIndex("by_slug_edition", (q) =>
        q.eq("slug", args.eventSlug).eq("dates.edition", args.edition),
      )
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
