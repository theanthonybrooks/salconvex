import { v } from "convex/values";
import { query } from "~/convex/_generated/server";

export const getOpenCallByOrgId = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", org._id))
      .collect();

    return openCalls;
  },
});

export const getPublishedOpenCalls = query({
  handler: async (ctx) => {
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    return openCalls;
  },
});

export const getOpenCallByEventId = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();

    return openCall;
  },
});
