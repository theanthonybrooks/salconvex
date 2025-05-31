import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";

import { formatSubscriptionLabel } from "@/lib/subscriptionFns";
import { getAuthSessionId, invalidateSessions } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { Id } from "~/convex/_generated/dataModel";
import { scryptCrypto } from "~/convex/auth";
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from "./_generated/server";

export const getTotalUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const nonAdminUsers = users.filter((user) => !user.role?.includes("admin"));

    return nonAdminUsers.length;
  },
});

export const usersWithSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    let userPlan = "";
    const users = await ctx.db.query("users").collect();

    return users.map(async (user) => {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      const name =
        fullName === user.name || !user.name
          ? fullName
          : `${fullName} (${user.name})`;

      const subscriptions = await ctx.db
        .query("userSubscriptions")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .collect();

      const formattedSubscriptions = subscriptions.map((sub) => {
        const planName = sub.metadata?.planName?.toLowerCase() ?? "unknown";
        const interval = sub.interval ?? "unknown";
        const label = formatSubscriptionLabel(planName, interval);
      });
      return {
        _id: user._id,
        name,
        email: user.email,
        subscription: formattedSubscriptions,
        accountType: user.accountType ?? [],
        role: user.role ?? "user",
        createdAt: user.createdAt,
        source: user.source,
      };
    });
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    if (user.role.includes("admin")) {
      return true;
    }

    return false;
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    // if (!userId) console.log("user id not found");
    if (!userId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    // console.log("userId", userId)
    // if (!user) console.log("user not found");

    if (!user) return null;
    // console.log("user", user.name);

    const userPref = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userPref) {
      console.log("userPref not found");
      return null;
    }

    return { userId, user, userPref };
  },
});

export const isNewUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    return user === null;
  },
});

export async function findUserByEmail(ctx: MutationCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();
}

export async function findUserByEmailPW(ctx: MutationCtx, email: string) {
  const userPW = await ctx.db
    .query("userPW")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  if (!userPW) return null;
  // if (!userPW) throw new ConvexError("User not found");

  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", userPW?.userId))
    .unique();

  return { userPW, user };
}

export const updateUser = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    organizationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      name: args.name,

      updatedAt: Date.now(),
    });

    if (args.organizationName) {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
        .unique();

      if (organization) {
        await ctx.db.patch(organization._id, {
          name: args.organizationName,
          updatedAt: Date.now(),
          lastUpdatedBy: user._id,
        });
      }
    }
  },
});

export const updateUserPrefs = mutation({
  args: {
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    // console.log("args", args)
    // console.log("args.currency", args.currency)
    // console.log("args.timezone", args.timezone)
    // console.log("args.theme", args.theme)
    // console.log("args.language", args.language)
    // console.log("userId", userId)
    const userPref = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userPref) {
      throw new ConvexError("User pref not found");
    }

    // console.log("userPref._id", userPref._id)
    // console.log("userPref", userPref)

    await ctx.db.patch(userPref._id, {
      currency: args.currency,
      timezone: args.timezone,
      theme: args.theme,
      language: args.language,
    });

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }
    await ctx.db.patch(user._id, {
      updatedAt: Date.now(),
    });
  },
});

// export const updateUserPrefs = mutation({
//   args: {
//     currency: v.optional(v.string()),
//     timezone: v.optional(v.string()),
//     theme: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx)
//     if (!userId) throw new ConvexError("Not authenticated")
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_userId", (q) => q.eq("userId", userId))

//     if (!user) throw new ConvexError("User not found")

//       await ctx.db.patch(user._id, {
//         currency: args.currency,
//         timezone: args.timezone,
//         theme: args.theme
//       })
//   },
// })

export const updateUserEmailVerification = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await findUserByEmail(ctx, args.email);
    //TODO: Check if this should be null or if this is okay
    if (!user) {
      throw new ConvexError("User not found");
    }
    await ctx.db.patch(user._id, {
      emailVerified: true,
      emailVerificationTime: Date.now(),
      userId: user._id,
      tokenIdentifier: user._id,
    });
  },
});

export async function checkPassword(
  ctx: MutationCtx,
  userId: Id<"users">,
  password: string,
) {
  // const user = await ctx.db
  //   .query("users")
  //   .withIndex("by_userId", (q) => q.eq("userId", userId))
  //   .unique();
  const user = await ctx.db
    .query("userPW")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  const isPasswordValid = await scryptCrypto.verifySecret(
    password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new ConvexError("Incorrect current password");
  }
}

