import { Migrations } from "@convex-dev/migrations";
import {
  eventsAggregate,
  openCallsAggregate,
} from "~/convex/aggregates/eventAggregates.js";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

//NOTE: (TO RUN THIS MIGRATION)
// FOR PRODUCTION:
//  npx convex run migrations:runUpdatePublic --prod
// FOR DEVELOPMENT:
//  npx convex run migrations:runUpdatePublic
//  npx convex run migrations:
// note-to-self: this will force it to run again
// pnpm convex run migrations:runPEL2 '{cursor: null}'
// pnpm convex run migrations:runPEL2 '{cursor: null}' --prod

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

function needsLowercase(value: string): boolean {
  return value !== value.toLowerCase();
}

export const convertAllEmailsToLowerCase = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    const userEmail = user.email;
    const lowerCased = userEmail.toLowerCase();
    if (!needsLowercase(userEmail)) return;
    await ctx.db.patch(user._id, { email: lowerCased });
    const authAccount = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", user._id).eq("provider", "password"),
      )
      .first();
    if (!authAccount) return;
    await ctx.db.patch(authAccount._id, {
      emailVerified: lowerCased,
      providerAccountId: lowerCased,
    });
    const userSub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_userId_paidStatus", (q) =>
        q.eq("userId", user._id).eq("paidStatus", true),
      )
      .first();
    if (!userSub) return;
    const subMetadata = userSub.metadata ?? {};
    await ctx.db.patch(userSub._id, {
      metadata: { ...subMetadata, userEmail: lowerCased },
    });
  },
});

export const runCAETL = migrations.runner(
  internal.migrations.convertAllEmailsToLowerCase,
);

export const transferFromMailchimpContacts = migrations.define({
  table: "mailchimpContacts",
  migrateOne: async (ctx, mailchimpContact) => {
    const newsletterSubscriber = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) =>
        q.eq("email", mailchimpContact.EMAIL_ADDRESS),
      )
      .first();
    if (newsletterSubscriber) return;
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", mailchimpContact.EMAIL_ADDRESS))
      .first();
    const userData = {
      userId: user?._id ?? null,
      firstName: user?.firstName ?? mailchimpContact.FIRST_NAME,
      email: user?.email ?? mailchimpContact.EMAIL_ADDRESS,
      newsletter: true,
      type: ["general"] as "general"[],
      frequency: "monthly" as "monthly",
      userPlan: user?.plan ?? 0,
      timesAttempted: 0,
      lastAttempt: 0,
      temporary: true,
    };
    await ctx.db.insert("newsletter", userData);
  },
});

export const runTFMC = migrations.runner(
  internal.migrations.transferFromMailchimpContacts,
);

// export const backfillNewsletterUserId = migrations.define({
//   table: "newsletter",
//   migrateOne: async (ctx, newsletter) => {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("email", (q) => q.eq("email", newsletter.email))
//       .first();
//     if (!user) return;

//     await ctx.db.patch(newsletter._id, { userId: user._id });
//   },
// });

// export const runBNUI = migrations.runner(
//   internal.migrations.backfillNewsletterUserId,
// );

export const removeCurrencyFromUserPrefsWithoutSubs = migrations.define({
  table: "userPreferences",
  migrateOne: async (ctx, userPref) => {
    const user = await ctx.db.get(userPref.userId);
    if (!user) {
      await ctx.db.delete(userPref._id);
      return;
    }
    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();
    const activeSub =
      subscription?.status === "active" || subscription?.status === "trialing";
    if (activeSub) return;
    await ctx.db.patch(userPref._id, {
      currency: undefined,
    });
  },
});

export const runRCU = migrations.runner(
  internal.migrations.removeCurrencyFromUserPrefsWithoutSubs,
);

export const backfillKanbanCardAssignments = migrations.define({
  table: "todoKanban",
  migrateOne: async (ctx, card) => {
    //check to see if the card already has an assignedId
    if (card.assignedId) return;
    //should find the first user with a userRole of creator (the roles are in a field with an array of strings)
    const creator = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "creator"))
      .first();
    if (!creator) return;

    await ctx.db.patch(card._id, {
      assignedId: creator.userId,
    });
  },
});

