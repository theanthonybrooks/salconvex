import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import Stripe from "stripe"
import { api, internal } from "./_generated/api"
import {
  action,
  httpAction,
  internalQuery,
  mutation,
  query,
} from "./_generated/server"
import schema from "./schema"

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
})

// INTERNAL QUERY: Fetch a plan by key from the "userPlans" table.
export const getPlanByKey = internalQuery({
  args: {
    key: schema.tables.userPlans.validator.fields.key,
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("userPlans")
      .withIndex("key", (q) => q.eq("key", args.key))
      .unique()
  },
})

export const getUserHadTrial = query({
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx)
    if (!identity) return false
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity))
      .first()
    return sub?.hadTrial === true
  },
})
export const getUserHasSubscription = query({
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx)
    if (!identity) return false
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity))
      .first()
    return sub ? sub.status === "active" || sub.status === "trialing" : false
  },
})

// ACTION: Create a Stripe Checkout Session.
export const createStripeCheckoutSession = action({
  args: {
    planKey: schema.tables.userPlans.validator.fields.key,
    interval: v.optional(v.string()),
    hadTrial: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args: { planKey: string; interval?: string; hadTrial?: boolean }
  ): Promise<{ url: string }> => {
    const identity = await getAuthUserId(ctx)
    if (!identity) throw new Error("Not authenticated")

    const result = await ctx.runQuery(api.users.getCurrentUser, {})
    if (!result) throw new Error("User not found")
    const { user } = result
    if (!user || !user.email) throw new Error("User not found or missing email")

    // Use an internal query to fetch the plan details by key.
    const plan: any = await ctx.runQuery(
      internal.stripeSubscriptions.getPlanByKey,
      {
        key: args.planKey,
      }
    )

    if (!plan || !plan.prices || !plan.prices.month) {
      throw new Error("Plan not found or missing pricing info")
    }

    // Choose the price ID based on the provided interval, defaulting to "month"
    console.log("interval which: ", args.interval)
    console.log("plan which: ", plan)

    const priceId =
      (args.interval && plan.prices[args.interval]?.usd?.stripeId) ||
      plan.prices.month.usd.stripeId
    if (!priceId) throw new Error("Stripe price ID not found in plan pricing")
    const metadata: Record<string, string> = {
      userId: user.tokenIdentifier,
      userEmail: user.email,
      plan: args.planKey,
      interval: args.interval || "month",
    }

    console.log("hadTrial: ", args.hadTrial)

    // Determine subscription data options
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
      {
        ...(args.hadTrial ? {} : { trial_period_days: 14 }),
      }

    console.log("metadata: ", metadata)
    // Create a Stripe Checkout Session.
    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription", // or "payment" for one-time payments
        subscription_data: subscriptionData,
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        customer_email: user.email,
        metadata: metadata,
        client_reference_id: metadata.userId,
      })

    // console.log("checkout session created: ", session)

    // Ensure session.url is not null.
    if (!session.url) throw new Error("Stripe session URL is null")

    return { url: session.url }
  },
})

/**
 * Action: Create a account portal session for the user to manage subscriptions.
 */