export const updatePassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    currentPassword: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await findUserByEmailPW(ctx, args.email);

    if (!result) {
      throw new ConvexError("User not found");
    }
    const user = result.user;

    if (!user) {
      throw new ConvexError("User not found");
    }

    const userPW = result.userPW;
    const currentId = await getAuthUserId(ctx);
    const identity = await ctx.auth.getUserIdentity();

    if (args.method === "userUpdate") {
      if (args.userId && args.userId !== currentId) {
        throw new ConvexError("Password change not allowed. Incorrect userId.");
      }
      if (args.currentPassword && args.userId) {
        await checkPassword(ctx, args.userId, args.currentPassword);
        if (args.currentPassword === args.password) {
          throw new ConvexError(
            "New password can't be the same as the old one.",
          );
        }
      }
    }

    const hashedPassword = await scryptCrypto.hashSecret(args.password);
    await ctx.db.patch(userPW._id, {
      password: hashedPassword,
      // updatedAt: Date.now(),
      lastChanged: Date.now(),
      changedBy: args.method,
    });

    if (args.method === "userUpdate") {
      const authAccount = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q: any) =>
          q.eq("provider", "password").eq("userId", user._id),
        )
        .unique();

      if (authAccount) {
        await ctx.db.patch(authAccount._id, {
          secret: hashedPassword,
        });
      } else {
        throw new ConvexError("Auth account not found for this user.");
      }
    }

    const userAgent = !identity
      ? "forgotForm"
      : args.userId && currentId === args.userId
        ? "user"
        : "admin";

    await ctx.db.insert("passwordResetLog", {
      email: args.email,
      userId: user._id,
      timestamp: Date.now(),
      // ipAddress: ipAddress as string, // ensure string type
      userAgent,
      actionType: args.method,
    });
  },
});

//TODO:: Require users to first cancel any active subscriptions before deleting their account

export const deleteUnconfirmedUsers = internalMutation({
  handler: async (ctx) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    const unconfirmedUsers = await ctx.db
      .query("users")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", fifteenMinutesAgo))
      .filter((q) => q.eq(q.field("emailVerified"), false))
      .collect();

    const batchSize = 10;
    for (let i = 0; i < unconfirmedUsers.length; i += batchSize) {
      const batch = unconfirmedUsers.slice(i, i + batchSize);
      await Promise.all(
        batch.map((user) =>
          performDeleteAccount(ctx, {
            method: "signupTimeout",
            email: user.email,
          }).catch((error) =>
            console.error(
              `Failed to delete unconfirmed user ${user.email}:`,
              error,
            ),
          ),
        ),
      );
    }
  },
});

export const deleteAccount = mutation({
  args: {
    method: v.string(),
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await performDeleteAccount(ctx, args);
  },
});

async function performDeleteAccount(
  ctx: MutationCtx,
  args: { method: string; email?: string; userId?: string },
): Promise<void> {
  // Define the allowed methods and their configuration.
  type MethodType =
    | "deleteAccount"
    | "ban"
    | "cancelSignup"
    | "resentOtp"
    | "signupTimeout";

  if (
    ![
      "deleteAccount",
      "ban",
      "cancelSignup",
      "resentOtp",
      "signupTimeout",
    ].includes(args.method)
  ) {
    throw new ConvexError("Invalid method");
  }
  const method = args.method as MethodType;

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
  };

  const config = methodConfigs[method];

  let queryKey: "email" | "userId";
  let queryValue: string;

  if (config.requiresEmail) {
    if (!args.email) {
      throw new ConvexError(`Email is required for ${method}`);
    }
    queryKey = "email";
    queryValue = args.email;
  } else {
    // const userId = await getAuthUserId(ctx)
    const userId = args.userId;
    if (!userId) {
      throw new ConvexError("Unauthenticated call to mutation");
    }
    queryKey = "userId";
    queryValue = userId;
  }

  // Query the user based on the provided key.
  const user = await ctx.db
    .query("users")
    .withIndex(queryKey === "email" ? "email" : "by_userId", (q) =>
      q.eq(queryKey, queryValue),
    )
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  const userId = user._id;

  // Delete related documents.
  await deleteRelatedDocuments(ctx, userId);

  // Delete the user document if it exists.
  const userDoc = await ctx.db.get(userId);
  if (userDoc) {
    await ctx.db.delete(userId);
  }

  const userSubscriptions = await ctx.db
    .query("userSubscriptions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();

  // Log the deletion.
  await ctx.db.insert("deleteAccountLog", {
    email: user.email ?? "unknown",
    userId,
    timestamp: Date.now(),
    userAgent: config.userAgent,
    actionType: config.deleteType,
    accountCreatedAt: user.createdAt,
  });

  const userLogId = await ctx.db
    .query("userLog")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (userLogId) {
    await ctx.db.patch(userLogId._id, {
      deleted: true,
      deletedReason: config.deleteType,
      deletedTimestamp: Date.now(),
      deletedBy: config.userAgent,
    });
  } else {
    await ctx.db.insert("userLog", {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      active: false,
      banned: false,
      hadTrial: userSubscriptions[0]?.hadTrial || null,
      bannedReason: undefined,
      bannedTimestamp: undefined,
      banningAuthority: undefined,
      deleted: true,
      deletedReason: config.deleteType,
      deletedTimestamp: Date.now(),
      deletedBy: config.userAgent,
      accountTypes: user.accountType,
      userEmail: user.email,
    });
  }

  // await ctx.db.patch("userLog", userId), {

  // }
}

