import { Feedback } from "@/constants/stripe";

import Stripe from "stripe";

import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "~/convex/_generated/dataModel";
import { updateUserNewsletter } from "~/convex/newsletter/subscriber";
import { ConvexError, v } from "convex/values";
import { api, internal } from "../_generated/api";
import {
  action,
  internalQuery,
  mutation,
  query,
  QueryCtx,
} from "../_generated/server";
import schema from "../schema";

const planMapping: Record<string, number> = {
  original: 1,
  banana: 2,
  fatcap: 3,
};

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// INTERNAL QUERY: Fetch a plan by key from the "userPlans" table.
export const getPlanByKey = internalQuery({
  args: {
    key: schema.tables.userPlans.validator.fields.key,
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("userPlans")
      .withIndex("key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const getPlanKeyByPriceId = query({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    const userPlans = await ctx.db.query("userPlans").collect();
    for (const plan of userPlans) {
      // Loop through both month and year
      for (const interval of ["month", "year"] as const) {
        if (
          plan.prices &&
          plan.prices[interval] &&
          plan.prices[interval].usd &&
          plan.prices[interval].usd.stripeId === args.priceId
        ) {
          return plan.key;
        }
      }
    }
    return null;
  },
});

export async function getPlanNumberByProduct(
  ctx: QueryCtx,
  productKey: string,
): Promise<{ plan: number | null; key: string | null }> {
  const plan = await ctx.db
    .query("userPlans")
    .withIndex("stripeProductId", (q) => q.eq("stripeProductId", productKey))
    .first();
  if (!plan) return { plan: null, key: null };
  const result = planMapping[plan.key] ?? null;
  return { plan: result, key: plan.key };
}

export const getUserHadTrial = query({
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) return false;
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity))
      .first();

    // console.log("sub", sub);
    // console.log("sub.hadTrial", sub?.hadTrial);
    return sub?.hadTrial === true;
  },
});

export const getOrgHadFreeCall = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const orgs = await ctx.db
      .query("organizations")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .collect();
    return orgs.some((org) => org.hadFreeCall === true);

    // return org?.hadFreeCall === true;
  },
});

export const getUserHasSubscription = query({
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) return false;
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity))
      .first();
    return sub ? sub.status === "active" || sub.status === "trialing" : false;
  },
});