export const runBKAC = migrations.runner(
  internal.migrations.backfillKanbanCardAssignments,
);

export const populateEventLookupLoc = migrations.define({
  table: "eventLookup",
  migrateOne: async (ctx, eventLookup) => {
    const event = await ctx.db.get(eventLookup.eventId);
    const org = await ctx.db.get(eventLookup.mainOrgId);
    if (!org || !org?.location || !event) return;
    await ctx.db.patch(eventLookup._id, {
      orgLocation: org.location,
      orgSlug: org.slug,
      locationFull: event.location?.full,
      countryAbbr: event.location?.countryAbbr,
    });
  },
});

export const runELL = migrations.runner(
  internal.migrations.populateEventLookupLoc,
);

export const populateUserRoles = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    if (Array.isArray(user.role)) {
      for (const role of user.role) {
        await ctx.db.insert("userRoles", {
          userId: user._id,
          role,
        });
      }
    }
  },
});

export const populateAppFees = migrations.define({
  table: "eventLookup",
  migrateOne: async (ctx, lookup) => {
    if (lookup.openCallId) {
      if (lookup.appFee) return;
      const openCall = await ctx.db.get(lookup.openCallId);
      if (openCall) {
        await ctx.db.patch(lookup._id, {
          appFee: openCall.basicInfo.appFee,
        });
      }
    }
  },
});

export const runPAF = migrations.runner(internal.migrations.populateAppFees);

export const populateUserAccountTypes = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    if (Array.isArray(user.accountType)) {
      for (const accountType of user.accountType) {
        await ctx.db.insert("userAccountTypes", {
          userId: user._id,
          accountType,
        });
      }
    }
  },
});

export const runPU = migrations.runner([
  internal.migrations.populateUserRoles,
  internal.migrations.populateUserAccountTypes,
]);

export const fixEventStartInEventLookup = migrations.define({
  table: "eventLookup",
  migrateOne: async (ctx, lookup) => {
    // Fetch the related event document
    const event = await ctx.db.get(lookup.eventId);
    if (!event) return;

    // Get the correct eventStart value
    const correctEventStart = event.dates?.eventDates?.[0]?.start;

    // Only update if the value is different or missing
    if (lookup.eventStart !== correctEventStart) {
      await ctx.db.patch(lookup._id, { eventStart: correctEventStart });
    }
  },
});

export const runFSD = migrations.runner(
  internal.migrations.fixEventStartInEventLookup,
);

export const backfillEventLookup = migrations.define({
  table: "events",
  migrateOne: async (ctx, event) => {
    if (!event.approvedAt) {
      return;
    }

    // Check if this event already has a lookup entry
    const existing = await ctx.db
      .query("eventLookup")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .first();
    if (existing) {
      return; // Skip if already present
    }

    const org = await ctx.db.get(event.mainOrgId);
    if (!org) {
      return;
    }

    const hasOpenCall =
      event.hasOpenCall === "Fixed" ||
      event.hasOpenCall === "Rolling" ||
      event.hasOpenCall === "Email";

    const openCall = hasOpenCall
      ? await ctx.db
          .query("openCalls")
          .withIndex("by_eventId_approvedAt", (q) =>
            q.eq("eventId", event._id).gt("approvedAt", undefined),
          )
          .unique()
      : null;

    const eventLookupDoc = {
      eventId: event._id,
      openCallId: openCall?._id,
      mainOrgId: event.mainOrgId,
      orgName: org.name,
      ownerId: org.ownerId,
      eventName: event.name,
      eventSlug: event.slug,
      eventState: event.state,
      eventCategory: event.category,
      eventType: event.type,
      country: event.location.country,
      continent: event.location.continent ?? "",
      eventStart: event.dates.eventDates[0].start,
      hasOpenCall,
      postStatus: event.posted,
      ocState: openCall?.state,
      callType: openCall?.basicInfo.callType ?? undefined,
      callFormat: openCall?.basicInfo.callFormat ?? undefined,
      eligibilityType: openCall?.eligibility.type ?? undefined,
      ocStart: openCall?.basicInfo.dates.ocStart ?? undefined,
      ocEnd: openCall?.basicInfo.dates.ocEnd ?? undefined,
      eventApprovedAt: event.approvedAt,
      ocApprovedAt: openCall?.approvedAt,
      lastEditedAt: event.lastEditedAt ?? event.approvedAt,
    };

    await ctx.db.insert("eventLookup", eventLookupDoc);
  },
});

export const runBFEL = migrations.runner(
  internal.migrations.backfillEventLookup,
);

export const populateEventLookupTest = migrations.define({
  table: "events", // The table to walk through
  migrateOne: async (ctx, event) => {
    if (!event.approvedAt) {
      return; // Only migrate events with approvedAt set
    }

    const org = await ctx.db.get(event.mainOrgId);
    if (!org) {
      return; // Skip if organization is not found
    }

    const hasOpenCall =
      event.hasOpenCall === "Fixed" ||
      event.hasOpenCall === "Rolling" ||
      event.hasOpenCall === "Email";

    // Find the related openCall, if any
    const openCall = hasOpenCall
      ? await ctx.db
          .query("openCalls")
          .withIndex("by_eventId_approvedAt", (q) =>
            q.eq("eventId", event._id).gt("approvedAt", undefined),
          )
          .unique()
      : null;

    // Build the eventLookup document
    const eventLookupDoc = {
      eventId: event._id,
      openCallId: openCall?._id,
      mainOrgId: event.mainOrgId,
      orgName: org.name,
      ownerId: org.ownerId,
      eventName: event.name,
      eventSlug: event.slug,
      eventState: event.state,
      eventCategory: event.category,
      eventType: event.type,
      country: event.location.country,
      continent: event.location.continent ?? "",
      eventStart: event.dates.eventDates[0].start,
      hasOpenCall,
      postStatus: event.posted,
      ocState: openCall?.state,
      callType: openCall?.basicInfo.callType ?? undefined,
      callFormat: openCall?.basicInfo.callFormat ?? undefined,
      eligibilityType: openCall?.eligibility.type ?? undefined,
      ocStart: openCall?.basicInfo.dates.ocStart ?? undefined,
      ocEnd: openCall?.basicInfo.dates.ocEnd ?? undefined,
      eventApprovedAt: event.approvedAt,
      ocApprovedAt: openCall?.approvedAt,
      lastEditedAt: event.lastEditedAt ?? event.approvedAt,
    };

    // Insert into eventLookup
    await ctx.db.insert("eventLookup", eventLookupDoc);
  },
});

export const runPEL2 = migrations.runner(
  internal.migrations.populateEventLookupTest,
);

export const clearEventsAggregate2 = migrations.define({
  table: "events",
  migrateOne: async (ctx, event) => {
    await eventsAggregate.clear(ctx);
    await openCallsAggregate.clear(ctx);
  },
});

export const backfillEventsAggregate2 = migrations.define({
  table: "events",
  migrateOne: async (ctx, event) => {
    await eventsAggregate.insertIfDoesNotExist(ctx, event);
  },
});

export const clearOCAggregate2 = migrations.define({
  table: "openCalls",
  migrateOne: async (ctx, doc) => {
    await openCallsAggregate.clear(ctx);
  },
});
export const backfillOCAggregate2 = migrations.define({
  table: "openCalls",
  migrateOne: async (ctx, doc) => {
    await openCallsAggregate.insertIfDoesNotExist(ctx, doc);
  },
});

export const runCEA = migrations.runner(
  internal.migrations.clearEventsAggregate2,
);

export const runBFA = migrations.runner([
  internal.migrations.backfillEventsAggregate2,
]);

export const runBFOA = migrations.runner(
  internal.migrations.backfillOCAggregate2,
);

export const runBackfillEA = migrations.runner(
  internal.migrations.backfillEventsAggregate2,
);
export const runBackfillOCA = migrations.runner(
  internal.migrations.backfillOCAggregate2,
);

