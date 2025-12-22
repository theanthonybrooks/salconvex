import { generateNumericToken } from "@/helpers/otpFns";
import {
  formatSubscriptionLabel,
  getCancelReasonLabel,
  getFeedbackLabel,
} from "@/helpers/subscriptionFns";

import {
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
} from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { scryptCrypto } from "~/convex/auth";
import { updateOrgOwnerBeforeDelete } from "~/convex/organizer/organizations";
import {
  AccountType,
  accountTypeArrayValidator,
  inAppNotificationValidator,
  UserPrefsType,
  userPrefsValidator,
  UserRole,
  userRoleArrayValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";
import {
  internalAction,
  internalMutation,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";

export const getUserById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    return user;
  },
});

export const updateUserLastActive = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    let userId = null;
    const identity = await getAuthUserId(ctx);
    const userByEmail = !identity
      ? await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", args.email))
          .first()
      : null;
    if (identity) {
      userId = identity;
    } else {
      userId = userByEmail?._id;
    }
    if (!userId) {
      console.log("User not found", args.email ?? "No email provided");
      // throw new Error("User not found");
      return null;
    }

    await ctx.db.patch(userId, {
      lastActive: Date.now(),
    });
  },
});

export const getFatcapUsers = query({
  handler: async (ctx) => {
    const fatcaps = await ctx.db
      .query("users")
      .withIndex("by_plan", (q) => q.eq("plan", 3))
      .collect();

    return fatcaps;
  },
});

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
    const users = await ctx.db.query("users").collect();
    let totalPerMonth = 0;
    let totalThisYear = 0;
    let totalMonthly = 0;
    let totalYearly = 0;
    let totalThisMonth = 0;
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const nextMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );

    const results = await Promise.all(
      users.map(async (user) => {
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        const name =
          fullName === user.name || !user.name
            ? fullName
            : `${fullName} (${user.name})`;

        const subscription = await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .first();

        const artistProfile = await ctx.db
          .query("artists")
          .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
          .first();
        const lastUpdated = subscription?.lastEditedAt;
        const activeSub =
          subscription?.status === "active" ||
          subscription?.status === "trialing";

        const artistIG = artistProfile?.contact?.instagram;
        const artistWebsite = artistProfile?.contact?.website;
        const artistCanFeature = artistProfile?.canFeature;
        const artistNationalities: string[] = Array.from(
          new Set([
            ...(artistProfile?.artistNationality ?? []),
            ...(artistProfile?.artistResidency?.country
              ? [artistProfile.artistResidency.country]
              : []),
          ]),
        ).sort((a, b) => a.localeCompare(b));

        const planName = subscription?.metadata?.plan?.toLowerCase();
        const cancelAt = subscription?.cancelAt;
        const canceledAt = subscription?.canceledAt;
        const customerId = subscription?.customerId;

        const currentStatus = cancelAt ? "canceled" : subscription?.status;
        const inactiveStatus =
          currentStatus === "canceled" || currentStatus === "past_due";
        const cancelReason = cancelAt
          ? getCancelReasonLabel(subscription?.customerCancellationReason)
          : undefined;
        const cancelComment = cancelAt
          ? subscription?.customerCancellationComment
          : undefined;
        const cancelFeedback = cancelAt
          ? getFeedbackLabel(subscription?.customerCancellationFeedback)
          : undefined;
        const interval = subscription?.interval ?? "unknown";
        const subAmount = activeSub && !cancelAt ? subscription?.amount : 0;
        let amount = subAmount ?? 0;
        if (subscription?.discountPercent) {
          amount = amount * (1 - subscription.discountPercent / 100);
        } else if (subscription?.discountAmount) {
          amount = amount - subscription.discountAmount;
        }
        const trialEndsAt = subscription?.trialEndsAt
          ? new Date(subscription.trialEndsAt)
          : null;
        const currentPeriodEndAt = subscription?.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd)
          : null;
        const trialEnded = trialEndsAt && today > trialEndsAt;

        const trialEndsThisMonth =
          trialEndsAt &&
          trialEndsAt >= monthStart &&
          trialEndsAt < nextMonthStart;
        const periodEndsThisMonth =
          currentPeriodEndAt &&
          currentPeriodEndAt >= monthStart &&
          currentPeriodEndAt < nextMonthStart;
        if (!inactiveStatus) {
          if (interval === "month") {
            if (trialEndsThisMonth || trialEnded) {
              totalThisMonth += amount;
            }
            totalThisYear += amount * 12;
            totalMonthly += amount;
          } else if (interval === "year") {
            if (trialEndsThisMonth || periodEndsThisMonth) {
              // console.log("trialEndsThisMonth", trialEndsThisMonth, amount);
              totalThisMonth += amount;
              // console.log("periodEndsThisMonth", periodEndsThisMonth, amount);
            }
            totalThisYear += amount;
            totalPerMonth += amount / 12;
            totalYearly += amount;
          }
        }

        const label =
          subscription && planName
            ? formatSubscriptionLabel(planName, interval)
            : null;

        const organizations = await ctx.db
          .query("organizations")
          .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
          .collect();

        const orgIds = organizations.map((org) => org._id);
        const orgNameMap = new Map(
          organizations.map((org) => [org._id.toString(), org.name]),
        );
        const orgNames = orgIds
          .map((orgId) => orgNameMap.get(orgId))
          .filter((name): name is string => typeof name === "string");

        return {
          _id: user._id,
          artistId: artistProfile?._id,
          customerId,
          name,
          location: artistNationalities ?? [],
          instagram: artistIG,
          website: artistWebsite,
          canFeature: artistCanFeature ?? false,
          email: user.email,
          subscription: label ?? undefined,
          subStatus: currentStatus,
          accountType: user.accountType ?? [],
          cancelFeedback,
          cancelComment,
          cancelReason,
          canceledAt,
          lastActive: user.lastActive ?? 0,
          role: user.role ?? ["user"],
          organizationNames: orgNames ?? [],
          createdAt: user.createdAt,
          lastUpdated,
          source: user.source || undefined,
        };
      }),
    );
    totalThisMonth = totalThisMonth / 100;
    totalThisYear = totalThisYear / 100;
    totalMonthly = totalMonthly / 100;
    totalYearly = totalYearly / 100;

    return {
      users: results,
      totalThisMonth,
      totalThisYear,
      totalMonthly,
      totalYearly,
    };
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    // if (!user) throw new ConvexError("User not found");
    if (user?.role.includes("admin") || user?.role.includes("creator")) {
      return true;
    }

    return false;
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
//TODO: Make this assign a random string to each user when they view the site (not logged in) that will be used to identify them in the analytics. Something clearly identifiable from the convex ids.
export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const sessionId = await getAuthSessionId(ctx);
    const userId = sessionId ? await getAuthUserId(ctx) : null;
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user || !userId) return null;
    const userPref = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userPref) return null;
    if (!user?.role?.includes("admin")) {
      console.log("query called: ", user);
    }
    return { userId, user, userPref };
  },
});