// ACTION: Create a Stripe Checkout Session.
export const createStripeCheckoutSession = action({
  args: {
    planKey: schema.tables.userPlans.validator.fields.key,
    interval: v.optional(v.string()),
    hadTrial: v.optional(v.boolean()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    try {
      console.log(args);

      const identity = await getAuthUserId(ctx);
      if (!identity) throw new Error("Not authenticated");
      const result = await ctx.runQuery(api.users.getCurrentUser, {});
      if (!result) throw new Error("User not found");
      const { user } = result;
      if (!user || !user.email)
        throw new Error("User not found or missing email");

      const { artistSubscription, orgSubscription } = await ctx.runQuery(
        api.stripe.stripeBase.getUserSubscriptions,
        {
          userId: user._id,
        },
      );

      let stripeCustomerId =
        artistSubscription?.customerId || orgSubscription?.customerId;

      const plan: any = await ctx.runQuery(
        internal.stripe.stripeSubscriptions.getPlanByKey,
        {
          key: args.planKey,
        },
      );
      // console.log(plan);

      if (!plan || !plan.prices || !plan.prices.month) {
        throw new Error("Plan not found or missing pricing info");
      }
      const currency = args.currency ?? "usd";

      const priceId =
        (args.interval && plan.prices[args.interval]?.[currency]?.stripeId) ||
        plan.prices.month.currency.stripeId;

      // console.log("priceId which: ", priceId);

      if (!priceId)
        throw new Error("Stripe price ID not found in plan pricing");
      console.log("userId: ", user._id, user.email);
      const metadata: Record<string, string> = {
        userId: user._id,
        userEmail: user.email,
        plan: args.planKey,
        accountType: "artist",
        interval: args.interval || "month",
        transactionType: "artist",
      };

      // console.log("hadTrial: ", args.hadTrial);
      // console.log("Meta Data: ", metadata);

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user._id },
        });
        stripeCustomerId = customer.id;
        // console.log("stripeCustomerId: ", stripeCustomerId);

        // await ctx.db.insert("userSubscriptions")
      }

      if (!artistSubscription) {
        await ctx.runMutation(api.stripe.stripeBase.saveStripeCustomerId, {
          stripeCustomerId,
          userType: "artist",
        });
      }

      // Determine subscription data options
      const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
        {
          ...(args.hadTrial ? {} : { trial_period_days: 14 }),
        };

      // Create a Stripe Checkout Session.
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
          // payment_method_types: ["card", "sepa_debit"],
          // payment_method_types: ["card"],
          customer: stripeCustomerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",

          subscription_data: subscriptionData,
          success_url: `${process.env.FRONTEND_URL}/thelist`,
          cancel_url: `${process.env.FRONTEND_URL}/pricing`,
          //TODO: MAKE SUCCESS AND CANCEL PAGES (or other redirects with modals?)
          // customer_email: user.email,
          // ...(args.accountType === "organizer"
          //   ? { customer_creation: "always" }
          //   : {}),
          metadata: metadata,
          client_reference_id: metadata.userId,
        });

      // console.log("checkout session created: ", session);

      // Ensure session.url is not null.
      if (!session.url) throw new Error("Stripe session URL is null");
      return { url: session.url };
    } catch (err) {
      console.error("Error creating Stripe Checkout Session:", err);
      throw new Error("Error creating Stripe Checkout Session", { cause: err });
    }
  },
});

/**
 * Action: Create a account portal session for the user to manage subscriptions.
 */
export const getUserAccountPortalUrl = action({
  handler: async (ctx: any) => {
    const identity = await getAuthUserId(ctx);
    // console.log("identity: ", identity);
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity))
      .unique();

    console.log("User: ", user);
    if (!user || !user.stripeCustomerId) {
      throw new Error("User not found or missing Stripe customer ID");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });

    return { url: portalSession.url };
  },
});

