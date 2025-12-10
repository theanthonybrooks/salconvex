import type { ColumnType } from "@/constants/kanbanConsts";

import { getAuthUserId } from "@convex-dev/auth/server";
import { DataModel } from "~/convex/_generated/dataModel";
import {
  kanbanColumnValidator,
  kanbanPurposeValidator,
  supportCategoryValidator,
  userRoleArrayValidator,
} from "~/convex/schema";
import { OrderedQuery, Query, QueryInitializer } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const searchCards = query({
  args: {
    purpose: v.optional(kanbanPurposeValidator),
    searchTerm: v.optional(v.string()),
    category: v.array(supportCategoryValidator),
    assignedId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isCreator = user?.role?.includes("creator") ?? false;
    const searchTerm = args.searchTerm?.trim() ?? "";
    const searchLower = searchTerm.toLowerCase();

    if (!searchTerm) return [];

    const base = ctx.db.query("todoKanban");

    const titleQuery = base.withSearchIndex("search_by_title", (q) => {
      let filter = q.search("title", searchTerm);
      if (args.purpose && args.purpose !== "todo") {
        if (args.purpose === "design") {
          filter = filter.eq("purpose", args.purpose);
        }
      }
      if (args.category.length === 1) {
        filter = filter.eq("category", args.category[0]);
      }
      return filter;
    });

    const descriptionQuery = base.withSearchIndex("search_by_desc", (q) => {
      let filter = q.search("description", searchTerm);
      if (args.purpose && args.purpose !== "todo") {
        if (args.purpose === "design")
          filter = filter.eq("purpose", args.purpose);
      }
      if (args.category.length === 1) {
        filter = filter.eq("category", args.category[0]);
      }
      return filter;
    });

    const [byTitle, byDescription] = await Promise.all([
      titleQuery.collect(),
      descriptionQuery.collect(),
    ]);

    const byId = new Map<string, (typeof byTitle)[number]>();
    for (const doc of [...byTitle, ...byDescription]) {
      byId.set(doc._id.toString(), doc);
    }
    let output = Array.from(byId.values());

    output = output.filter(
      (card) =>
        card.title?.toLowerCase().includes(searchLower) ||
        card.description?.toLowerCase().includes(searchLower),
    );

    if (args.category.length > 1) {
      output = output.filter((card) => args.category.includes(card.category));
    }

    if (args.assignedId) {
      output = output.filter(
        (card) =>
          card.assignedId === args.assignedId ||
          (isCreator && !card.assignedId) ||
          card.secondaryAssignedId === args.assignedId,
      );
    }

    return output;
  },
});

export const getCards = query({
  args: {
    purpose: kanbanPurposeValidator,
    category: v.array(supportCategoryValidator),
    userRole: userRoleArrayValidator,
    full: v.optional(v.boolean()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // console.log("user id: ", args.userId);
    const userIsCreator = args.userRole.includes("creator");

    const tableQuery: QueryInitializer<DataModel["todoKanban"]> =
      ctx.db.query("todoKanban");
    let indexedQuery: Query<DataModel["todoKanban"]> = tableQuery;

    if (args.category.length > 0 && args.purpose === "todo") {
      const results = await Promise.all(
        args.category.map((category) =>
          tableQuery
            .withIndex("by_category", (q) => q.eq("category", category))
            .collect(),
        ),
      );
      const flatResults = results.flat();
      if (args.userId) {
        return flatResults.filter(
          (card) =>
            card.assignedId === args.userId ||
            card.secondaryAssignedId === args.userId,
        );
      } else {
        return flatResults;
      }
    }

    if (args.purpose !== "todo") {
      if (args.purpose === "design") {
        indexedQuery = tableQuery.withIndex("by_purpose", (q) =>
          q.eq("purpose", args.purpose),
        );
      } else if (args.purpose === "support") {
        indexedQuery = tableQuery.withIndex("by_ticketNumber", (q) =>
          q.gt("ticketNumber", undefined),
        );
      }
    } else {
      if (args.category.length === 0) {
        let orderedQuery: OrderedQuery<DataModel["todoKanban"]> = indexedQuery;

        const results = await orderedQuery.collect();

        let filteredResults = results;
        if (args.userId) {
          const userResults = results.filter(
            (card) =>
              card.assignedId === args.userId ||
              card.secondaryAssignedId === args.userId,
          );
          const completeCards = userResults.filter(
            (card) => card.column === "done",
          );
          const otherCards = userResults.filter(
            (card) => !["done", "notPlanned"].includes(card.column),
          );
          const limitedResults = [...completeCards, ...otherCards];
          filteredResults = limitedResults;
        }
        return filteredResults;
      }
      //   console.log("ordered query", orderedQuery);
      //   return await orderedQuery.collect();
      // }
    }

    const collectedResults = await indexedQuery.collect();
    if (
      args.userId &&
      ((userIsCreator && args.purpose === "todo") || !userIsCreator)
    ) {
      return collectedResults.filter(
        (card) =>
          card.assignedId === args.userId ||
          card.secondaryAssignedId === args.userId,
      );
    } else {
      return collectedResults;
    }
  },
});

export const addCard = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    column: kanbanColumnValidator,
    order: v.optional(v.string()),

    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    category: v.optional(supportCategoryValidator),
    isPublic: v.boolean(),
    purpose: kanbanPurposeValidator,
    voters: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          direction: v.union(v.literal("up"), v.literal("down")),
        }),
      ),
    ),
    assignedId: v.optional(v.id("users")),
    secondaryAssignedId: v.optional(v.id("users")),
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
      assignedId,
      secondaryAssignedId,
    } = args;
    const cardPurpose = category === "ui/ux" ? "design" : args.purpose;
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role?.includes("admin") ?? false;
    const creatorUser = !isAdmin
      ? await ctx.db
          .query("userRoles")
          .withIndex("by_role", (q) => q.eq("role", "creator"))
          .first()
      : null;
    console.log({
      assignedId,
      isAdmin,
      userId,
      creatorUser: creatorUser?.userId,
    });
    const defaultAssignedId = assignedId
      ? assignedId
      : isAdmin
        ? userId
        : creatorUser?.userId;

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
        purpose: cardPurpose,
        assignedId: defaultAssignedId,
        secondaryAssignedId,
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
        purpose: cardPurpose,
        assignedId: defaultAssignedId,
        secondaryAssignedId,
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
      purpose: cardPurpose,
      assignedId: defaultAssignedId,
      secondaryAssignedId,
    });
  },
});

