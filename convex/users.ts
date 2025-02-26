import { v } from "convex/values"
import { MutationCtx, query } from "./_generated/server"
import { auth } from "./auth"

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)

    if (userId === null) {
      return null
    }

    return await ctx.db.get(userId)
  },
})

export const isNewUser = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.tokenIdentifier))
      .unique()
    return user === null
  },
})

export async function findUserByEmail(ctx: MutationCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .unique()
}