export const subscriptionStoreWebhook = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    // Extract event type from webhook payload
    let eventType = args.body.type;
    let createdTimestamp: number | undefined =
      args.body.data.created ?? args.body.data.object.created;
    const createdAt = new Date(
      (createdTimestamp ?? Date.now()) * 1000,
    ).toISOString();
    let modifiedTimestamp: number | undefined =
      args.body.data.modified_at ??
      args.body.data.object.created ??
      args.body.created;
    const modifiedAt = new Date(
      (modifiedTimestamp ?? Date.now()) * 1000,
    ).toISOString();
    // console.log("Event type store webhook:", eventType)
    // Store webhook event
    await ctx.db.insert("stripeWebhookEvents", {
      type: eventType,
      transactionType:
        args.body.data.object.metadata?.transactionType ?? "base",
      stripeEventId: args.body.data.object.id,
      createdAt,
      modifiedAt,
      data: args.body.data,
    });

    // console.log("args.body.data store webhook:", args.body.data);
    // if (eventType === "checkout.session.completed") {
    //   eventType = "customer.subscription.created"
    // }
    console.log("event type:", eventType);
    const base = args.body.data;
    const baseObject = args.body.data.object;
    const customerId = baseObject.customer ?? null;
    const metadata = baseObject.metadata;
    let userId = metadata?.userId ?? null;
    const metaInterval = metadata?.interval;
    const metaPlan = metadata?.plan;
    const metaNumber = planMapping[metaPlan ?? "Unknown"];
    const customerSubData = await ctx.db
      .query("userSubscriptions")
      .withIndex("customerId", (q) => q.eq("customerId", customerId))
      .first();
    const userData = customerSubData?.userId
      ? await ctx.db.get(customerSubData.userId as Id<"users">)
      : null;
    const newsletterSub = userData
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", userData._id))
          .first()
      : null;
    console.log("subscription in base callback: ", customerSubData);
    // console.log("customer id: ", customerId);
    // console.log("userId: ", userId);
    // console.log("metaPlan: ", metaPlan);
    // console.log("metaNumber: ", metaNumber);

    switch (eventType) {
      case "checkout.session.completed": //NOTE:
        //note-to-self: in this, the metadata loads something that looks like this:
        // {
        //   accountType: 'artist',
        //   interval: 'month',
        //   openCallId: '',
        //   plan: 'original',
        //   userEmail: 'newacc@thestreetartlist.com',
        //   userId: 'mh7c2z6vq780jv39ac74ewkn6h7sm7fv'
        // }
        // Also, in the base object is a key called "client_reference_id" that has the user's _id value.

        // email = baseObject.customer_details.email
        // userId = baseObject.client_reference_id;
        console.log(
          "metadata.userId: ",
          userId,
          "client_reference_id (userId): ",
          baseObject.client_reference_id,
        );
        console.log("checkout session completed:", args.body.data);
        const oneTime = metaInterval === "One-time";
        const freeCall =
          baseObject.discounts[0]?.coupon === process.env.STRIPE_FREE_COUPON;
        // args.body.data.object.discounts[0]?.coupon === "KT7bnfqn";
        const createdAt = new Date(baseObject.created * 1000).getTime();
        console.log("createdAt: ", createdAt);
        console.log("metaPlan: ", metaPlan);
        const paymentStatus = baseObject.payment_status ?? "unpaid";
        console.log("paymentStatus: ", paymentStatus);

        // const checkoutCustomer = await ctx.db
        //   .query("userSubscriptions")
        //   .withIndex("userId", (q) =>
        //     q.eq("userId", args.body.data.object.metadata.userId),
        //   )
        //   .first();
        const checkoutCustomer = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) => q.eq("customerId", customerId))
          .first();

        const checkoutUser = await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) => q.eq("userId", userId))
          .first();

        console.log("checkoutCustomer: ", checkoutCustomer);

        if ((checkoutCustomer || checkoutUser) && !oneTime) {
          console.log("user subscription already exists");
          console.log("checkout session: ", checkoutCustomer);
          console.log("metadata: ", args.body.data.object.metadata);
          if (checkoutUser) {
            await ctx.db.patch(checkoutUser._id, {
              userId: args.body.data.object.metadata.userId,
              metadata: args.body.data.object.metadata ?? {},
              plan: metaNumber,
              customerId: args.body.data.object.customer,
            });
            await updateUserNewsletter(ctx, {
              userId,
              userPlan: metaNumber,
            });
          } else if (checkoutCustomer) {
            await ctx.db.patch(checkoutCustomer._id, {
              userId: args.body.data.object.metadata.userId,
              metadata: args.body.data.object.metadata ?? {},
              plan: metaNumber,
              customerId: args.body.data.object.customer,
            });
          }
        } else if (!checkoutCustomer && !checkoutUser && !oneTime) {
          console.log("checkoutCustomer didn't exist");

          await ctx.db.insert("userSubscriptions", {
            userId: metadata.userId,
            metadata: metadata ?? {},

            customerId: args.body.data.object.customer,
            paidStatus: paymentStatus === "paid",
          });
        }

        // console.log("should be able to do logic for one-time here");

        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_id", (q) =>
            q.eq("_id", metadata.userId as Id<"users">),
          )
          .first();
        console.log("existingUser checkout: ", existingUser);
        if (existingUser) {
          console.log("account type: ", metadata?.accountType);
          console.log("oc id: ", metadata?.openCallId);

          if (metadata?.accountType === "artist") {
            // TODO: Update this to run a query and update for the user plan in all places. It's getting a bit hectic, so I'd rather not do it like this and would prefer to just have a lookup table or something.
            await ctx.db.patch(existingUser._id, {
              subscription: `${metadata.interval}ly-${metaPlan}`,
              plan: metaNumber,
            });
            await updateUserNewsletter(ctx, {
              userId: existingUser._id,
              userPlan: metaNumber,
              email: existingUser.email,
            });
          }
        }

        break;

      // ...

      case "checkout.session.expired": //NOTE:
        const customer = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) => q.eq("customerId", customerId))
          .first();
        console.log("customer", customer);
        if (customer) {
          if (!customer.status) {
            await ctx.db.delete(customer._id);
            console.log("deleted incomplete customer: ", customer);
          } else {
            console.log("Customer has active subscription: " + customerId);
          }
        } else {
          throw new ConvexError("Customer not found: " + customerId);
        }

        break;

      case "subscription_schedule.updated":
        break;
      // ...

      case "invoice.created":
        console.log("invoice.created:", args.body);
        break;

      case "customer.subscription.created":
        //! This doesn't contain the metadata in the baseObject
        //??: What is interesting/useful in this event data:
        //??: start dates, end dates, amount, interval, currency, nickname (product), product info, type (which may be a better use than the other subscription check below. More complicated to get to, though as it's within the product/plan info several layers deep.)

        // console.log("customer.subscription.created:", args.body);
        // console.log("subscription type: ", baseObject.object);
        const subscription = baseObject;
        const isOngoingSubscription = baseObject.object === "subscription";

        console.log("sub customerId: ", subscription.customer);

        const baseData = {
          stripeId: subscription.id,
          stripePriceId: subscription.plan?.id,
          currency: subscription.currency,
          interval: subscription.plan?.interval,
          status: subscription.status,
          startedAt:
            new Date(subscription.start_date * 1000).getTime() || undefined,
          currentPeriodStart: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).getTime()
            : undefined,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).getTime()
            : undefined,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: undefined,
          canceledAt: undefined,
          amount: subscription.plan?.amount,

          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000).getTime()
            : undefined,
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).getTime()
            : undefined,
          hadTrial: true,
          customerCancellationComment: undefined,
          customerCancellationFeedback: undefined,
          customerCancellationReason: undefined,
          lastEditedAt: new Date().getTime(),
        };

        if (customerSubData) {
          console.log("Updating existing subscription:", customerSubData._id);
          // Update the existing subscription

          if (isOngoingSubscription)
            await ctx.db.patch(customerSubData._id, {
              ...baseData,
              startedAt: customerSubData?.startedAt || baseData.startedAt,
            });

          const existingUser = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) =>
              q.eq("userId", customerSubData.userId ?? ""),
            )
            .first();

          if (existingUser) {
            const userLogId = await ctx.db
              .query("userLog")
              .withIndex("by_userId", (q) => q.eq("userId", existingUser._id))
              .first();
            console.log("in existingUser - userLogId: ", userLogId);
            if (userLogId) {
              await ctx.db.patch(userLogId._id, {
                hadTrial: true,
              });
            }
            await ctx.db.patch(existingUser._id, {
              subscription: `${metadata.interval}ly-${metaPlan}`,
            });
            await updateUserNewsletter(ctx, {
              userId: existingUser._id,
              userPlan: metaNumber,
            });
          }
        } else {
          console.log(
            "Missing subscription: " +
              {
                customer: subscription.customer,
                data: subscription,
              },
          );
        }

        //? :  Removed section that creates a new sub since it's handled prior to checkout and this should only update that existing "subscription" row in the db.

        break;

      case "customer.subscription.updated":
        const discountPercent = baseObject?.discount?.coupon?.percent_off;
        const discountAmount = baseObject?.discount?.coupon?.amount_off;
        const discountDuration = baseObject?.discount?.coupon?.duration;
        const planData = baseObject?.plan;
        const prevPlanData = base.previous_attributes?.plan;
        // const couponCode = baseObject?.discount?.coupon?.name;
        const currentAmount = planData?.amount;
        const currentInterval = planData?.interval;
        const prevInterval = customerSubData?.interval;
        const prevAmount = prevPlanData?.amount;
        const existingMetadata = customerSubData?.metadata || {};
        const productId = planData?.product;
        const cancellationDetails = baseObject?.cancellation_details;

        // console.log("planData: ", planData);

        const { plan: planNumber, key: planKey } = await getPlanNumberByProduct(
          ctx,
          productId ?? "",
        );

        const updatedMetadata = {
          ...existingMetadata,
          interval: currentInterval,
          plan: planKey ?? "Unknown",
        };

        console.log("updatedMetadata: ", updatedMetadata);

        //todo: Update this in the future. Make it a bit more readable and sure that it's working as intended.

        let amount: number | undefined;
        let nextAmount: number | undefined;
        let interval: string | undefined;
        let nextInterval: string | undefined;

        if (currentAmount < prevAmount) {
          amount = prevAmount;
          nextAmount = currentAmount;
          if (currentInterval === "month") {
            interval = prevInterval === "year" ? "year" : currentInterval;
            nextInterval =
              currentInterval === "month" && prevInterval === "year"
                ? currentInterval
                : undefined;
          } else {
            interval = currentInterval;
            nextInterval = undefined;
          }
        } else {
          amount = currentAmount;
          nextAmount = undefined;
          interval = currentInterval;
        }

        if (customerSubData) {
          const updates = {
            status: baseObject.status,
            cancelAt: baseObject.cancel_at
              ? new Date(baseObject.cancel_at * 1000).getTime()
              : undefined,
            canceledAt: baseObject.canceled_at
              ? new Date(baseObject.canceled_at * 1000).getTime()
              : undefined,
            endedAt: baseObject.ended_at
              ? new Date(baseObject.ended_at * 1000).getTime()
              : undefined,
            interval: interval,
            intervalNext: nextInterval,
            amount: amount,
            discountAmount: discountAmount ?? undefined,
            discountPercent: discountPercent ?? undefined,
            discountDuration: discountDuration ?? undefined,
            amountNext: nextAmount,
            currentPeriodEnd: baseObject.current_period_end
              ? new Date(baseObject.current_period_end * 1000).getTime()
              : undefined,
            cancelAtPeriodEnd: baseObject.cancel_at_period_end ?? false,
            stripeId: baseObject.id,
            metadata: updatedMetadata,
            plan: planNumber ?? 0,
            //test if actually needed - the stripeId changes when the subscription is updated, but I don't know if it's able to reference/find the new one in reference to the old one or not. Wait and see.
            lastEditedAt: new Date().getTime(),
          };

          await ctx.db.patch(customerSubData._id, {
            ...updates,
            customerCancellationComment:
              cancellationDetails?.comment ?? undefined,
            customerCancellationReason:
              cancellationDetails?.reason ?? undefined,
            customerCancellationFeedback:
              cancellationDetails?.feedback ?? undefined,
          });
        }

        if (userData) {
          console.log("patching userData");
          await ctx.db.patch(userData._id, {
            subscription: `${currentInterval}ly-${planKey}`,
            ...(planNumber && { plan: planNumber }),
          });
          await updateUserNewsletter(ctx, {
            userId: userData._id,
            email: userData.email,
            ...(planNumber && { userPlan: planNumber }),
          });
        }
        break;

      case "customer.subscription.deleted":
        if (newsletterSub) {
          await updateUserNewsletter(ctx, {
            userId: userData?._id as Id<"users">,
            email: userData?.email,
            userPlan: 0,
          });
        }
        if (customerSubData) {
          await ctx.db.patch(customerSubData._id, {
            plan: 0,
            status: baseObject.status,
            cancelAt:
              (customerSubData.cancelAt ?? baseObject.canceled_at)
                ? new Date(baseObject.canceled_at * 1000).getTime()
                : undefined,
            canceledAt: baseObject.canceled_at
              ? new Date(baseObject.canceled_at * 1000).getTime()
              : undefined,
            customerCancellationReason:
              baseObject.cancellation_details.reason ?? undefined,
            customerCancellationComment:
              baseObject.cancellation_details.comment ?? undefined,
            customerCancellationFeedback:
              baseObject.cancellation_details.feedback ?? undefined,
            endedAt: baseObject.ended_at
              ? new Date(baseObject.ended_at * 1000).getTime()
              : undefined,
            amountNext: undefined,
            discount: undefined,
            promoCode: undefined,
            promoAppliedAt: undefined,
            discountPercent: undefined,
            discountAmount: undefined,
            discountDuration: undefined,
            adminPromoCode: undefined,
          });
        }
        if (userData) {
          await ctx.db.patch(userData._id, {
            plan: 0,
            subscription: undefined,
          });
        }
        break;

      case "customer.discount.created":
        const discountedSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", args.body.data.object.customer),
          )
          .first();

        if (discountedSub) {
          console.log(discountedSub);
          console.log(args.body.data.object.coupon);
          await ctx.db.patch(discountedSub._id, {
            discount: discountedSub.amount,
            promoCode: args.body.data.object.coupon.name,
            promoAppliedAt: new Date(
              args.body.data.object.coupon.created * 1000,
            ).getTime(),
          });
        }
        break;

      case "customer.discount.deleted":
        const affectedSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", args.body.data.object.customer),
          )
          .first();

        if (affectedSub) {
          await ctx.db.patch(affectedSub._id, {
            discount: undefined,
            discountPercent: undefined,
            discountAmount: undefined,
            discountDuration: undefined,
            adminPromoCode: undefined,
            promoCode: undefined,
            promoAppliedAt: undefined,
          });
        }

        break;

      case "invoice.payment_succeeded":
        // console.log({
        //   // lines: dataObject.lines,
        //   data: dataObject.lines.data[0].plan.product,
        // });
        const dataObject = args.body.data.object;
        const product = dataObject?.lines?.data?.[0]?.plan?.product;
        const productPlan = product
          ? await getPlanNumberByProduct(ctx, product ?? "")
          : null;

        // Find existing subscription
        const invoicePaid = await ctx.db
          .query("userSubscriptions")
          .withIndex("customerId", (q) =>
            q.eq("customerId", args.body.data.object.customer),
          )
          .first();
        console.log("invoice.payment_succeeded (paid): ", invoicePaid?._id);
        if (invoicePaid) {
          const newsletterSub = await ctx.db
            .query("newsletter")
            .withIndex("by_userId", (q) =>
              q.eq("userId", invoicePaid.userId as Id<"users">),
            )
            .first();

          if (newsletterSub)
            await updateUserNewsletter(ctx, {
              userId: invoicePaid.userId as Id<"users">,
              userPlan: productPlan?.plan ?? undefined,
            });
          if (invoicePaid.userId && productPlan?.plan)
            await ctx.db.patch(invoicePaid.userId as Id<"users">, {
              plan: productPlan.plan,
            });

          await ctx.db.patch(invoicePaid._id, {
            paidStatus: args.body.data.object.paid,
            chargeId: dataObject.charge,
            ...(typeof productPlan === "number" && { plan: productPlan }),

            customerCancellationComment: undefined,
            customerCancellationReason: undefined,
            customerCancellationFeedback: undefined,
          });
        }

        break;

      case "charge.dispute.created":
        const chargeId = baseObject.charge;
        if (chargeId) {
          const subscription = await ctx.db
            .query("userSubscriptions")
            .withIndex("by_chargeId", (q) => q.eq("chargeId", chargeId))
            .first();

          const stripeId = subscription?.stripeId;

          if (stripeId) {
            // await ctx.db.patch(subscription._id, {
            //   status: "canceled",
            // });
            await ctx.db.patch(subscription._id, {
              banned: true,
            });
            await ctx.scheduler.runAfter(
              0,
              internal.stripe.stripeBase.cancelSubscription,
              {
                chargeId,
              },
            );
          }

          // await stripe.subscriptions.update(charge.subscription, {
          //   default_payment_method: null,
          // });
        }
        break;

      case "subscription.active":
        // Find and update subscription
        const activeSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first();

        if (activeSub) {
          await ctx.db.patch(activeSub._id, {
            status: args.body.data.status,
            startedAt: new Date(args.body.data.started_at).getTime(),
          });
        }
        break;

      case "subscription.canceled":
        // Find and update subscription
        const canceledSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first();

        if (canceledSub) {
          await ctx.db.patch(canceledSub._id, {
            plan: undefined,
            status: args.body.data.object.status,
            canceledAt: args.body.data.object.canceled_at
              ? new Date(args.body.data.object.canceled_at).getTime()
              : undefined,
            customerCancellationReason:
              args.body.data.object.customer_cancellation_reason || undefined,
            customerCancellationComment:
              args.body.data.object.customer_cancellation_comment || undefined,
            customerCancellationFeedback:
              args.body.data.object.customer_cancellation_feedback || undefined,
          });
        }
        break;

      case "subscription.uncanceled":
        // Find and update subscription
        const uncanceledSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first();

        if (uncanceledSub) {
          await ctx.db.patch(uncanceledSub._id, {
            status: args.body.data.status,
            cancelAtPeriodEnd: false,
            cancelAt: undefined,
            canceledAt: undefined,
            customerCancellationReason: undefined,
            customerCancellationComment: undefined,
            customerCancellationFeedback: undefined,
          });
        }
        break;

      case "subscription.revoked":
        // Find and update subscription
        const revokedSub = await ctx.db
          .query("userSubscriptions")
          .withIndex("stripeId", (q) => q.eq("stripeId", args.body.data.id))
          .first();

        if (revokedSub) {
          await ctx.db.patch(revokedSub._id, {
            status: "revoked",
            endedAt: args.body.data.ended_at
              ? new Date(args.body.data.ended_at).getTime()
              : undefined,
          });
        }
        break;

      case "order.created":
        console.log("order.created:", args.body);
        // Orders are handled through the subscription events
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  },
});