export const moveCard = mutation({
  args: {
    id: v.id("todoKanban"),
    column: kanbanColumnValidator,
    beforeId: v.optional(v.id("todoKanban")),

    purpose: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, column, beforeId } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");
    const card = await ctx.db.get(id);
    if (!card) throw new Error("Card not found");

    const kanbanCard = await ctx.db.get(args.id);
    const supportTicket = kanbanCard?.ticketNumber;
    if (supportTicket) {
      const status =
        args.column === "todo"
          ? "pending"
          : args.column === "notPlanned"
            ? "closed"
            : args.column === "done"
              ? "resolved"
              : "open";

      await ctx.db.patch(supportTicket, {
        status,
        updatedAt: Date.now(),
        updatedBy: userId,
      });
    }

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
    column: v.optional(kanbanColumnValidator),
    category: supportCategoryValidator,
    voters: v.array(
      v.object({
        userId: v.id("users"),
        direction: v.union(v.literal("up"), v.literal("down")),
      }),
    ),
    assignedId: v.optional(v.id("users")),
    secondaryAssignedId: v.optional(v.id("users")),
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
    const kanbanCard = await ctx.db.get(args.id);
    const supportTicket = kanbanCard?.ticketNumber;
    if (supportTicket) {
      const status =
        args.column === "todo"
          ? "pending"
          : args.column === "notPlanned"
            ? "closed"
            : args.column === "done"
              ? "resolved"
              : "open";

      await ctx.db.patch(supportTicket, {
        status,
        updatedAt: Date.now(),
        updatedBy: userId,
      });
    }
    const updatedPurpose =
      args.category === "ui/ux" ? "design" : supportTicket ? "support" : "todo";

    return await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
      priority: args.priority,
      public: args.isPublic,
      category: args.category,
      voters: args.voters,
      assignedId: args.assignedId,
      purpose: updatedPurpose,
      secondaryAssignedId: args.secondaryAssignedId,
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
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role.includes("admin")) {
      const kanbanCard = await ctx.db.get(args.id);
      const supportTicket = kanbanCard?.ticketNumber;

      if (supportTicket) {
        //note: not deleting for now. I think that the tickets should remain as a record, even if they're stupid or deleted from tasks. Should this also notify the user that created the ticket?
        // await ctx.db.delete(supportTicket);
        // await counter.dec(ctx, "supportTickets");
        await ctx.db.patch(supportTicket, {
          status: "closed",
          updatedAt: Date.now(),
          updatedBy: userId,
        });
      }
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

export const updateAssignedUser = mutation({
  args: {
    id: v.id("todoKanban"),
    userId: v.optional(v.id("users")),
    secondaryUserId: v.optional(v.id("users")),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) throw new ConvexError("You don't have permission");
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const kanbanCard = await ctx.db.get(args.id);
    if (!kanbanCard) throw new ConvexError("Kanban card not found");

    await ctx.db.patch(kanbanCard._id, {
      assignedId: args.userId,
      secondaryAssignedId: args.secondaryUserId,
    });
  },
});

export const updateCardPriority = mutation({
  args: {
    cardId: v.id("todoKanban"),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const kanbanCard = await ctx.db.get(args.cardId);
    if (!kanbanCard) throw new ConvexError("Kanban card not found");

    await ctx.db.patch(kanbanCard._id, {
      priority: args.priority,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    });
    const ticketId = kanbanCard.ticketNumber;
    const supportTicket = ticketId
      ? await ctx.db
          .query("support")
          .withIndex("by_id", (q) => q.eq("_id", ticketId))
          .first()
      : null;
    if (supportTicket) {
      await ctx.db.patch(supportTicket._id, {
        updatedAt: Date.now(),
        updatedBy: userId,
      });
    }
  },
});
