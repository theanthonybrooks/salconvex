import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export type ColumnType =
  | "proposed"
  | "backlog"
  | "todo"
  | "doing"
  | "done"
  | "notPlanned";

export const searchCards = query({
  args: {
    purpose: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("todoKanban")
      .withSearchIndex("search_by_title", (q) => {
        let filter = q.search("title", args.searchTerm ?? "");
        if (args.purpose) {
          filter = filter.eq("purpose", args.purpose);
        }
        return filter;
      });
    return await q.collect();
  },
});

export const getCards = query({
  args: {
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todoKanban")
      .withIndex("by_purpose", (q) => q.eq("purpose", args.purpose))
      .collect();
  },
});

export const addCard = mutation({
  args: {
    title: v.string(),
    column: v.union(
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done"),
      v.literal("notPlanned"),
    ),
    order: v.optional(v.string()),
    priority: v.optional(v.string()),
    userId: v.string(),
    isPublic: v.boolean(),
    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    const { column, order, title, userId, priority, isPublic } = args;

    if (column === "done") {
      return await ctx.db.insert("todoKanban", {
        title,
        column,
        createdAt: Date.now(),
        lastUpdatedBy: userId,
        order: 0,
        priority,
        public: isPublic,
        purpose: args.purpose,
        completedAt: Date.now(),
      });
    }

    if (order === "start") {
      // Get all cards in this column sorted by order ascending (smallest first)
      const cardsInColumn = await ctx.db
        .query("todoKanban")
        .withIndex("by_column_order", (q) => q.eq("column", column))
        .order("asc") // Get lowest order first
        .collect();

      // Shift all existing cards down
      for (const card of cardsInColumn) {
        await ctx.db.patch(card._id, { order: card.order + 1 });
      }

      // Insert new card at order = 0
      return await ctx.db.insert("todoKanban", {
        title,
        column,
        createdAt: Date.now(),
        lastUpdatedBy: userId,
        order: 0,
        priority,
        public: isPublic,
        purpose: args.purpose,
      });
    }

    // Default behavior (add at the end)
    const lastCard = await ctx.db
      .query("todoKanban")
      .withIndex("by_column_order", (q) => q.eq("column", column))
      .order("desc") // Get highest order first
      .first();

    const newOrder = lastCard ? lastCard.order + 1 : 0;

    return await ctx.db.insert("todoKanban", {
      title,
      column: column as ColumnType,
      createdAt: Date.now(),
      lastUpdatedBy: userId,
      order: newOrder,
      public: isPublic,
      purpose: args.purpose,
    });
  },
});

export const moveCard = mutation({
  args: {
    id: v.id("todoKanban"),
    column: v.union(
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done"),
      v.literal("notPlanned"),
    ),
    beforeId: v.optional(v.id("todoKanban")),
    userId: v.string(),
    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, column, beforeId, userId } = args;
    const card = await ctx.db.get(id);
    if (!card) throw new Error("Card not found");

    // console.log(`Moving card ${id} to column ${column}, before ${beforeId}`)

    let cardsInColumn = await ctx.db
      .query("todoKanban")
      .withIndex("by_column_order", (q) => q.eq("column", column))
      .order("asc")
      .collect();

    // console.log(
    //   "Current column cards before move:",
    //   cardsInColumn.map((c) => ({ id: c._id, order: c.order }))
    // )

    let newOrder;

    if (!beforeId) {
      newOrder = cardsInColumn.length
        ? cardsInColumn[cardsInColumn.length - 1].order + 1
        : 0;
      // console.log(`Assigning order ${newOrder} (placing at end)`)
    } else {
      const beforeIndex = cardsInColumn.findIndex((c) => c._id === beforeId);
      if (beforeIndex === -1) throw new Error("Before card not found");

      newOrder = beforeIndex;
      // console.log(`Assigning order ${newOrder} (before card ${beforeId})`)
    }

    await ctx.db.patch(id, {
      column,
      order: newOrder - 0.001,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    });

    if (column === "done") {
      await ctx.db.patch(id, { completedAt: Date.now() });
    }

    if (column !== "done") {
      await ctx.db.patch(id, { completedAt: undefined });
    }

    cardsInColumn = await ctx.db
      .query("todoKanban")
      .withIndex("by_column_order", (q) => q.eq("column", column))
      .order("asc")
      .collect();

    await Promise.all(
      cardsInColumn.map((c, index) => ctx.db.patch(c._id, { order: index })),
    );

    console.log(
      "Final column order after renumbering:",
      cardsInColumn.map((c, index) => ({ id: c._id, order: index })),
    );
  },
});

export const editCard = mutation({
  args: {
    id: v.id("todoKanban"),
    title: v.string(),
    userId: v.string(),
    priority: v.optional(v.string()),
    column: v.optional(
      v.union(
        v.literal("proposed"),
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("doing"),
        v.literal("done"),
        v.literal("notPlanned"),
      ),
    ),
    isPublic: v.optional(v.boolean()),
    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.column === "done") {
      const card = await ctx.db.get(args.id);
      if (!card) throw new Error("Card not found");
      if (card.completedAt === undefined && args.column === "done") {
        await ctx.db.patch(args.id, { completedAt: Date.now() });
      }
    }

    return await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
      lastUpdatedBy: args.userId,
      priority: args.priority,
      public: args.isPublic,
      ...(args.column !== undefined && { column: args.column }),
    });
  },
});

export const deleteCard = mutation({
  args: {
    id: v.id("todoKanban"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // console.log(`Card ${args.id} deleted by ${args.userId}`)
    return await ctx.db.delete(args.id);
  },
});