export const applyCouponToSubscription = action({
  args: {
    couponCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userCode = args.couponCode?.toUpperCase();
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const result = await ctx.runQuery(
      api.subscriptions.getUserSubscriptionStatus,
      {},
    );

    if (!result) throw new Error("User not found");
    const { subscription, hasActiveSubscription } = result;
    const interval = subscription?.interval;
    const subAmount = subscription?.amount ?? 0;
    const stripeSubscriptionId = subscription?.stripeId;

    if (!subscription || !stripeSubscriptionId || !hasActiveSubscription)
      throw new Error("Active subscription not found");

    // Lookup the promotion_code by coupon code string
    const promoCodes = await stripe.promotionCodes.list({
      code: userCode,
      active: true,
    });

    const promoCode = promoCodes.data[0];
    if (!promoCode) throw new ConvexError("Invalid or expired coupon code");
    const metaData = promoCode.coupon?.metadata;
    const metaMinAmount = metaData?.MIN_AMT ? Number(metaData?.MIN_AMT) : null;
    const metaMaxAmount = metaData?.MAX_AMT ? Number(metaData?.MAX_AMT) : null;
    const metaExcludedAmount = metaData?.EXCL_AMT
      ? Number(metaData?.EXCL_AMT)
      : null;
    // console.log(metaMinAmount, metaMaxAmount, metaExcludedAmount, subAmount);
    // Check if a discount is already applied
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    if (stripeSub.discounts) {
      throw new ConvexError(
        `Subscription already has a discount applied: ${stripeSub.discounts.map((d) => d.toString()).join(", ")}`,
      );
    }

    const coupon = await stripe.coupons.retrieve(promoCode.coupon.id);
    const allowedProductIds = coupon.applies_to?.products;
    // console.log(coupon);
    // console.log(allowedProductIds);
    // console.log(stripeSub);
    if (allowedProductIds && allowedProductIds?.length > 0) {
      const subscribedProductIds = stripeSub.items.data.map((item) => {
        const product = item.price.product;
        return typeof product === "string" ? product : product.id;
      });

      const isAllowed = subscribedProductIds.some((productId) =>
        allowedProductIds.includes(productId),
      );

      if (!isAllowed) {
        throw new Error("This coupon is not valid for your selected plan.");
      }
    }
    // console.log(metaData?.interval, interval);
    if (metaData?.interval && metaData?.interval !== interval) {
      throw new ConvexError(
        "This promotion code cannot be used with your current subscription interval",
      );
    }
    if (metaExcludedAmount && subAmount === metaExcludedAmount) {
      throw new ConvexError(
        "This promotion code cannot be used with your current subscription tier.",
      );
    }

    if (
      (metaMinAmount && subAmount < metaMinAmount) ||
      (metaMaxAmount && subAmount > metaMaxAmount)
    ) {
      throw new ConvexError(
        "This promotion code cannot be used with your current subscription tier.",
      );
    }

    // Update the subscription to apply the promo
    await stripe.subscriptions.update(stripeSubscriptionId, {
      discounts: [
        {
          promotion_code: promoCode.id,
        },
      ],
    });

    await ctx.runMutation(api.stripe.stripeSubscriptions.markCouponApplied, {
      adminPromoCode: `${userCode}: (${promoCode.id})`,
    });

    return { success: true };
  },
});

