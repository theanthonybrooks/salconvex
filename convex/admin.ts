import { SupportCategory } from "@/constants/supportConsts";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ShardedCounter } from "@convex-dev/sharded-counter";
import { ConvexError, v } from "convex/values";
import { components } from "~/convex/_generated/api";
import { mutation, query } from "~/convex/_generated/server";

const counter = new ShardedCounter(components.shardedCounter);

export const createSupportTicket = mutation({
  args: {
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    email: v.string(),
    category: v.string(),
    message: v.string(),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    await counter.inc(ctx, "supportTickets");
    const ticketNumber = await counter.count(ctx, "supportTickets");

    const support = await ctx.db.insert("support", {
      userId: args.userId,
      ticketNumber,
      name: args.name,
      email: args.email,
      category: args.category,
      message: args.message,
      status: "open",
      createdAt: Date.now(),
    });

    const supportPurpose = args.category === "ui/ux" ? "design" : "general";

    await ctx.db.insert("todoKanban", {
      title: "Support Ticket #" + ticketNumber,
      description: args.message,
      column: "proposed",
      order: 0,
      priority: "high",
      category: args.category as SupportCategory,
      public: true,
      purpose: supportPurpose,
      voters: [],
      createdAt: Date.now(),
      lastUpdatedBy: userId ?? "guest",
    });

    return { support, ticketNumber };
  },
});

export const updateSupportTicket = mutation({
  args: {
    supportId: v.id("support"),
    status: v.union(
      v.literal("open"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
  },
  async handler(ctx, args) {
    const support = await ctx.db.get(args.supportId);
    if (!support) return null;

    await ctx.db.patch(support._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { support };
  },
});

export const getSupportTicketStatus = query({
  args: {
    ticketNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const support = await ctx.db
      .query("support")
      .withIndex("by_ticketNumber", (q) =>
        q.eq("ticketNumber", args.ticketNumber),
      )
      .first();

    if (!support) {
      throw new ConvexError("No support ticket found");
    }

    return support;
  },
});
