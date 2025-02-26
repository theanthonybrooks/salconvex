import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const customUserSchema = {
  // Include Convex Auth fields you want to use
  name: v.optional(v.string()),
  email: v.string(),
  emailVerificationTime: v.optional(v.number()),

  // Your custom fields
  createdAt: v.number(),
  password: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  accountType: v.array(v.string()),
  organizationName: v.optional(v.string()),
  source: v.optional(v.string()),
  userId: v.string(),
  role: v.array(v.string()),
  subscription: v.optional(v.string()),
  tokenIdentifier: v.string(),
  image: v.optional(v.string()),
}

export default defineSchema({
  ...authTables, // This includes other auth tables
  users: defineTable(customUserSchema)
    .index("email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  // Your other custom tables...
})
