import { SupportCategory } from "@/constants/supportConsts";

import type { StatusValue } from "@/features/admin/dashboard/components/admin-support-actions";

import type { Doc, Id } from "~/convex/_generated/dataModel";

import { getAuthUserId } from "@convex-dev/auth/server";
import { ShardedCounter } from "@convex-dev/sharded-counter";
import { components } from "~/convex/_generated/api";
import { mutation, query } from "~/convex/_generated/server";
import { ConvexError, v } from "convex/values";

export const counter = new ShardedCounter(components.shardedCounter);

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
      status: "pending",
      createdAt: Date.now(),
    });

    const supportPurpose = args.category === "ui/ux" ? "design" : "support";

    const description = `
    ${args.message}
    <br />
    <br />
    <p style='display:flex;align-items:center;gap:1;'><strong>Name:</strong> ${args.name}</p>
   <p style='display:flex;align-items:center;gap:1;'><strong>Email:</strong>
      <a
        href="mailto:${args.email}?subject=Support%20Request for Ticket%20#${ticketNumber}"
        target="_blank"
        rel="noopener noreferrer"
      >
       ${args.email}
      </a>
   </p>
   <p style='display:flex;align-items:center;gap:1;'><strong>User ID:</strong>
      <a
        href="${process.env.CONVEX_DASHBOARD_URL}data?table=users&id=${userId}"
        target="_blank"
        rel="noopener noreferrer"
      >
       ${userId}
      </a>
   </p>
    `;
    let assignedUser: Id<"users"> | undefined = undefined;

    const creator = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "creator"))
      .first();
    if (creator) assignedUser = creator.userId;

    await ctx.db.insert("todoKanban", {
      title: "Support Ticket #" + ticketNumber,
      description,
      column: "proposed",
      order: 0,
      priority: "high",
      category: args.category as SupportCategory,
      public: false,
      purpose: supportPurpose,
      voters: [],
      createdAt: Date.now(),
      lastUpdatedBy: userId ?? "guest",
      ticketNumber: support,
      assignedId: assignedUser,
    });

    return { support, ticketNumber };
  },
});
//TODO: Update this to include the ticketNumber (or I guess that's the support ticket number)
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const support = await ctx.db.get(args.supportId);
    if (!support) return null;

    await ctx.db.patch(support._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    const kanbanCard = await ctx.db
      .query("todoKanban")
      .withIndex("by_ticketNumber", (q) => q.eq("ticketNumber", support._id))
      .first();

    const kanbanStatus: Record<
      StatusValue,
      Pick<Doc<"todoKanban">, "column">["column"]
    > = {
      pending: "proposed",
      open: "todo",
      resolved: "done",
      closed: "notPlanned",
    };

    if (kanbanCard) {
      await ctx.db.patch(kanbanCard._id, {
        column: kanbanStatus[args.status],
        updatedAt: Date.now(),
        lastUpdatedBy: userId,
        completedAt: args.status !== "open" ? Date.now() : undefined,
      });
    }

    return { support };
  },
});

export const deleteSupportTicket = mutation({
  args: {
    ticketId: v.id("support"),
  },
  handler: async (ctx, args) => {
    const support = await ctx.db.get(args.ticketId);
    if (!support) return null;
    await ctx.db.delete(support._id);
    const kanbanCard = await ctx.db
      .query("todoKanban")
      .withIndex("by_ticketNumber", (q) => q.eq("ticketNumber", args.ticketId))
      .first();
    if (kanbanCard) {
      await ctx.db.delete(kanbanCard._id);
    }
  },
});

export const getNewSupportTickets = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role?.includes("admin");
    if (!user || !isAdmin) return null;
    const newSupportTickets = await ctx.db
      .query("support")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const numberOfTickets = newSupportTickets.length;

    return { tickets: newSupportTickets, newTickets: numberOfTickets };
  },
});

export const getSupportTickets = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const isAdmin = user?.role?.includes("admin");
    if (!isAdmin) return null;
    const supportTickets = await ctx.db.query("support").collect();
    const enrichedTickets = await Promise.all(
      supportTickets.map(async (ticket) => {
        const ticketNumber = ticket._id;
        const kanbanCard = await ctx.db
          .query("todoKanban")
          .withIndex("by_ticketNumber", (q) =>
            q.eq("ticketNumber", ticketNumber),
          )
          .first();
        return {
          ...ticket,
          kanbanId: kanbanCard?._id,
          priority: kanbanCard?.priority,
        };
      }),
    );
    return enrichedTickets;
  },
});
