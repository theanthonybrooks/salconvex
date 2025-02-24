import { defineSchema, defineTable } from "convex/server"
import { Infer, v, Validator } from "convex/values"

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const

export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR)
)

export type Interval = Infer<typeof intervalValidator>

// Define a price object structure that matches your data
const priceValidator = v.object({
  amount: v.number(),
  polarId: v.string(),
})

// Define a prices object structure for a specific interval
const intervalPricesValidator = v.object({
  usd: priceValidator,
})
// Define a price object structure that matches your data
const stripePriceValidator = v.object({
  amount: v.number(),
  stripeId: v.string(),
})

// Define a prices object structure for a specific interval
const stripeIntervalPricesValidator = v.object({
  usd: stripePriceValidator,
})

// export const userSchema = {
//   email: v.string(),
//   name: v.optional(v.string()),
//   emailVerified: v.optional(v.number()),
//   image: v.optional(v.string()),
// }

export const sessionSchema = {
  userId: v.id("users"),
  expires: v.number(),
  sessionToken: v.string(),
}

export const accountSchema = {
  userId: v.id("users"),
  type: v.union(
    v.literal("email"),
    v.literal("oidc"),
    v.literal("oauth"),
    v.literal("webauthn")
  ),
  provider: v.string(),
  providerAccountId: v.string(),
  refresh_token: v.optional(v.string()),
  access_token: v.optional(v.string()),
  expires_at: v.optional(v.number()),
  token_type: v.optional(v.string() as Validator<Lowercase<string>>),
  scope: v.optional(v.string()),
  id_token: v.optional(v.string()),
  session_state: v.optional(v.string()),
}

export const verificationTokenSchema = {
  identifier: v.string(),
  token: v.string(),
  expires: v.number(),
}

export const authenticatorSchema = {
  credentialID: v.string(),
  userId: v.id("users"),
  providerAccountId: v.string(),
  credentialPublicKey: v.string(),
  counter: v.number(),
  credentialDeviceType: v.string(),
  credentialBackedUp: v.boolean(),
  transports: v.optional(v.string()),
}

export const userSchema = {
  createdAt: v.string(),
  email: v.string(),
  password: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  name: v.optional(v.string()),

  accountType: v.array(v.string()),
  organizationName: v.optional(v.string()), // look into how I need to connect this to the organization table
  source: v.optional(v.string()),
  emailVerified: v.optional(v.number()),

  image: v.optional(v.string()),
  userId: v.string(),
  role: v.array(v.string()),
  // role: v.optional(v.string()),

  subscription: v.optional(v.string()),
  // stripeSubscription: v.optional(v.string()),
  tokenIdentifier: v.string(),
}

const authTables = {
  users: defineTable(userSchema)
    .index("email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  sessions: defineTable(sessionSchema)
    .index("sessionToken", ["sessionToken"])
    .index("userId", ["userId"]),
  accounts: defineTable(accountSchema)
    .index("providerAndAccountId", ["provider", "providerAccountId"])
    .index("userId", ["userId"]),
  verificationTokens: defineTable(verificationTokenSchema).index(
    "identifierToken",
    ["identifier", "token"]
  ),
  authenticators: defineTable(authenticatorSchema)
    .index("userId", ["userId"])
    .index("credentialID", ["credentialID"]),
}

export default defineSchema({
  ...authTables,

  plans: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    polarProductId: v.string(),
    prices: v.object({
      month: v.optional(intervalPricesValidator),
      year: v.optional(intervalPricesValidator),
    }),
    features: v.optional(v.array(v.string())), // added features column
    popular: v.optional(v.boolean()), // added popular column
  })
    .index("key", ["key"])
    .index("polarProductId", ["polarProductId"]),

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

  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),

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

  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),

  stripeWebhookEvents: defineTable({
    type: v.string(),
    stripeEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("stripeEventId", ["stripeEventId"]),
})
