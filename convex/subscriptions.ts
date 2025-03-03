import { getAuthUserId } from "@convex-dev/auth/server"
import Stripe from "stripe"
import { action, query } from "./_generated/server"

//

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
})

export const getStripeCustomerPortalUrl = async (
  customerId: string,
  returnUrl: string
): Promise<string> => {
  console.log("customerId: ", customerId)
  console.log("returnUrl: ", returnUrl)
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

export const getUserSubscriptionStatus = query({
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx)

    if (!identity) {
      return { hasActiveSubscription: false }
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity))
      .unique()

    if (!user) {
      return { hasActiveSubscription: false }
    }

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first()

    const hasActiveSubscription =
      subscription?.status === "active" || subscription?.status === "trialing"

    const subStatus = subscription?.status
    // console.log("Sub status: ", subStatus)
    return { hasActiveSubscription, subStatus }
  },
})

//NOTE: this ^^^^^ is where the subscription check happens.

export const getUserSubscription = query({
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx)
    console.log("identity: ", identity)
    if (!identity) {
      return null
    }
    // console.log("identity: ", identity)
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity))
      .unique()

    console.log("user: ", user)
    if (!user) {
      return null
    }

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first()

    console.log("User: ", user, "Subscription: ", subscription)
    return subscription
  },
})

export const getStripeDashboardUrl = action({
  handler: async (ctx, args: { customerId: string }) => {
    try {
      const url = await getStripeCustomerPortalUrl(
        args.customerId,
        process.env.FRONTEND_URL as string
      )
      return { url }
    } catch (error) {
      console.error("Error creating Stripe portal session:", error)
      throw new Error("Failed to create Stripe portal session")
    }
  },
})