export const getUserAccountPortalUrl = action({
  handler: async (ctx: any) => {
    const identity = await getAuthUserId(ctx)
    console.log("identity: ", identity)
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity))
      .unique()

    console.log("User: ", user)
    if (!user || !user.stripeCustomerId) {
      throw new Error("User not found or missing Stripe customer ID")
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/account`,
    })

    return { url: portalSession.url }
  },
})

export const subscriptionStoreWebhook = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    // Extract event type from webhook payload
    let eventType = args.body.type
    // console.log("Event type store webhook:", eventType)
    // Store webhook event
    await ctx.db.insert("stripeWebhookEvents", {
      type: eventType,
      stripeEventId: args.body.data.object.id,
      createdAt: new Date(args.body.data.object.created * 1000).toISOString(),
      modifiedAt: args.body.data.modified_at
        ? new Date(args.body.data.modified_at * 1000).toISOString()
        : new Date(args.body.data.object.created * 1000).toISOString(),
      data: args.body.data,
    })

    console.log("args.body.data store webhook:", args.body.data)
    // if (eventType === "checkout.session.completed") {
    //   eventType = "customer.subscription.created"
    // }
    console.log("eventType once more: ", eventType)
    //NOTE: Check this part to ensure that the userId is being extracted correctly
    const userId = args.body.data.object.customer ?? null
    console.log("customer id: ", userId)

    switch (eventType) {
      case "customer.subscription.created":
        console.log("customer.subscription.created:", args.body)

        // Extract subscription object from the event
        const subscription = args.body.data.object
        // const currentUser =

        // Check if there's already a subscription with this customerId
        const existingSubscription = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", subscription.customer)
          )
          .first()

        if (existingSubscription) {
          console.log(
            "Updating existing subscription:",
            existingSubscription._id
          )

          // Update the existing subscription
          await ctx.db.patch(existingSubscription._id, {
            stripeId: subscription.id,
            stripePriceId: subscription.plan?.id,
            currency: subscription.currency,
            interval: subscription.plan?.interval,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).getTime()
              : undefined,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).getTime()
              : undefined,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            amount: subscription.plan?.amount,
            startedAt: subscription.start_date
              ? new Date(subscription.start_date * 1000).getTime()
              : undefined,
            endedAt: subscription.ended_at
              ? new Date(subscription.ended_at * 1000).getTime()
              : undefined,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).getTime()
              : undefined,
            hadTrial: true,
            customerCancellationComment: undefined,
            customerCancellationReason: undefined,
            lastEditedAt: new Date().getTime(),
          })

          const existingUser = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
            .first()
          console.log("existingUser: ", existingUser)
          if (existingUser) {
            const metadata = args.body.data.object.metadata
            await ctx.db.patch(existingUser._id, {
              subscription: `${metadata.interval}ly-${metadata.plan}`,
            })
          }
        } else {
          console.log("Inserting new subscription")

          // Insert a new subscription
          await ctx.db.insert("userSubscriptions", {
            stripeId: subscription.id,
            stripePriceId: subscription.plan?.id,
            currency: subscription.currency,
            interval: subscription.plan?.interval,
            userId: subscription.metadata?.userId,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).getTime()
              : undefined,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).getTime()
              : undefined,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            amount: subscription.plan?.amount,
            startedAt: subscription.start_date
              ? new Date(subscription.start_date * 1000).getTime()
              : undefined,
            endedAt: subscription.ended_at
              ? new Date(subscription.ended_at * 1000).getTime()
              : undefined,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).getTime()
              : undefined,
            hadTrial: true,
            customerId: subscription.customer,
            lastEditedAt: new Date().getTime(),
          })

          const existingUser = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
            .first()
          console.log("updating user subscription: ", existingUser)
          if (existingUser) {
            const metadata = args.body.data.object.metadata
            await ctx.db.patch(existingUser._id, {
              subscription: `${metadata.interval}ly-${metadata.plan}`,
            })
          }
        }
        break

      case "checkout.session.completed":
        const metadata = args.body.data.object.metadata
        const checkoutUser = await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) =>
            q.eq("userId", args.body.data.object.metadata.userId)
          )
          .first()

        if (checkoutUser) {
          console.log("user subscription already exists")
          console.log("checkout session: ", checkoutUser)

          await ctx.db.patch(checkoutUser._id, {
            userId: args.body.data.object.metadata?.userId,
            metadata: args.body.data.object.metadata ?? {},
            customerId: args.body.data.object.customer,
          })
        } else {
          await ctx.db.insert("userSubscriptions", {
            userId: args.body.data.object.metadata?.userId,
            metadata: args.body.data.object.metadata ?? {},
            customerId: args.body.data.object.customer,
            paidStatus: args.body.data.object.paid,
          })
        }

        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", metadata.userId)
          )
          .first()
        console.log("existingUser checkout: ", existingUser)
        if (existingUser) {
          console.log("metadata: ", metadata)
          await ctx.db.patch(existingUser._id, {
            subscription: `${metadata.interval}ly-${metadata.plan}`,
          })
        }

        break

      // ...
      case "subscription_schedule.updated":
        break
      // ...

      case "customer.subscription.updated":
        console.log("customer.subscription.updated:", args.body)
        // Find existing subscription
        const updatedSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", args.body.data.object.customer)
          )
          .first()

        const base = args.body.data
        const currentAmount = base.object.plan?.amount
        const currentInterval = base.object.plan?.interval
        const prevInterval = updatedSub?.interval
        const prevAmount = base.previous_attributes?.plan?.amount

        let amount: number | undefined
        let nextAmount: number | undefined
        let interval: string | undefined
        let nextInterval: string | undefined

        if (currentAmount < prevAmount) {
          amount = prevAmount
          nextAmount = currentAmount
          if (currentInterval === "month") {
            interval = prevInterval === "year" ? "year" : currentInterval
            nextInterval =
              currentInterval === "month" && prevInterval === "year"
                ? currentInterval
                : undefined
          } else {
            interval = currentInterval
            nextInterval = undefined
          }
        } else {
          amount = currentAmount
          nextAmount = undefined
          interval = currentInterval
        }

        if (updatedSub) {
          const updates: any = {
            status: base.object.status,
            canceledAt: base.object.canceled_at
              ? new Date(base.object.canceled_at * 1000).getTime()
              : undefined,
            endedAt: base.object.ended_at
              ? new Date(base.object.ended_at * 1000).getTime()
              : undefined,
            interval: interval,
            intervalNext: nextInterval,
            amount: amount,
            amountNext: nextAmount,
            currentPeriodEnd: base.object.current_period_end
              ? new Date(base.object.current_period_end * 1000).getTime()
              : undefined,
            stripeId: args.body.data.object.id,
            //test if actually needed - the stripeId changes when the subscription is updated, but I don't know if it's able to reference/find the new one in reference to the old one or not. Wait and see.
            lastEditedAt: new Date().getTime(),
          }

          const cancellationDetails = args.body.data.object.cancellation_details
          if (cancellationDetails) {
            if (cancellationDetails.comment) {
              updates.customerCancellationComment = cancellationDetails.comment
            }
            if (cancellationDetails.reason) {
              updates.customerCancellationReason = cancellationDetails.reason
            }
          }

          await ctx.db.patch(updatedSub._id, updates)
        }
        break
      case "customer.subscription.deleted":
        // Find existing subscription
        const deletedSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", args.body.data.object.customer)
          )
          .first()
        // console.log("sub deleted: ", deletedSub)
        if (deletedSub) {
          await ctx.db.patch(deletedSub._id, {
            status: args.body.data.object.status,
            canceledAt: args.body.data.object.canceled_at
              ? new Date(args.body.data.object.canceled_at * 1000).getTime()
              : undefined,
            endedAt: args.body.data.object.ended_at
              ? new Date(args.body.data.object.ended_at * 1000).getTime()
              : undefined,
          })
        }
        break
      case "invoice.payment_succeeded":
        // Find existing subscription
        const invoicePaid = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", args.body.data.object.customer)
          )
          .first()
        console.log("Invoice paid: ", invoicePaid)
        if (invoicePaid) {
          await ctx.db.patch(invoicePaid._id, {
            paidStatus: args.body.data.object.paid,
          })
        }
        break

      case "subscription.active":
        // Find and update subscription
        const activeSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first()

        if (activeSub) {
          await ctx.db.patch(activeSub._id, {
            status: args.body.data.status,
            startedAt: new Date(args.body.data.started_at).getTime(),
          })
        }
        break

      case "subscription.canceled":
        // Find and update subscription
        const canceledSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first()

        if (canceledSub) {
          await ctx.db.patch(canceledSub._id, {
            status: args.body.data.object.status,
            canceledAt: args.body.data.object.canceled_at
              ? new Date(args.body.data.object.canceled_at).getTime()
              : undefined,
            customerCancellationReason:
              args.body.data.object.customer_cancellation_reason || undefined,
            customerCancellationComment:
              args.body.data.object.customer_cancellation_comment || undefined,
          })
        }
        break

      case "subscription.uncanceled":
        // Find and update subscription
        const uncanceledSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first()

        if (uncanceledSub) {
          await ctx.db.patch(uncanceledSub._id, {
            status: args.body.data.status,
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
            customerCancellationReason: undefined,
            customerCancellationComment: undefined,
          })
        }
        break

      case "subscription.revoked":
        // Find and update subscription
        const revokedSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first()

        if (revokedSub) {
          await ctx.db.patch(revokedSub._id, {
            status: "revoked",
            endedAt: args.body.data.ended_at
              ? new Date(args.body.data.ended_at).getTime()
              : undefined,
          })
        }
        break

      case "order.created":
        console.log("order.created:", args.body)
        // Orders are handled through the subscription events
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
        break
    }
  },
})

export const paymentWebhook = httpAction(async (ctx, request) => {
  console.log("Webhook received!", {
    method: request.method,
    url: request.url,
    headers: request.headers,
  })

  try {
    const body = await request.json()

    console.log("Webhook body:", body)

    // track events and based on events store data
    await ctx.runMutation(api.stripeSubscriptions.subscriptionStoreWebhook, {
      body,
    })

    console.log("Webhook body:", body)
    return new Response(JSON.stringify({ message: "Webhook received!" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("JSON parsing failed:", error.message, error.stack)
    return new Response(
      JSON.stringify({ error: "Invalid request body", details: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})

// ... the rest of your file remains unchanged.

/**
 * Query: Get the current user's Stripe subscription status.
 */
// export const getUserStripeSubscriptionStatus = query({
//   handler: async (ctx: any) => {
//     const identity = await ctx.auth.getUserIdentity()
//     if (!identity) return { hasActiveSubscription: false }

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_token", (q: any) =>
//         q.eq("tokenIdentifier", identity.subject)
//       )
//       .unique()
//     if (!user) return { hasActiveSubscription: false }

//     const subscription = await ctx.db
//       .query("userSubscriptions")
//       .withIndex("userId", (q: any) => q.eq("userId", user.tokenIdentifier))
//       .first()
//     const isActive = subscription?.status === "active"
//     return { hasActiveSubscription: isActive }
//   },
// })

/**
 * Query: Get detailed Stripe subscription info for the current user.
 */
// export const getUserStripeSubscription = query({
//   handler: async (ctx: any) => {
//     const identity = await ctx.auth.getUserIdentity()
//     if (!identity) return null

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_token", (q: any) =>
//         q.eq("tokenIdentifier", identity.subject)
//       )
//       .unique()
//     if (!user) return null

//     const subscription = await ctx.db
//       .query("userSubscriptions")
//       .withIndex("userId", (q: any) => q.eq("userId", user.tokenIdentifier))
//       .first()
//     return subscription
//   },
// })
