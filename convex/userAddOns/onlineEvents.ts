import slugify from "slugify";

import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "~/convex/_generated/server";
import {
  onlineEventsSchema,
  onlineEventsSchemaValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";

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
      startDate: args.startDate,
      endDate: args.endDate,
      location: args.location,
      organizer: userId,
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
    if (!userId && !args.email)
      throw new ConvexError("Requires userId or email");
    const user = userId
      ? await ctx.db.get(userId)
      : args.email
        ? await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", args.email ?? ""))
            .first()
        : null;
    const subscription = user
      ? await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .first()
      : null;
    const plan = subscription?.plan ?? 0;

    const artist =
      plan >= 2 && userId
        ? await ctx.db
            .query("artists")
            .withIndex("by_artistId", (q) => q.eq("artistId", userId))
            .first()
        : null;
    const artistPortfolio = artist?.documents?.portfolio;

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new ConvexError("Event not found");

    const registration = await ctx.db.insert("userAddOns", {
      userId,
      name: user?.name ?? args.name ?? "guest",
      email: user?.email ?? args.email ?? "",
      eventId: args.eventId,
      paid: plan >= 2,
      canceled: false,
      link: args.link,
      file: artistPortfolio,
    });

    return { event, registration };

    //use resend to send confirmation email for signup (should note whether it's been paid or not (or is included in their membership)
  },
});

export const cancelRegistration = mutation({
  args: {
    eventId: v.id("onlineEvents"),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const registration = userId
      ? await ctx.db
          .query("userAddOns")
          .withIndex("by_userId_eventId", (q) =>
            q.eq("userId", userId).eq("eventId", args.eventId),
          )
          .first()
      : args.email
        ? await ctx.db
            .query("userAddOns")
            .withIndex("by_email_eventId", (q) =>
              q.eq("email", args.email ?? "").eq("eventId", args.eventId),
            )
            .first()
        : null;
    if (!registration) return null;

    await ctx.db.patch(registration._id, {
      canceled: true,
    });
  },
});

export const renewRegistration = mutation({
  args: {
    eventId: v.id("onlineEvents"),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const registration = userId
      ? await ctx.db
          .query("userAddOns")
          .withIndex("by_userId_eventId", (q) =>
            q.eq("userId", userId).eq("eventId", args.eventId),
          )
          .first()
      : args.email
        ? await ctx.db
            .query("userAddOns")
            .withIndex("by_email_eventId", (q) =>
              q.eq("email", args.email ?? "").eq("eventId", args.eventId),
            )
            .first()
        : null;
    if (!registration) return null;

    await ctx.db.patch(registration._id, {
      canceled: false,
    });
  },
});

export const checkRegistration = query({
  args: {
    eventId: v.id("onlineEvents"),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const registration = userId
      ? await ctx.db
          .query("userAddOns")
          .withIndex("by_userId_eventId", (q) =>
            q.eq("userId", userId).eq("eventId", args.eventId),
          )
          .first()
      : args.email
        ? await ctx.db
            .query("userAddOns")
            .withIndex("by_email_eventId", (q) =>
              q.eq("email", args.email ?? "").eq("eventId", args.eventId),
            )
            .first()
        : null;
    if (!registration) return null;

    return { paid: registration.paid, canceled: registration.canceled };
  },
});
