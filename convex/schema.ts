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
  emailVerificationTime: v.optional(v.number()),

  // Your custom fields
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  password: v.string(),
  passwordChangedBy: v.optional(v.string()),
  firstName: v.string(),
  lastName: v.string(),
  accountType: v.array(v.string()),
  source: v.optional(v.string()),
  userId: v.string(),
  role: v.array(v.string()),
  subscription: v.optional(v.string()),
  tokenIdentifier: v.string(),
  image: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
}

const artistSchema = {
  artistId: v.id("users"),
  artistName: v.optional(v.string()),
  artistNationality: v.optional(v.array(v.string())),
  artistResidency: v.optional(
    v.object({
      full: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      country: v.optional(v.string()),
      location: v.optional(v.array(v.string())),
    })
  ),
  documents: v.optional(
    v.object({
      cv: v.optional(v.string()),
      resume: v.optional(v.string()),
      artistStatement: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
    })
  ),
  applications: v.optional(
    v.array(
      v.object({
        applicationId: v.optional(v.string()),
        applicationStatus: v.optional(v.string()),
      })
    )
  ),
  listActions: v.optional(
    v.array(
      v.object({
        eventId: v.id("events"),
        hidden: v.boolean(),
        bookmarked: v.boolean(),
      })
    )
  ),
  updatedAt: v.optional(v.number()),
  lastUpdatedBy: v.optional(v.string()),
  completedProfile: v.boolean(),
}

const organizationSchema = {
  ownerId: v.id("users"),
  organizationName: v.string(),
  organizationId: v.string(),
  logo: v.string(),
  location: v.optional(
    v.object({
      locale: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      stateAbbr: v.optional(v.string()),
      region: v.optional(v.string()),
      country: v.string(),
      countryAbbr: v.string(),
      continent: v.string(),
    })
  ),
  about: v.optional(v.string()),
  contact: v.optional(
    v.object({
      organizer: v.string(),
      primaryContact: v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        href: v.optional(v.string()),
      }),
    })
  ),
  links: v.optional(
    v.object({
      website: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      threads: v.optional(v.string()),
      email: v.optional(v.string()),
      vk: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
    })
  ),
  hadFreeCall: v.boolean(),
  updatedAt: v.optional(v.number()),

  lastUpdatedBy: v.optional(v.string()),
  // events: v.array(v.id("events")),
  // TODO: Link organization to events and from events to open calls
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

  // Artist Tables
  artists: defineTable(artistSchema)
    .index("by_artistId", ["artistId"])
    .index("by_artistNationality", ["artistNationality"]),

  // Organization Tables
  organizations: defineTable(organizationSchema)
    .index("by_organizationName", ["organizationName"])
    .index("by_organizationId", ["organizationId"])
    .index("by_ownerId", ["ownerId"]),

  organizationSubscriptions: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    stripeId: v.string(),
    currency: v.string(),
    status: v.string(),
    amountSubtotal: v.number(),
    amountTotal: v.number(),
    amountDiscount: v.number(),
    metadata: v.any(),
    customerId: v.string(),
    paidStatus: v.string(),
  })
    .index("organizationId", ["organizationId"])
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"])
    .index("customerId", ["customerId"]),

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
    priority: v.optional(v.string()),
  }).index("by_column_order", ["column", "order"]),

  userPlans: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    stripeProductId: v.optional(v.string()),
    img: v.optional(v.string()),
    prices: v.object({
      month: v.optional(stripeIntervalPricesValidator),
      year: v.optional(stripeIntervalPricesValidator),
    }),
    features: v.optional(v.array(v.string())), // added features column
    popular: v.optional(v.boolean()), // added popular column
  })
    .index("key", ["key"])
    .index("stripeProductId", ["stripeProductId"]),

  orgPlans: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    stripeProductId: v.optional(v.string()),
    prices: v.optional(
      v.object({
        rate: v.number(),
      })
    ),
    features: v.optional(v.array(v.string())),
    popular: v.optional(v.boolean()),
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

  userPreferences: defineTable({
    userId: v.id("users"),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    language: v.optional(v.string()),
    theme: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Your other custom tables...
})
