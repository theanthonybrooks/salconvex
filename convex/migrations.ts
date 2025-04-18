import { Migrations } from "@convex-dev/migrations";
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

export const removeStartEndDates = migrations.define({
  table: "events",
  migrateOne: async (ctx, event) => {
    if (event.dates.eventStart) {
      await ctx.db.patch(event._id, {
        dates: {
          ...event.dates,
          eventStart: undefined,
          eventEnd: undefined,
        },
      });
    }
  },
});

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

export const runRemoveStartDates = migrations.runner(
  internal.migrations.removeStartEndDates,
);

//NOTE: (TO RUN THIS MIGRATION)
// FOR PRODUCTION:
//  npx convex run migrations:runUpdatePublic --prod
// FOR DEVELOPMENT:
//  npx convex run migrations:runUpdatePublic
