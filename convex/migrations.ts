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

export const backfillNotificationUpdatedAt = migrations.define({
  table: "notifications",
  migrateOne: async (ctx, notification) => {
    if (notification.updatedAt) return;
    await ctx.db.patch(notification._id, {
      updatedAt: notification._creationTime,
    });
  },
});

export const runBNUA = migrations.runner(
  internal.migrations.backfillNotificationUpdatedAt,
);

export const backfillUserPrefNewsletter = migrations.define({
  table: "newsletter",
  migrateOne: async (ctx, newsletter) => {
    await ctx.db.patch(newsletter._id, {
      verified: false,
    });
    const userId = newsletter.userId;
    if (!userId) return;
    const userPref = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const newsletterSub = userPref?.notifications?.newsletter;
    if (!userPref || newsletterSub === true) return;
    await ctx.db.patch(userPref._id, {
      notifications: {
        ...userPref.notifications,
        newsletter: true,
      },
    });
  },
});

export const runBNPN = migrations.runner(
  internal.migrations.backfillUserPrefNewsletter,
);

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
