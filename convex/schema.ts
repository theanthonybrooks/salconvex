import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Define a price object structure that matches your data
const stripePriceValidator = v.object({
  amount: v.number(),
  stripeId: v.string(),
})

// Define a prices object structure for a specific interval
const stripeIntervalPricesValidator = v.object({
  usd: stripePriceValidator,
})

const customUserSchema = {
  // Include Convex Auth fields you want to use
  name: v.optional(v.string()),
  email: v.string(),
  emailVerificationTime: v.optional(v.union(v.number(), v.null())),

  // Your custom fields
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  password: v.string(),
  passwordChangedBy: v.optional(v.string()),
  firstName: v.string(),
  lastName: v.string(),
  accountType: v.optional(v.array(v.string())),
  organizationName: v.optional(v.string()),
  source: v.optional(v.string()),
  userId: v.string(),
  role: v.array(v.string()),
  subscription: v.optional(v.string()),
  tokenIdentifier: v.string(),
  image: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
}

export default defineSchema({
  ...authTables, // This includes other auth tables
  users: defineTable(customUserSchema)
    .index("email", ["email"])
    .index("by_userId", ["userId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_createdAt", ["createdAt"]),
  passwordResetLog: defineTable({
    email: v.string(),
    userId: v.string(),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.string(),
    actionType: v.string(),
  })
    .index("email", ["email"])
    .index("userId", ["userId"]),

  deleteAccountLog: defineTable({
    email: v.string(),
    userId: v.string(),
    timestamp: v.number(),
    userAgent: v.string(),
    actionType: v.string(),
    accountCreatedAt: v.number(),
  })
    .index("email", ["email"])
    .index("userId", ["userId"]),

  todoKanban: defineTable({
    title: v.string(),
    column: v.union(
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done")
    ),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastUpdatedBy: v.string(),
  }).index("by_column_order", ["column", "order"]),

  userPlans: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    stripeProductId: v.optional(v.string()),
    prices: v.object({
      month: v.optional(stripeIntervalPricesValidator),
      year: v.optional(stripeIntervalPricesValidator),
    }),
    features: v.optional(v.array(v.string())), // added features column
    popular: v.optional(v.boolean()), // added popular column
  })
    .index("key", ["key"])
    .index("stripeProductId", ["stripeProductId"]),

  userSubscriptions: defineTable({
    userId: v.optional(v.string()),
    stripeId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    intervalNext: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    hadTrial: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    amountNext: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
    lastEditedAt: v.optional(v.number()),
    paidStatus: v.optional(v.boolean()),
  })
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"])
    .index("customerId", ["customerId"]),

  stripeWebhookEvents: defineTable({
    type: v.string(),
    stripeEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("stripeEventId", ["stripeEventId"]),

  // Your other custom tables...
})
