import slugify from "slugify";

import type { Doc, Id } from "~/convex/_generated/dataModel";
import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "~/convex/_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { mutation, query } from "~/convex/_generated/server";
import {
  onlineEventsSchema,
  onlineEventsSchemaValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";

export async function getRegistration(
  ctx: QueryCtx,
  eventId: Id<"onlineEvents">,
  userId?: Id<"users"> | null,
  email?: string | null,
): Promise<Doc<"userAddOns"> | null> {
  const formattedEmail = email?.toLowerCase();
  if (userId) {
    return await ctx.db
      .query("userAddOns")
      .withIndex("by_userId_eventId", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .first();
  } else if (formattedEmail) {
    return await ctx.db
      .query("userAddOns")
      .withIndex("by_email_eventId", (q) =>
        q.eq("email", formattedEmail).eq("eventId", eventId),
      )
      .first();
  } else {
    return null;
  }
}

export async function sendEventRegistrationEmailHelper(
  ctx: MutationCtx | ActionCtx,
  eventId: Id<"onlineEvents">,
  userId: Id<"users">,
  email: string,
  action: "register" | "cancel" | "renew",
) {
  await ctx.scheduler.runAfter(
    0,
    internal.actions.resend.sendEventRegistrationEmail,
    {
      eventId,
      userId,
      email,
      action,
    },
  );
}

export const getOnlineEvent = query({
  args: {
    slug: v.optional(v.string()),
    eventId: v.optional(v.id("onlineEvents")),
  },
  handler: async (ctx, args) => {
    // const event = await ctx.db.query("onlineEvents").withIndex("by_slug_startDate", (q) => q.eq("slug", args.slug).gt("startDate", Date.now())).first();
    const now = Date.now();
    const event = args.eventId
      ? await ctx.db.get(args.eventId)
      : await ctx.db
          .query("onlineEvents")
          .withIndex("by_slug_endDate", (q) =>
            q.eq("slug", args.slug ?? "").gte("endDate", now),
          )
          .order("asc")
          .first();
    console.log(event);
    if (!event) return null;

    return event;
  },
});

export const createOnlineEvent = mutation({
  args: onlineEventsSchemaValidator,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);
    const isAllowedCreator =
      user?.role?.includes("admin") || user?.role?.includes("staff");
    if (!user || !isAllowedCreator)
      throw new ConvexError("User not allowed to create events");
    const slug = slugify(args.name, { lower: true, strict: true });
    const event = await ctx.db.insert("onlineEvents", {
      name: args.name,
      slug: slug,
      description: args.description,
      requirements: args.requirements,
      terms: args.terms,
      startDate: args.startDate,
      endDate: args.endDate,
      location: args.location,
      organizer: userId,
      price: args.price,
      capacity: args.capacity,
      regDeadline: args.regDeadline,
    });
    return event;
  },
});

