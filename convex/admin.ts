import { ShardedCounter } from "@convex-dev/sharded-counter";
import { v } from "convex/values";
import { components } from "~/convex/_generated/api";
import { mutation } from "~/convex/_generated/server";

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
