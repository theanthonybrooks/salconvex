import { v } from "convex/values"
import { mutation, MutationCtx, query } from "./_generated/server"
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

export const registerUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
    accountType: v.array(v.string()),
    name: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique()

    if (existingUser) {
      throw new Error("User already exists")
    }

    // If user doesn't exist, create a new one
    const userId = await ctx.db.insert("users", {
      role: ["guest"],
      createdAt: new Date().toISOString(),
      email: args.email!,
      password: args.password!, // Note: You should hash this password before storing
      firstName: args.firstName!,
      lastName: args.lastName!,
      name: args.name,
      accountType: args.accountType,
      organizationName: args.organizationName,
      source: args.source,
      userId: `user_${Date.now()}`,
      tokenIdentifier: `user_${Date.now()}`, // Generate a simple unique identifier
    })

    return { userId }
  },
})
