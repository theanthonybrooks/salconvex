import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

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
  // Your other custom tables...
})

// import { authTables } from "@convex-dev/auth/server"
// import { defineSchema, defineTable } from "convex/server"
// import { v } from "convex/values"

// const customUserSchema = {
//   // Include Convex Auth fields you want to use
//   name: v.optional(v.string()),
//   email: v.string(),
//   emailVerificationTime: v.optional(v.union(v.number(), v.null())),

//   // Your custom fields
//   createdAt: v.optional(v.string()),
//   password: v.optional(v.string()),
//   firstName: v.optional(v.string()),
//   lastName: v.optional(v.string()),
//   accountType: v.optional(v.array(v.string())),
//   organizationName: v.optional(v.string()),
//   source: v.optional(v.string()),
//   userId: v.optional(v.string()),
//   role: v.optional(v.array(v.string())),
//   subscription: v.optional(v.string()),
//   tokenIdentifier: v.optional(v.string()),
//   image: v.optional(v.string()),
// }

// export default defineSchema({
//   ...authTables, // This includes other auth tables
//   users: defineTable(customUserSchema)
//     .index("email", ["email"])
//     .index("by_token", ["tokenIdentifier"]),

//   otpCodes: defineTable({
//     email: v.string(),
//     otp: v.string(),
//     createdAt: v.string(),
//     expiresAt: v.number(),
//   }),

//   // Your other custom tables...
// })
