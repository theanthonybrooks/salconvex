import { query } from "./_generated/server"

export const getUserPlans = query({
  handler: async (ctx) => {
    const plans = await ctx.db.query("userPlans").collect()

    return plans
  },
})
