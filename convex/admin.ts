import { SupportCategory } from "@/constants/supportConsts";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ShardedCounter } from "@convex-dev/sharded-counter";
import { ConvexError, v } from "convex/values";
import { components } from "~/convex/_generated/api";
import { mutation, query } from "~/convex/_generated/server";

export const counter = new ShardedCounter(components.shardedCounter);

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

    await ctx.db.insert("todoKanban", {
      title: "Support Ticket #" + ticketNumber,
      description,
      column: "proposed",
      order: 0,
      priority: "high",
      category: args.category as SupportCategory,
      public: true,
      purpose: supportPurpose,
      voters: [],
      createdAt: Date.now(),
      lastUpdatedBy: userId ?? "guest",
      ticketNumber: support,
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