export const addDefaultCommPref = migrations.define({
  table: "userPreferences",
  migrateOne: async (ctx, userPref) => {
    if (userPref.notifications) return;
    //gather all newsletter subscriptions
    //everyone gets a monthly frequency and general newsletter type
    await ctx.db.patch(userPref._id, {
      notifications: {
        general: true,
      },
    });
  },
});

export const runDCP = migrations.runner(internal.migrations.addDefaultCommPref);

// export const findUsersWithActiveNewsletterAndUpdateUserPref = migrations.define(
//   {
//     table: "users",
//     migrateOne: async (ctx, user) => {
//       const userId = user._id;
//       const subscriptionByUserId = await ctx.db
//         .query("newsletter")
//         .withIndex("by_userId", (q) => q.eq("userId", userId))
//         .first();

//       const subscriptionByEmail = await ctx.db
//         .query("newsletter")
//         .withIndex("by_email", (q) => q.eq("email", user.email))
//         .first();

//       const userPrefs = await ctx.db
//         .query("userPreferences")
//         .withIndex("by_userId", (q) => q.eq("userId", userId))
//         .unique();

//       if (!userPrefs) return;

//       if (subscriptionByUserId?.newsletter) {
//         await ctx.db.patch(userPrefs._id, {
//           notifications: {
//             newsletter: true,
//           },
//           lastUpdated: Date.now(),
//         });
//       } else if (subscriptionByEmail?.newsletter) {
//         await ctx.db.patch(userPrefs._id, {
//           notifications: {
//             newsletter: true,
//           },
//           lastUpdated: Date.now(),
//         });
//       }
//     },
//   },
// );

// export const runFUWA = migrations.runner(
//   internal.migrations.findUsersWithActiveNewsletterAndUpdateUserPref,
// );

// export const runANPBU = migrations.runner(
//   internal.migrations.addDefaultNewsletterTypeandFrequency,
// );
// export const addVotersArrayToKanban = migrations.define({
//   table: "todoKanban",
//   migrateOne: async (ctx, todo) => {
//     await ctx.db.patch(todo._id, { voters: [] });
//   },
// });

// export const addUserIdToKanban = migrations.define({
//   table: "todoKanban",
//   migrateOne: async (ctx, todo) => {
//     await ctx.db.patch(todo._id, {
//       lastUpdatedBy: "mh74phva5yrxhg9ga6x1g1csk97cp2vc" as Id<"users">,
//     });
//   },
// });
// export const runAUIDTK = migrations.runner(
//   internal.migrations.addUserIdToKanban,
// );

export const backfillUserFontPref = migrations.define({
  table: "userPreferences",
  migrateOne: async (ctx, userPref) => {
    if (userPref.fontSize === "normal") {
      const user = await ctx.db.get(userPref.userId);
      console.log("ignored user: ", user?.name);
      return;
    }
    await ctx.db.patch(userPref._id, {
      fontSize: "normal",
    });
  },
});

export const runBUFP = migrations.runner(
  internal.migrations.backfillUserFontPref,
);

// export const backfillUserPlan = migrations.define({
//   table: "users",
//   migrateOne: async (ctx, user) => {
//     if (typeof user.plan === "number") return;

//     const planStr: string | undefined = user?.subscription;
//     if (!planStr) return;

//     const mapping: Record<string, number> = {
//       "monthly-original": 1,
//       "monthly-banana": 2,
//       "monthly-fatcap": 3,
//       "yearly-original": 1,
//       "yearly-banana": 2,
//       "yearly-fatcap": 3,
//     };

//     const numeric = mapping[planStr];
//     if (numeric === undefined) return;

//     await ctx.db.patch(user._id, { plan: numeric });
//   },
// });

// export const runBUP = migrations.runner(internal.migrations.backfillUserPlan);