async function deleteRelatedDocuments(
  ctx: { db: { query: Function; delete: Function; get: Function } },
  userId: string,
) {
  const pageSize = 50;

  async function deleteInBatches(
    queryName: string,
    indexName: string,
    queryFn: (q: any) => any,
  ) {
    let hasMore = true;
    while (hasMore) {
      const docs = await ctx.db
        .query(queryName)
        .withIndex(indexName, queryFn)
        .limit(pageSize)
        .collect();
      if (docs.length === 0) {
        hasMore = false;
        break;
      }
      for (const doc of docs) {
        try {
          const existingDoc = await ctx.db.get(doc._id);
          if (existingDoc) {
            await ctx.db.delete(doc._id);
          }
        } catch (error) {
          console.error(
            `Error deleting document ${doc._id} in ${queryName}:`,
            error,
          );
        }
      }
    }
  }

  // 1. Delete passwordResetLog entries.
  await deleteInBatches("passwordResetLog", "userId", (q: any) =>
    q.eq("userId", userId),
  );

  // 2. Delete user preferences
  await deleteInBatches("userPreferences", "by_userId", (q: any) =>
    q.eq("userId", userId),
  );

  // 3. Delete authAccounts and then their verification codes.
  const authAccounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q: any) => q.eq("userId", userId))
    .collect();
  for (const account of authAccounts) {
    try {
      const accountDoc = await ctx.db.get(account._id);
      if (accountDoc) {
        await ctx.db.delete(account._id);
      }
    } catch (error) {
      console.error(`Error deleting authAccount ${account._id}:`, error);
    }
    // Delete authVerificationCodes linked to this account.
    await deleteInBatches("authVerificationCodes", "accountId", (q: any) =>
      q.eq("accountId", account._id),
    );
  }

  // 4. Delete authSessions and then their refresh tokens.
  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .collect();
  for (const session of sessions) {
    try {
      const sessionDoc = await ctx.db.get(session._id);
      if (sessionDoc) {
        await ctx.db.delete(session._id);
      }
    } catch (error) {
      console.error(`Error deleting authSession ${session._id}:`, error);
    }
    // Delete authRefreshTokens linked to this session.
    await deleteInBatches("authRefreshTokens", "sessionId", (q: any) =>
      q.eq("sessionId", session._id),
    );
  }
}

export const deleteSessions = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q: any) => q.eq("userId", args.userId))
      .collect();

    if (sessions.length === 0) {
      throw new ConvexError("No active sessions found");
    }

    await Promise.all(sessions.map((session) => ctx.db.delete(session._id)));
  },
});

export const invalidateSessionsAction = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await invalidateSessions(ctx, { userId: args.userId });
  },
});

export const countSessions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q: any) => q.eq("userId", args.userId))
      .collect();

    return sessions.length;
  },
});

// export const

export const currentSession = query({
  args: {},
  handler: async (ctx) => {
    const sessionId = await getAuthSessionId(ctx);
    if (sessionId === null) {
      return null;
    }
    return await ctx.db.get(sessionId);
  },
});
