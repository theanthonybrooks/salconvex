import { normalizeToHandle } from "@/lib/linkFns.js";
import { Migrations } from "@convex-dev/migrations";
import slugify from "slugify";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const copyUpdatedAtToCompletedAt = migrations.define({
  table: "todoKanban",
  migrateOne: async (ctx, todo) => {
    // Only update if completedAt is undefined and updatedAt exists
    if (todo.completedAt === undefined && todo.updatedAt !== undefined) {
      await ctx.db.patch(todo._id, { completedAt: todo.updatedAt });
    }
  },
});
export const clearCompletedAtIfUndone = migrations.define({
  table: "todoKanban",
  migrateOne: async (ctx, todo) => {
    // Only update if completedAt is undefined and updatedAt exists
    if (todo.completedAt !== undefined && todo.column !== "done") {
      await ctx.db.patch(todo._id, { completedAt: undefined });
    }
  },
});
export const updateIsPublic = migrations.define({
  table: "todoKanban",
  migrateOne: async (ctx, todo) => {
    if (todo.public === undefined) {
      await ctx.db.patch(todo._id, { public: true });
    }
  },
});

// export const removeMainOrgName = migrations.define({
//   table: "events",
//   migrateOne: async (ctx, event) => {
//     if (event.mainOrgName) {
//       await ctx.db.patch(event._id, {
//         ...event,
//         mainOrgName: undefined,
//       });
//     }
//   },
// });

export const addPlaceHolderNoProdStart = migrations.define({
  table: "events",
  migrateOne: async (ctx, event) => {
    await ctx.db.patch(event._id, {
      dates: {
        ...event.dates,
        noProdStart: false,
      },
    });
  },
});

export const normalizeSocialLinks = migrations.define({
  table: "organizations", // or "events"
  migrateOne: async (ctx, doc) => {
    const links = doc.links;

    if (!links) return;

    const updatedLinks = {
      ...links,
      instagram: links.instagram
        ? normalizeToHandle(links.instagram, "instagram.com")
        : undefined,
      facebook: links.facebook
        ? normalizeToHandle(links.facebook, "facebook.com")
        : undefined,
      threads: links.threads
        ? normalizeToHandle(links.threads, "threads.net")
        : undefined,
      vk: links.vk ? normalizeToHandle(links.vk, "vk.com") : undefined,
    };

    await ctx.db.patch(doc._id, { links: updatedLinks });
  },
});

export const clearDocsFR = migrations.define({
  table: "openCalls",
  migrateOne: async (ctx, doc) => {
    await ctx.db.patch(doc._id, {
      requirements: {
        ...doc.requirements,
        documents: undefined,
      },
    });
  },
});

export const clearContactPrimaryContact = migrations.define({
  table: "organizations",
  migrateOne: async (ctx, doc) => {
    await ctx.db.patch(doc._id, { contact: { primaryContact: "" } });
  },
});

export const setOtherInfoUndefined = migrations.define({
  table: "events",
  migrateOne: () => ({ otherInfo: undefined }),
});

export const updateOrgSlugs = migrations.define({
  table: "organizations",
  migrateOne: async (ctx, doc) => {
    await ctx.db.patch(doc._id, { slug: slugify(doc.name, { lower: true }) });
  },
});

export const runSlugs = migrations.runner(internal.migrations.updateOrgSlugs);

export const updateAllSlugsToLowerCase = migrations.define({
  table: "events",
  migrateOne: async (ctx, doc) => {
    await ctx.db.patch(doc._id, { slug: slugify(doc.name, { lower: true }) });
  },
});

export const runOrgSlugs = migrations.runner(
  internal.migrations.updateAllSlugsToLowerCase,
);

// Create a runner specifically for this migration
export const runCopyDates = migrations.runner(
  internal.migrations.copyUpdatedAtToCompletedAt,
);

export const runUpdatePublic = migrations.runner(
  internal.migrations.updateIsPublic,
);

export const runClearIfUndone = migrations.runner(
  internal.migrations.clearCompletedAtIfUndone,
);

export const runAddPlaceHolderNoProdStart = migrations.runner(
  internal.migrations.addPlaceHolderNoProdStart,
);

export const runCOI = migrations.runner(
  internal.migrations.setOtherInfoUndefined,
);

export const runNorm = migrations.runner(
  internal.migrations.normalizeSocialLinks,
);

export const runCP = migrations.runner(
  internal.migrations.clearContactPrimaryContact,
);

export const runCD = migrations.runner(internal.migrations.clearDocsFR);

// export const runRemoveOrgNames = migrations.runner(
//   internal.migrations.removeMainOrgName,
// );

//NOTE: (TO RUN THIS MIGRATION)
// FOR PRODUCTION:
//  npx convex run migrations:runUpdatePublic --prod
// FOR DEVELOPMENT:
//  npx convex run migrations:runUpdatePublic
//  npx convex run migrations:
