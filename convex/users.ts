import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { Scrypt } from "lucia"
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from "./_generated/server"

const scrypt = new Scrypt()
const scryptCrypto = {
  hashSecret: async (secret: string): Promise<string> => {
    return scrypt.hash(secret)
  },
  verifySecret: async (secret: string, hash: string): Promise<boolean> => {
    return scrypt.verify(secret, hash)
  },
}

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (userId === null) {
      return null
    }

    return await ctx.db.get(userId)
  },
})

export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, { token }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique()

    if (!userId || !user) {
      return null
    }

    return { userId, user }
  },
})

export const isNewUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
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

export const updateUserEmailVerification = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await findUserByEmail(ctx, args.email)
    if (!user) {
      console.log("user not found")
      throw new Error("User not found")
    }
    await ctx.db.patch(user._id, {
      emailVerified: true,
      emailVerificationTime: Date.now(),
      userId: user._id,
      tokenIdentifier: user._id,
    })
  },
})

// export const updatePassword = mutation({
//   args: {
//     email: v.string(),
//     password: v.string(),
//     method: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const user = await findUserByEmail(ctx, args.email)
//     if (!user) {
//       throw new Error("User not found")
//     }
//     const hashedPassword = await scryptCrypto.hashSecret(args.password)
//     await ctx.db.patch(user._id, {
//       password: hashedPassword,
//       updatedAt: Date.now(),
//       passwordChangedBy: args.method,
//     })
//   },
// })

export const updatePassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await findUserByEmail(ctx, args.email)
    if (!user) {
      throw new Error("User not found")
    }
    const hashedPassword = await scryptCrypto.hashSecret(args.password)
    await ctx.db.patch(user._id, {
      password: hashedPassword,
      updatedAt: Date.now(),
      passwordChangedBy: args.method,
    })

    const currentId = await getAuthUserId(ctx)
    const identity = await ctx.auth.getUserIdentity()
    console.log("identity", identity)
    console.log("currentId", currentId)

    const userAgent = !identity
      ? "forgotForm"
      : identity.email === args.email &&
        currentId &&
        identity.subject.includes(currentId)
      ? "user"
      : "admin"

    //TODO: Come back to this and verify that how I'm approaching this is correct. I'm not certain that this is the best way to do this.

    await ctx.db.insert("passwordResetLog", {
      email: args.email,
      userId: user._id,
      timestamp: Date.now(),
      // ipAddress: ipAddress as string, // ensure string type
      userAgent,
      actionType: args.method,
    })
  },
})

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
      createdAt: Date.now(),
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

//NOTE: Require users to first cancel any active subscriptions before deleting their account

export const deleteUnconfirmedUsers = internalMutation({
  handler: async (ctx) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000
    const unconfirmedUsers = await ctx.db
      .query("users")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", fifteenMinutesAgo))
      .filter((q) => q.eq(q.field("emailVerified"), false))
      .collect()

    const batchSize = 10 // Tune this based on performance tests.
    for (let i = 0; i < unconfirmedUsers.length; i += batchSize) {
      const batch = unconfirmedUsers.slice(i, i + batchSize)
      await Promise.all(
        batch.map((user) =>
          deleteAccount(ctx, {
            method: "signupTimeout",
            email: user.email,
          }).catch((error) =>
            console.error(
              `Failed to delete unconfirmed user ${user.email}:`,
              error
            )
          )
        )
      )
    }
  },
})

export const deleteAccount = mutation({
  args: {
    method: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    type MethodType =
      | "deleteAccount"
      | "ban"
      | "cancelSignup"
      | "resentOtp"
      | "signupTimeout"

    if (
      ![
        "deleteAccount",
        "ban",
        "cancelSignup",
        "resentOtp",
        "signupTimeout",
      ].includes(args.method)
    ) {
      throw new Error("Invalid method")
    }

    const method = args.method as MethodType

    const methodConfigs: Record<
      MethodType,
      { deleteType: string; userAgent: string; requiresEmail: boolean }
    > = {
      deleteAccount: {
        deleteType: "deleteAccount",
        userAgent: "user-self",
        requiresEmail: false,
      },
      ban: { deleteType: "ban", userAgent: "admin", requiresEmail: false },
      cancelSignup: {
        deleteType: "cancelSignup",
        userAgent: "user-self",
        requiresEmail: true,
      },
      resentOtp: {
        deleteType: "resentOtp",
        userAgent: "user-self",
        requiresEmail: true,
      },
      signupTimeout: {
        deleteType: "signupTimeout",
        userAgent: "system",
        requiresEmail: true,
      },
    }

    const config = methodConfigs[method]

    let queryKey: "email" | "userId"
    let queryValue: string

    if (config.requiresEmail) {
      if (!args.email) {
        throw new Error(`Email is required for ${method}`)
      }
      queryKey = "email"
      queryValue = args.email
    } else {
      const userId = await getAuthUserId(ctx)
      if (!userId) {
        throw new Error("Unauthenticated call to mutation")
      }
      queryKey = "userId"
      queryValue = userId
    }

    // Query the user
    const user = await ctx.db
      .query("users")
      .withIndex(queryKey === "email" ? "email" : "by_userId", (q) =>
        q.eq(queryKey, queryValue)
      )
      .unique()

    if (!user) {
      throw new Error("User not found")
    }

    const userId = user._id

    await deleteRelatedDocuments(ctx, userId)

    const userDoc = await ctx.db.get(userId)
    if (userDoc) {
      await ctx.db.delete(userId)
    }

    await ctx.db.insert("deleteAccountLog", {
      email: user.email ?? "unknown",
      userId,
      timestamp: Date.now(),
      userAgent: config.userAgent,
      actionType: config.deleteType,
      accountCreatedAt: user.createdAt,
    })
  },
})

async function deleteRelatedDocuments(
  ctx: { db: { query: Function; delete: Function; get: Function } },
  userId: string
) {
  const pageSize = 50

  async function deleteInBatches(
    queryName: string,
    indexName: string,
    queryFn: (q: any) => any
  ) {
    let hasMore = true
    while (hasMore) {
      const docs = await ctx.db
        .query(queryName)
        .withIndex(indexName, queryFn)
        .limit(pageSize)
        .collect()
      if (docs.length === 0) {
        hasMore = false
        break
      }
      for (const doc of docs) {
        try {
          const existingDoc = await ctx.db.get(doc._id)
          if (existingDoc) {
            await ctx.db.delete(doc._id)
          }
        } catch (error) {
          console.error(
            `Error deleting document ${doc._id} in ${queryName}:`,
            error
          )
        }
      }
    }
  }

  // 1. Delete authAccounts and then their verification codes.
  const authAccounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q: any) => q.eq("userId", userId))
    .collect()
  for (const account of authAccounts) {
    try {
      const accountDoc = await ctx.db.get(account._id)
      if (accountDoc) {
        await ctx.db.delete(account._id)
      }
    } catch (error) {
      console.error(`Error deleting authAccount ${account._id}:`, error)
    }
    // Delete authVerificationCodes linked to this account.
    await deleteInBatches("authVerificationCodes", "accountId", (q: any) =>
      q.eq("accountId", account._id)
    )
  }

  // 2. Delete authSessions and then their refresh tokens.
  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .collect()
  for (const session of sessions) {
    try {
      const sessionDoc = await ctx.db.get(session._id)
      if (sessionDoc) {
        await ctx.db.delete(session._id)
      }
    } catch (error) {
      console.error(`Error deleting authSession ${session._id}:`, error)
    }
    // Delete authRefreshTokens linked to this session.
    await deleteInBatches("authRefreshTokens", "sessionId", (q: any) =>
      q.eq("sessionId", session._id)
    )
  }

  // 3. Delete passwordResetLog entries.
  await deleteInBatches("passwordResetLog", "userId", (q: any) =>
    q.eq("userId", userId)
  )
}