export const isNewUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const emailFormatted = args.email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", emailFormatted))
      .unique();

    if (user && user?.emailVerified === false) {
      return true;
    }
    return user === null;
  },
});

export async function findUserByEmail(
  ctx: MutationCtx | QueryCtx,
  email: string,
) {
  const emailFormatted = email.toLowerCase().trim();
  return await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", emailFormatted))
    .unique();
}

export async function findUserByEmailPW(
  ctx: MutationCtx | QueryCtx,
  email: string,
) {
  const emailFormatted = email.toLowerCase().trim();
  const userPW = await ctx.db
    .query("userPW")
    .withIndex("by_email", (q) => q.eq("email", emailFormatted))
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
    accountType: v.optional(accountTypeArrayValidator),
    role: v.optional(userRoleArrayValidator),
    targetOtherUser: v.optional(v.boolean()),
    otherUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { targetOtherUser, otherUserId } = args;
    const userId = !targetOtherUser
      ? await getAuthUserId(ctx)
      : (otherUserId ?? null);
    if (!userId) return null;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.firstName && { firstName: args.firstName }),
      ...(args.lastName && { lastName: args.lastName }),
      ...(args.email && { email: args.email }),
      ...(args.name && { name: args.name }),
      ...(args.accountType && { accountType: args.accountType }),
      ...(args.role && { role: args.role }),
      updatedAt: Date.now(),
    });

    if (args.accountType?.length) {
      await syncAccountTypes(ctx, user._id, args.accountType);
    }

    if (args.role?.length) {
      await syncRoles(ctx, user._id, args.role);
    }

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

export const deletePendingEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { success: false, message: "No user found" };
    const pendingEmail = await ctx.db
      .query("userEmail")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!pendingEmail)
      return { success: false, message: "No pending email found" };
    await ctx.db.delete(pendingEmail._id);
    return { success: true, message: "Email verification code deleted!" };
  },
});

export const setPendingEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user) return { success: false, message: "User not found" };
    if (user.email === args.email)
      return { success: false, message: "Email already set" };
    const otpCode = generateNumericToken(6);
    await ctx.db.insert("userEmail", {
      userId: user._id,
      currentEmail: user.email,
      pendingEmail: args.email,

      otpCode,
    });
    return {
      success: true,
      message: "Email verification code sent!",
      code: otpCode,
    };
  },
});

export const verifyEmail = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user)
      return { success: false, message: "User not found", clear: true };
    const pendingEmail = await ctx.db
      .query("userEmail")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!pendingEmail)
      return { success: false, message: "No pending email found", clear: true };
    const authAccount = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", user._id).eq("provider", "password"),
      )
      .first();
    const newsletterSub = await ctx.db
      .query("newsletter")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!authAccount)
      return { success: false, message: "No auth account found", clear: true };
    if (args.code === pendingEmail.otpCode) {
      await ctx.db.patch(user._id, {
        email: pendingEmail.pendingEmail,
        emailVerificationTime: Date.now(),
        emailVerified: true,
      });
      await ctx.db.patch(authAccount._id, {
        emailVerified: pendingEmail.pendingEmail,
        providerAccountId: pendingEmail.pendingEmail,
      });
      if (newsletterSub) {
        await ctx.db.patch(newsletterSub._id, {
          email: pendingEmail.pendingEmail,
        });
      }
    } else {
      const otpCode = generateNumericToken(6);
      await ctx.db.insert("userEmail", {
        userId: user._id,
        currentEmail: user.email,
        pendingEmail: pendingEmail.pendingEmail,
        otpCode,
      });
      return {
        success: false,
        message: "Incorrect code - check your email for a new code",
        clear: false,
      };
    }
    await ctx.db.delete(pendingEmail._id);
    return { success: true, message: "Email verified", clear: true };
  },
});

function pickDefined<T extends object>(obj: T, keys: (keyof T)[]) {
  const out: Partial<T> = {};
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

export const updateUserPrefs = mutation({
  args: userPrefsValidator,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userPref = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!userPref) throw new ConvexError("User pref not found");

    const keys = Object.keys(
      userPrefsValidator.fields,
    ) as (keyof UserPrefsType)[];
    const update = pickDefined(args, keys);

    if (Object.keys(update).length > 0) {
      await ctx.db.patch(userPref._id, {
        ...update,
        lastUpdated: Date.now(),
      });
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    await ctx.db.patch(user._id, { updatedAt: Date.now() });
  },
});

export const updateUserCookiePreferences = mutation({
  args: {
    cookiePrefs: v.optional(v.union(v.literal("all"), v.literal("required"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userPrefs) {
      throw new ConvexError("User pref not found" + userId);
    }

    await ctx.db.patch(userPrefs._id, {
      cookiePrefs: args.cookiePrefs,
      lastUpdated: Date.now(),
    });
  },
});

export const updateUserNotifications = mutation({
  args: {
    newsletter: v.optional(v.boolean()),
    general: v.optional(v.boolean()),
    applications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userPrefs) {
      throw new ConvexError("User pref not found");
    }
    await ctx.db.patch(userPrefs._id, {
      notifications: {
        inAppNotifications: userPrefs.notifications?.inAppNotifications ?? {},
        ...userPrefs.notifications,
        ...args,
      },
      lastUpdated: Date.now(),
    });
  },
});

export const updateUserInAppNotifications = mutation({
  args: {
    inAppNotifications: v.union(v.boolean(), inAppNotificationValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user || !userId) {
      return { success: false, message: "User not found" };
    }

    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userPrefs) {
      throw new ConvexError("User pref not found");
    }

    const existingNotifications = userPrefs.notifications ?? {
      inAppNotifications: false,
    };
    const existingPushObject =
      typeof existingNotifications.inAppNotifications === "object" &&
      existingNotifications.inAppNotifications !== null
        ? existingNotifications.inAppNotifications
        : undefined;

    let newPush: boolean | typeof existingPushObject;

    if (args.inAppNotifications === false) {
      newPush = {};
    } else if (args.inAppNotifications === true) {
      newPush = { account: true };
    } else {
      newPush = {
        ...(existingPushObject ?? {}),
        ...args.inAppNotifications,
      };
    }

    await ctx.db.patch(userPrefs._id, {
      notifications: {
        ...existingNotifications,
        inAppNotifications: newPush,
      },
      lastUpdated: Date.now(),
    });

    return { success: true };
  },
});

export const getUserThemePrefsByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (!user) return null;
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!userPrefs) return null;
    return userPrefs.theme;
  },
});

// export const updateUserPrefs = mutation({
//   args: {
//     autoApply: v.optional(v.boolean()),
//     currency: v.optional(v.string()),
//     timezone: v.optional(v.string()),
//     theme: v.optional(v.string()),
//     fontSize: v.optional(v.string()),
//     language: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     // if (!userId) throw new ConvexError("Not authenticated");
//     if (!userId) return null;
//     // console.log("args", args)
//     // console.log("args.currency", args.currency)
//     // console.log("args.timezone", args.timezone)
//     // console.log("args.theme", args.theme)
//     // console.log("args.language", args.language)
//     // console.log("userId", userId)
//     const userPref = await ctx.db
//       .query("userPreferences")
//       .withIndex("by_userId", (q) => q.eq("userId", userId))
//       .unique();

//     if (!userPref) {
//       throw new ConvexError("User pref not found");
//     }

//     // console.log("userPref._id", userPref._id)
//     // console.log("userPref", userPref)

//     await ctx.db.patch(userPref._id, {
//       autoApply: args.autoApply,
//       currency: args.currency,
//       timezone: args.timezone,
//       theme: args.theme,
//       language: args.language,
//       fontSize: args.fontSize,
//     });

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_userId", (q) => q.eq("userId", userId))
//       .unique();

//     if (!user) {
//       throw new ConvexError("User not found");
//     }
//     await ctx.db.patch(user._id, {
//       updatedAt: Date.now(),
//     });
//   },
// });

export const hasVerifiedEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);
    const user = await findUserByEmail(ctx, args.email);
    if (!user) {
      throw new ConvexError("User not found: " + args.email);
    }
    console.log("verified", user?.emailVerified);
    return { verified: user?.emailVerified, userId: user._id, name: user.name };
  },
});

export const updateUserEmailVerification = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await findUserByEmail(ctx, args.email);
    if (!user) {
      throw new ConvexError("User not found: " + args.email);
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
        .withIndex("userIdAndProvider", (q) =>
          q.eq("userId", user._id).eq("provider", "password"),
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

//TODO:: Require users to first cancel all active subscriptions before deleting their account

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

export const deleteUnverifiedPendingEmails = internalMutation({
  args: {
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

    const batch = await ctx.db
      .query("userEmail")
      .withIndex("by_creation_time", (q) =>
        q.lt("_creationTime", fifteenMinutesAgo),
      )
      .paginate({
        cursor: args.cursor ?? null,
        numItems: 200,
      });

    await Promise.all(
      batch.page.map((pendingEmail) =>
        ctx.db.delete(pendingEmail._id).catch((error) => {
          console.error(
            `Failed to delete unverified email: ${pendingEmail.pendingEmail}:`,
            error,
          );
        }),
      ),
    );

    if (!batch.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.users.deleteUnverifiedPendingEmails,
        { cursor: batch.continueCursor },
      );
    }
  },
});

export const deleteAccount = mutation({
  args: {
    method: v.string(),
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // console.log("args", args);
    let userId: Id<"users"> | undefined = undefined;
    let agent: string = "user-self";
    if (args.userId) {
      userId = args.userId;
    } else if (args.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email ?? ""))
        .unique();
      if (user) {
        userId = user._id;
        if (user.role.includes("admin")) {
          agent = "admin";
        }
      }
    }
    await performDeleteAccount(ctx, { ...args, agent });
    if (userId) {
      await updateOrgOwnerBeforeDelete(ctx, userId);
    }
  },
});

async function performDeleteAccount(
  ctx: MutationCtx,
  args: {
    method: string;
    email?: string;
    userId?: Id<"users">;
    agent?: string;
  },
): Promise<void> {
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
  const agent = args.agent;

  const methodConfigs: Record<
    MethodType,
    { deleteType: string; userAgent: string; requiresEmail: boolean }
  > = {
    deleteAccount: {
      deleteType: "deleteAccount",
      userAgent: agent ?? "user-self",
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

  let queryKey: "email" | "_id";
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
    queryKey = "_id";
    queryValue = userId;
  }

  const user = await ctx.db
    .query("users")
    .withIndex(queryKey === "email" ? "email" : "by_id", (q) =>
      q.eq(queryKey, queryValue),
    )
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  const userId = user._id;

  await deleteRelatedDocuments(ctx, userId);

  const userDoc = await ctx.db.get(userId);
  if (userDoc) {
    await ctx.db.delete(userId);
  }

  const userSubscriptions = await ctx.db
    .query("userSubscriptions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();

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
    .first();
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
}

export const deleteSessions = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (sessions.length === 0) {
      throw new ConvexError("No active sessions found");
    }

    await Promise.all(sessions.map((session) => ctx.db.delete(session._id)));
    await ctx.scheduler.runAfter(0, internal.users.forceLogoutUser, {
      userId: args.userId,
    });
  },
});

export const forceLogoutUser = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await invalidateSessions(ctx, { userId: args.userId });
  },
});

export const countSessions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
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

export const deleteOrphanedUserPw = internalMutation({
  args: {},
  handler: async (ctx) => {
    const userPWs = await ctx.db.query("userPW").collect();
    for (const pw of userPWs) {
      const user = await ctx.db.get(pw.userId);
      if (!user) {
        await ctx.db.delete(pw._id);
      }
    }
  },
});

export async function syncAccountTypes(
  ctx: MutationCtx,
  userId: Id<"users">,
  accountTypes: AccountType,
) {
  if (!accountTypes?.length) return;

  const existingAccountTypes = await ctx.db
    .query("userAccountTypes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  // Add new ones
  const newAccountTypes = accountTypes.filter(
    (type) =>
      !existingAccountTypes.some((existing) => existing.accountType === type),
  );
  for (const type of newAccountTypes) {
    await ctx.db.insert("userAccountTypes", { userId, accountType: type });
  }

  // Remove ones no longer present
  const toDelete = existingAccountTypes.filter(
    (existing) => !accountTypes.includes(existing.accountType),
  );
  for (const item of toDelete) {
    await ctx.db.delete(item._id);
  }
}

export async function syncRoles(
  ctx: MutationCtx,
  userId: Id<"users">,
  roles: UserRole,
) {
  if (!roles?.length) return;

  const existingRoles = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  // Add new ones
  const newRoles = roles.filter(
    (role) => !existingRoles.some((existing) => existing.role === role),
  );
  for (const role of newRoles) {
    await ctx.db.insert("userRoles", { userId, role });
  }

  // Remove ones no longer present
  const toDelete = existingRoles.filter(
    (existing) => !roles.includes(existing.role),
  );
  for (const item of toDelete) {
    await ctx.db.delete(item._id);
  }
}

export async function deleteRelatedDocuments(
  ctx: MutationCtx,
  userId: Id<"users">,
) {
  const pageSize = 50;

  // 1. Delete passwordResetLog entries.
  try {
    while (true) {
      const docs = await ctx.db
        .query("passwordResetLog")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .take(pageSize);
      if (docs.length === 0) break;
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  } catch (error) {
    console.error("Error deleting passwordResetLog:", userId, error);
  }

  // 2. Delete user preferences
  try {
    while (true) {
      const docs = await ctx.db
        .query("userPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(pageSize);
      if (docs.length === 0) break;
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  } catch (error) {
    console.error("Error deleting userPreferences:", userId, error);
  }

  // 3. Delete notifications
  try {
    while (true) {
      const docs = await ctx.db
        .query("notifications")
        .withIndex("by_userId_dismissed_updatedAt", (q) =>
          q.eq("userId", userId),
        )
        .take(pageSize);
      if (docs.length === 0) break;
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  } catch (error) {
    console.error("Error deleting notifications:", userId, error);
  }

  // Newsletter subscription: patch instead of delete
  try {
    const newsletterSub = await ctx.db
      .query("newsletter")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (newsletterSub) {
      await ctx.db.patch(newsletterSub._id, {
        userId: null,
        userPlan: 0,
      });
    }
  } catch (error) {
    console.error("Error deleting newsletter subscription:", userId, error);
  }
  // 3. Delete user organizations if incomplete
  try {
    const incompleteOrgs = await ctx.db
      .query("organizations")
      .withIndex("by_complete_with_ownerId", (q) =>
        q.eq("isComplete", false).eq("ownerId", userId),
      )
      .collect();

    for (const org of incompleteOrgs) {
      await ctx.db.delete(org._id);
    }
  } catch (error) {
    console.error("Error deleting user organizations:", userId, error);
  }

  // 3.1 Change completed orgs to admin ownership
  try {
    const completedOrgs = await ctx.db
      .query("organizations")
      .withIndex("by_complete_with_ownerId", (q) =>
        q.eq("isComplete", true).eq("ownerId", userId),
      )
      .collect();

    const creator = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "creator"))
      .first();

    if (creator) {
      const creatorUserId = creator.userId;
      for (const org of completedOrgs) {
        await ctx.db.patch(org._id, {
          ownerId: creatorUserId,
          updatedAt: Date.now(),
          lastUpdatedBy: "system admin",
        });
      }
    }
  } catch (error) {
    console.error(
      "Error changing completed orgs to admin ownership:",
      userId,
      error,
    );
  }

  // 4. Delete authAccounts and then their verification codes.
  try {
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.delete(account._id);

      // Delete authVerificationCodes linked to this account.
      while (true) {
        const codes = await ctx.db
          .query("authVerificationCodes")
          .withIndex("accountId", (q) => q.eq("accountId", account._id))
          .take(pageSize);
        if (codes.length === 0) break;
        for (const code of codes) {
          await ctx.db.delete(code._id);
        }
      }
    }
  } catch (error) {
    console.error("Error deleting authAccounts:", userId, error);
  }

  // 4.1 Delete User Password
  try {
    const userPWs = await ctx.db
      .query("userPW")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const pw of userPWs) {
      await ctx.db.delete(pw._id);
    }
  } catch (error) {
    console.error("Error deleting user password:", error);
  }

  // 4.2 Delete authSessions and then their refresh tokens.
  try {
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);

      while (true) {
        const tokens = await ctx.db
          .query("authRefreshTokens")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .take(pageSize);
        if (tokens.length === 0) break;
        for (const token of tokens) {
          await ctx.db.delete(token._id);
        }
      }
    }
  } catch (error) {
    console.error("Error deleting authSessions:", error);
  }
}