// export const copyUpdatedAtToCompletedAt = migrations.define({
//   table: "todoKanban",
//   migrateOne: async (ctx, todo) => {
//     // Only update if completedAt is undefined and updatedAt exists
//     if (todo.completedAt === undefined && todo.updatedAt !== undefined) {
//       await ctx.db.patch(todo._id, { completedAt: todo.updatedAt });
//     }
//   },
// });
// export const clearCompletedAtIfUndone = migrations.define({
//   table: "todoKanban",
//   migrateOne: async (ctx, todo) => {
//     // Only update if completedAt is undefined and updatedAt exists
//     if (todo.completedAt !== undefined && todo.column !== "done") {
//       await ctx.db.patch(todo._id, { completedAt: undefined });
//     }
//   },
// });
// export const updateIsPublic = migrations.define({
//   table: "todoKanban",
//   migrateOne: async (ctx, todo) => {
//     if (todo.public === undefined) {
//       await ctx.db.patch(todo._id, { public: true });
//     }
//   },
// });

// // export const removeMainOrgName = migrations.define({
// //   table: "events",
// //   migrateOne: async (ctx, event) => {
// //     if (event.mainOrgName) {
// //       await ctx.db.patch(event._id, {
// //         ...event,
// //         mainOrgName: undefined,
// //       });
// //     }
// //   },
// // });

// export const addPlaceHolderNoProdStart = migrations.define({
//   table: "events",
//   migrateOne: async (ctx, event) => {
//     await ctx.db.patch(event._id, {
//       dates: {
//         ...event.dates,
//         noProdStart: false,
//       },
//     });
//   },
// });

// export const normalizeSocialLinks = migrations.define({
//   table: "organizations", // or "events"
//   migrateOne: async (ctx, doc) => {
//     const links = doc.links;

//     if (!links) return;

//     const updatedLinks = {
//       ...links,
//       instagram: links.instagram
//         ? normalizeToHandle(links.instagram, "instagram.com")
//         : undefined,
//       facebook: links.facebook
//         ? normalizeToHandle(links.facebook, "facebook.com")
//         : undefined,
//       threads: links.threads
//         ? normalizeToHandle(links.threads, "threads.net")
//         : undefined,
//       vk: links.vk ? normalizeToHandle(links.vk, "vk.com") : undefined,
//     };

//     await ctx.db.patch(doc._id, { links: updatedLinks });
//   },
// });

// export const clearContactPrimaryContact = migrations.define({
//   table: "organizations",
//   migrateOne: async (ctx, doc) => {
//     await ctx.db.patch(doc._id, { contact: { primaryContact: "" } });
//   },
// });

// export const setOtherInfoUndefined = migrations.define({
//   table: "events",
//   migrateOne: () => ({ otherInfo: undefined }),
// });

// export const updateOrgSlugs = migrations.define({
//   table: "organizations",
//   migrateOne: async (ctx, doc) => {
//     await ctx.db.patch(doc._id, { slug: slugify(doc.name, { lower: true }) });
//   },
// });

// export const runSlugs = migrations.runner(internal.migrations.updateOrgSlugs);

// export const updateAllSlugsToLowerCase = migrations.define({
//   table: "events",
//   migrateOne: async (ctx, doc) => {
//     await ctx.db.patch(doc._id, { slug: slugify(doc.name, { lower: true }) });
//   },
// });

// export const addHasOpenCall = migrations.define({
//   table: "events",
//   migrateOne: async (ctx, doc) => {
//     await ctx.db.patch(doc._id, { hasOpenCall: "Unknown" });
//   },
// });

// export const markAllOrgsComplete = migrations.define({
//   table: "organizations",
//   migrateOne: async (ctx, doc) => {
//     await ctx.db.patch(doc._id, { isComplete: true });
//   },
// });

// export const addAppLinkFormat = migrations.define({
//   table: "openCalls",
//   migrateOne: async (ctx, doc) => {
//     await ctx.db.patch(doc._id, {
//       requirements: {
//         ...doc.requirements,
//         applicationLinkFormat: "https://",
//       },
//     });
//   },
// });

// export const runRemoveOrgNames = migrations.runner(
//   internal.migrations.removeMainOrgName,
// );