export const updateOnlineEvent = mutation({
  args: {
    ...onlineEventsSchema,
    eventId: v.id("onlineEvents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);
    const isAllowedCreator =
      user?.role?.includes("admin") || user?.role?.includes("staff");
    if (!user || !isAllowedCreator)
      throw new ConvexError("User not allowed to update events");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new ConvexError("Event not found");

    await ctx.db.patch(event._id, {
      name: args.name,
      description: args.description,
      requirements: args.requirements,
      startDate: args.startDate,
      endDate: args.endDate,
      location: args.location,
    });
  },
});

export const deleteOnlineEvent = mutation({
  args: {
    eventId: v.id("onlineEvents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);
    const isAllowedCreator =
      user?.role?.includes("admin") || user?.role?.includes("staff");
    if (!user || !isAllowedCreator)
      throw new ConvexError("User not allowed to delete events");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new ConvexError("Event not found");

    await ctx.db.delete(args.eventId);
  },
});

export const registerForOnlineEvent = mutation({
  args: {
    eventId: v.id("onlineEvents"),
    link: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const formattedEmail = args.email?.toLowerCase();

    if (!userId || !formattedEmail)
      throw new ConvexError("Requires userId or email");
    const user = userId
      ? await ctx.db.get(userId)
      : args.email
        ? await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", formattedEmail ?? ""))
            .first()
        : null;
    const subscription = user
      ? await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .first()
      : null;
    const plan = subscription?.plan ?? 0;
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new ConvexError("Event not found");
    const registration = await getRegistration(
      ctx,
      args.eventId,
      userId,
      args.email,
    );
    if (registration) {
      if (registration.paid) {
        throw new ConvexError({
          message: `You're already registered for this event. ${userId ? "Log in to update, or c" : "Check your email for the event confirmation or c"}ontact support`,
          data: `A registration already exists for ${args.eventId} and ${userId ? userId : "email"}`,
        });
      } else {
        await ctx.db.patch(registration._id, {
          canceled: false,
        });

        return { paid: false, registration, user, event, status: "success" };
      }
    }

    const artist =
      plan >= 2 && user
        ? await ctx.db
            .query("artists")
            .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
            .first()
        : null;
    const artistPortfolio = artist?.documents?.portfolio;

    const newRegistration = await ctx.db.insert("userAddOns", {
      userId: user?._id ?? null,
      name: user?.name ?? args.name ?? "guest",
      email: user?.email ?? formattedEmail ?? "",
      eventId: args.eventId,
      paid: plan >= 2,
      plan,
      canceled: false,
      link: args.link,
      file: artistPortfolio,
    });

    if (plan >= 2 && event.capacity.current < event.capacity.max) {
      await ctx.db.patch(event._id, {
        capacity: {
          ...event.capacity,
          current: event.capacity.current + 1,
        },
      });
      await sendEventRegistrationEmailHelper(
        ctx,
        args.eventId,
        userId,
        formattedEmail,
        "register",
      );
    }

    return { event, registration: newRegistration, status: "success" };

    //use resend to send confirmation email for signup (should note whether it's been paid or not (or is included in their membership)
  },
});

export const updateRegistration = mutation({
  args: {
    eventId: v.id("onlineEvents"),
    email: v.string(),
    action: v.union(v.literal("cancel"), v.literal("renew")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const formattedEmail = args.email?.toLowerCase();

    const event = await ctx.db.get(args.eventId);
    if (!event)
      throw new ConvexError({
        message: "Event not found",
        data: `No event found for ${args.eventId}`,
      });

    const registration = await getRegistration(
      ctx,
      args.eventId,
      userId,
      formattedEmail,
    );

    if (!registration)
      throw new ConvexError({
        message: "Registration not found",
        data: `No registration found for ${args.eventId} and ${userId ? userId : "email"}`,
      });

    if (args.action === "cancel") {
      await ctx.db.patch(registration._id, {
        canceled: true,
      });

      await ctx.db.patch(event._id, {
        capacity: {
          ...event.capacity,
          current: event.capacity.current - 1,
        },
      });

      if (registration.plan && registration.plan < 2) {
        const voucher = await ctx.db
          .query("eventVouchers")
          .withIndex("by_registrationId", (q) =>
            q.eq("registrationId", registration._id),
          )
          .first();
        if (voucher) {
          await ctx.db.patch(voucher._id, {
            redeemed: false,
          });
        } else {
          await ctx.db.insert("eventVouchers", {
            userId,
            registrationId: registration._id,
            eventId: event._id,
            email: registration.email,
            amount: event.price,
            redeemed: false,
          });
        }
      }
    } else if (args.action === "renew") {
      if (event.capacity.current === event.capacity.max) {
        throw new ConvexError({ message: "No more spots available" });
      }
      if (registration.plan && registration.plan < 2) {
        const voucher = await ctx.db
          .query("eventVouchers")
          .withIndex("by_registrationId", (q) =>
            q.eq("registrationId", registration._id),
          )
          .first();
        if (voucher?.redeemed === false) {
          await ctx.db.patch(voucher._id, {
            redeemed: true,
          });
        } else if (voucher?.redeemed === true) {
          await ctx.db.patch(registration._id, {
            paid: false,
          });
          // .then(() => {
          //   throw new ConvexError({
          //     message: "Voucher already redeemed",
          //     voucherId: voucher._id,
          //   });
          // });
          return { error: "Voucher already redeemed", status: "error" };
        }
      }
      await ctx.db.patch(registration._id, {
        canceled: false,
      });
      await ctx.db.patch(event._id, {
        capacity: {
          ...event.capacity,
          current: event.capacity.current + 1,
        },
      });
    }
    await sendEventRegistrationEmailHelper(
      ctx,
      args.eventId,
      userId,
      formattedEmail,
      args.action,
    );
    return { event, status: "success" };
  },
});

export const checkRegistration = query({
  args: {
    eventId: v.id("onlineEvents"),
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await getAuthUserId(ctx));
    if (!userId) return null;

    const registration = await getRegistration(
      ctx,
      args.eventId,
      userId,
      args.email,
    );
    if (!registration) return null;

    return {
      paid: registration.paid,
      canceled: registration.canceled,
      registration,
    };
  },
});

export const getUserVouchers = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const vouchers = await ctx.db
      .query("eventVouchers")
      .withIndex("by_userId_reedemed", (q) =>
        q.eq("userId", userId).eq("redeemed", false),
      )
      .collect();

    const voucherTotal = vouchers.reduce((acc, voucher) => {
      return acc + voucher.amount;
    }, 0);

    console.log(voucherTotal);

    return {
      vouchers,
      voucherTotal,
    };
  },
});
