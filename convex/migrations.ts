import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import { DataModel, Id } from "./_generated/dataModel.js";

//NOTE: (TO RUN THIS MIGRATION)
// FOR PRODUCTION:
//  npx convex run migrations:runUpdatePublic --prod
// FOR DEVELOPMENT:
//  npx convex run migrations:runUpdatePublic
//  npx convex run migrations:

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const addDefaultNewsletterTypeandFrequency = migrations.define({
  table: "newsletter",
  migrateOne: async (ctx, user) => {
    //gather all newsletter subscriptions
    //everyone gets a monthly frequency and general newsletter type
    await ctx.db.patch(user._id, {
      type: ["general"],
      frequency: "monthly",
    });
  },
});

export const runANPBU = migrations.runner(
  internal.migrations.addDefaultNewsletterTypeandFrequency,
);
export const addVotersArrayToKanban = migrations.define({
  table: "todoKanban",
  migrateOne: async (ctx, todo) => {
    await ctx.db.patch(todo._id, { voters: [] });
  },
});

export const addUserIdToKanban = migrations.define({
  table: "todoKanban",
  migrateOne: async (ctx, todo) => {
    await ctx.db.patch(todo._id, {
      lastUpdatedBy: "mh74phva5yrxhg9ga6x1g1csk97cp2vc" as Id<"users">,
    });
  },
});
export const runAUIDTK = migrations.runner(
  internal.migrations.addUserIdToKanban,
);

export const backfillUserPlan = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    if (typeof user.plan === "number") return;

    const planStr: string | undefined = user?.subscription;
    if (!planStr) return;

    const mapping: Record<string, number> = {
      "monthly-original": 1,
      "monthly-banana": 2,
      "monthly-fatcap": 3,
      "yearly-original": 1,
      "yearly-banana": 2,
      "yearly-fatcap": 3,
    };

    const numeric = mapping[planStr];
    if (numeric === undefined) return;

    await ctx.db.patch(user._id, { plan: numeric });
  },
});

export const runBUP = migrations.runner(internal.migrations.backfillUserPlan);

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