export const markCouponApplied = mutation({
  args: {
    adminPromoCode: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(args);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (!subscription) throw new Error("Subscription not found");
    await ctx.db.patch(subscription._id, {
      promoAppliedAt: Date.now(),
      adminPromoCode: args.adminPromoCode,
    });
  },
});

export const deleteCouponFromSubscription = action({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const result = userId
      ? await ctx.runQuery(api.subscriptions.getUserSubscriptionStatus, {})
      : null;

    if (!result) throw new Error("User not found");
    const { subscription, hasActiveSubscription } = result;

    const stripeId = subscription?.stripeId;
    if (!stripeId || !subscription) throw new Error("No subscription found");

    if (!hasActiveSubscription)
      throw new Error("Active subscription not found");

    const stripeSub = await stripe.subscriptions.retrieve(stripeId);
    if (!stripeSub.discounts) {
      throw new ConvexError("No active coupon found");
    }

    await stripe.subscriptions.deleteDiscount(stripeId);

    return { success: true };
  },
});

export const cancelSubscription = action({
  args: {
    atPeriodEnd: v.optional(v.boolean()),
    detail: v.optional(
      v.object({
        feedback: v.optional(v.string()),
        comment: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { atPeriodEnd, detail }) => {
    const userId = await getAuthUserId(ctx);
    const result = userId
      ? await ctx.runQuery(api.subscriptions.getUserSubscriptionStatus, {})
      : null;

    if (!result) throw new Error("User not found");
    const { subscription, hasActiveSubscription } = result;
    const stripeId = subscription?.stripeId;
    if (!subscription || !stripeId) {
      throw new ConvexError("No active subscription found");
    }
    const updateBaseParams: Stripe.SubscriptionUpdateParams = {
      cancel_at_period_end: true,
    };

    const baseDetail: Stripe.SubscriptionCancelParams.CancellationDetails = {
      comment: detail?.comment ?? "Too many cats.",
      feedback: (detail?.feedback as Feedback) ?? "other",
    };
    // if (pause) {
    //   const params: Stripe.SubscriptionUpdateParams = {
    //     pause_collection: {
    //       behavior: "void",
    //     },
    //     // ...updateBaseParams,
    //     description: "Membership paused by user",
    //   };
    //   await stripe.subscriptions.update(stripeId, params);
    //   //what logic is there for pausing a subscription? I know that I can resume it, but what to pause?
    // } else
    if (atPeriodEnd) {
      await stripe.subscriptions.update(stripeId, {
        ...updateBaseParams,
        cancellation_details: baseDetail,
      });
    } else {
      await stripe.subscriptions.cancel(stripeId, {
        cancellation_details: baseDetail,
      });
    }

    return { success: true };
  },
});
