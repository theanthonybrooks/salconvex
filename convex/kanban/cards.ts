import { ColumnType } from "@/constants/kanbanConsts";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const searchCards = query({
  args: {
    purpose: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("general"),
        v.literal("account"),
        v.literal("artist"),
        v.literal("organization"),
        v.literal("event"),
        v.literal("openCall"),
        v.literal("other"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    //todo: add category filter dropdown to search bar
    let q = ctx.db
      .query("todoKanban")
      .withSearchIndex("search_by_desc", (q) => {
        let filter = q.search("description", args.searchTerm ?? "");
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
    description: v.string(),
    column: v.union(
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done"),
      v.literal("notPlanned"),
    ),
    order: v.optional(v.string()),

    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    category: v.optional(
      v.union(
        v.literal("general"),
        v.literal("ui/ux"),
        v.literal("account"),
        v.literal("artist"),
        v.literal("organization"),
        v.literal("event"),
        v.literal("openCall"),
        v.literal("other"),
      ),
    ),
    isPublic: v.boolean(),
    purpose: v.string(),
    voters: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          direction: v.union(v.literal("up"), v.literal("down")),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const {
      column,
      order,
      title,
      description,

      category,
      priority,
      isPublic,
    } = args;

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");
    if (column === "done") {
      return await ctx.db.insert("todoKanban", {
        title,
        description,
        column,
        createdAt: Date.now(),
        lastUpdatedBy: userId,
        order: 0,
        voters: [],
        category: category ?? "general",
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
        description,
        column,
        createdAt: Date.now(),
        lastUpdatedBy: userId,
        order: 0,
        voters: [],
        category: category ?? "general",
        priority,
        public: isPublic,
        purpose: args.purpose,
        userId,
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
      description,
      column: column as ColumnType,
      createdAt: Date.now(),
      lastUpdatedBy: userId,
      order: newOrder,
      voters: [],

      category: category ?? "general",
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

    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, column, beforeId } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");
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

    // console.log(
    //   "Final column order after renumbering:",
    //   cardsInColumn.map((c, index) => ({ id: c._id, order: index })),
    // );
  },
});

export const editCard = mutation({
  args: {
    id: v.id("todoKanban"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
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
    category: v.union(
      v.literal("general"),
      v.literal("ui/ux"),

      v.literal("account"),
      v.literal("artist"),
      v.literal("organization"),
      v.literal("event"),
      v.literal("openCall"),
      v.literal("other"),
    ),
    voters: v.array(
      v.object({
        userId: v.id("users"),
        direction: v.union(v.literal("up"), v.literal("down")),
      }),
    ),
    isPublic: v.optional(v.boolean()),
    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (args.column === "done") {
      const card = await ctx.db.get(args.id);
      if (!card) throw new Error("Card not found");
      if (card.completedAt === undefined && args.column === "done") {
        await ctx.db.patch(args.id, { completedAt: Date.now() });
      }
    }

    return await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
      priority: args.priority,
      public: args.isPublic,
      category: args.category,
      voters: args.voters,
      ...(args.column !== undefined && { column: args.column }),
    });
  },
});

export const deleteCard = mutation({
  args: {
    id: v.id("todoKanban"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("User not found");
    if (user.role.includes("admin")) {
      return await ctx.db.delete(args.id);
    }
  },
});

export const voteCard = mutation({
  args: {
    id: v.id("todoKanban"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const { id, direction } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(id);
    if (!card) throw new Error("Card not found");

    let voters = card.voters ?? [];

    const existing = voters.find((v) => v.userId === userId);

    if (existing) {
      if (existing.direction === direction) {
        voters = voters.filter((v) => v.userId !== userId);
      } else {
        voters = voters.map((v) =>
          v.userId === userId ? { ...v, direction } : v,
        );
      }
    } else {
      voters.push({ userId, direction });
    }

    await ctx.db.patch(id, { voters });

    const upVote = voters.filter((v) => v.direction === "up").length;
    const downVote = voters.filter((v) => v.direction === "down").length;

    const votedUsers = voters.map((v) => v.userId);
    const userVoted = votedUsers.includes(userId);

    return { upVote, downVote, userVoted };
  },
});
