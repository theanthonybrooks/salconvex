import { v } from "convex/values"
import { query } from "~/convex/_generated/server"

export const getEventByOrgId = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId)
    if (!org) return null

    const events = await ctx.db
      .query("events")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", org._id))
      .collect()

    return events
  },
})
