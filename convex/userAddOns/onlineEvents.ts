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
import { onlineEventsSchema, onlineEventStateValues } from "~/convex/schema";
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

export const getAllOnlineEvents = query({
  handler: async (ctx) => {
    let totalEvents = 0;
    const events = await ctx.db.query("onlineEvents").collect();
    const results = await Promise.all(
      events.map(async (event) => {
        if (event) totalEvents += 1;
        return {
          _id: event._id,
          name: event.name,
          img: event.img,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          regDeadline: event.regDeadline,
          price: event.price,
          capacity: event.capacity,
          organizer: event.organizer,
          terms: event.terms,
          requirements: event.requirements,
          location: event.location,
          updatedAt: event.updatedAt,
          createdAt: event._creationTime,
          state: event.state,
        };
      }),
    );
    return {
      events: results,
      totalEvents,
    };
  },
});

export const getOnlineEvent = query({
  args: {
    slug: v.optional(v.string()),
    eventId: v.optional(v.id("onlineEvents")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");
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
    if (!event) {
      const lastEvent = await ctx.db
        .query("onlineEvents")
        .withIndex("by_slug_state_endDate", (q) =>
          q
            .eq("slug", args.slug ?? "")
            .eq("state", "published")
            .lte("endDate", now),
        )
        .order("desc")
        .first();
      if (lastEvent) {
        return { success: true, message: "Past Event", data: lastEvent };
      }
      return { success: false, message: "Event not found", data: null };
    }
    if (event.state === "draft" && !isAdmin)
      return { success: false, message: "Event is draft", data: null };

    return { success: true, message: "Success", data: event };
  },
});

export const updateOnlineEventState = mutation({
  args: {
    eventId: v.id("onlineEvents"),
    state: v.optional(onlineEventStateValues),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    // const user = await ctx.db.get(userId);
    // const isAdmin = user?.role?.includes("admin") ?? false;

    const event = await ctx.db.get(args.eventId);

    if (!event) throw new ConvexError("Event not found");
    const hasPlaceholderValues =
      event.terms?.includes("(placeholder - term)") ||
      event.requirements?.includes("(placeholder - requirement)");

    if (hasPlaceholderValues && event.state === "draft")
      throw new ConvexError("Event has placeholder values");

    await ctx.db.patch(event._id, {
      state: args.state,
    });

    return event;
  },
});

export const createOnlineEvent = mutation({
  args: {
    ...onlineEventsSchema,
    slug: v.optional(v.string()),
    state: v.optional(onlineEventStateValues),
  },
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
      img: args.img,
      slug: slug,
      description: args.description,
      requirements: args.requirements,
      terms: args.terms,
      startDate: args.startDate,
      endDate: args.endDate,
      location: args.location,
      organizer: userId,
      organizerBio: args.organizerBio,
      price: args.price,
      capacity: args.capacity,
      regDeadline: args.regDeadline,
      state: args.state ?? "draft",
    });
    return event;
  },
});

export const updateOnlineEvent = mutation({
  args: {
    ...onlineEventsSchema,
    eventId: v.id("onlineEvents"),
    slug: v.optional(v.string()),
    state: v.optional(onlineEventStateValues),
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

    const slug = args.name
      ? slugify(args.name, { lower: true, strict: true })
      : event.slug;
    console.log(args.organizer);

    const eventData = {
      name: args.name ?? event.name,
      slug,
      img: args.img ?? event.img,
      imgStorageId: args.imgStorageId ?? event.imgStorageId,
      description: args.description ?? event.description ?? "",
      requirements: args.requirements ?? event.requirements ?? [],
      startDate: args.startDate ?? event.startDate ?? Date.now(),
      endDate: args.endDate ?? event.endDate ?? Date.now(),
      regDeadline: args.regDeadline ?? event.regDeadline ?? Date.now(),
      location: args.location ?? event.location ?? "",
      terms: args.terms ?? event.terms ?? [],
      organizer: args.organizer ?? event.organizer ?? userId,
      organizerBio: args.organizerBio ?? event.organizerBio ?? "",
      price: args.price ?? event.price ?? 15,
      capacity: {
        ...event.capacity,
        max: args.capacity?.max ?? event.capacity.max ?? 20,
      },
      updatedBy: userId,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(event._id, {
      ...eventData,
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
    notes: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const formattedEmail = args.email?.toLowerCase();

    if (!userId || !formattedEmail)
      throw new ConvexError("Requires userId or email");
    const user = userId ? await ctx.db.get(userId) : null;
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
      //TODO: Check if this makes sense, or if it's better to just patch it and register? For cases where they've cancelled, then used that voucher elsewhere?
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
      notes: args.notes,
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
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
        if (voucher) {
          const initialVoucherAmt = voucher.amount;
          await ctx.db.patch(voucher._id, {
            redeemed: false,
            amount: initialVoucherAmt + event.price,
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
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();

        if (voucher?.redeemed === false) {
          const initialVoucherAmt = voucher.amount;
          const newVoucherAmt = initialVoucherAmt - event.price;
          if (newVoucherAmt < 0) {
            await ctx.db.patch(registration._id, {
              paid: false,
            });

            return {
              error: `Voucher amount ($${initialVoucherAmt}) is less than the event price ($${event.price})`,
              status: "error",
            };
          }

          await ctx.db.patch(voucher._id, {
            amount: newVoucherAmt,
            redeemed: newVoucherAmt === 0,
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
    console.log({ registration });
    if (!registration) return null;

    return {
      paid: registration.paid,
      canceled: registration.canceled,
      registration,
    };
  },
});

export const getUserVoucher = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const voucher = await ctx.db
      .query("eventVouchers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return voucher;
  },
});

export const uploadOnlineEventImage = mutation({
  args: {
    storageId: v.id("_storage"),
    eventId: v.id("onlineEvents"),
  },
  handler: async (ctx, { storageId, eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        success: false,
        message: "Not authenticated",
        eventId,
        imageUrl: "",
      };
    const fileUrl = await ctx.storage.getUrl(storageId);
    if (!fileUrl)
      return {
        success: false,
        message: "Failed to retrieve file URL",
        eventId,
        imageUrl: "",
      };

    const event = await ctx.db
      .query("onlineEvents")
      .withIndex("by_id", (q) => q.eq("_id", eventId))
      .unique();

    if (!event) {
      await ctx.storage.delete(storageId);
      return {
        success: false,
        message: "Event not found",
        eventId,
        imageUrl: "",
      };
    }
    await ctx.db.patch(event._id, {
      img: fileUrl,
      imgStorageId: storageId,
    });

    return {
      success: true,
      message: "Image uploaded successfully",
      imageUrl: fileUrl,
      eventId,
    };
  },
});

export const removeOnlineEventImage = mutation({
  args: {
    storageId: v.id("_storage"),
    eventId: v.optional(v.id("onlineEvents")),
  },
  handler: async (ctx, { storageId, eventId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const event = eventId ? await ctx.db.get(eventId) : null;
    if (!event) throw new Error("Event not found");
    await ctx.storage.delete(storageId);
    await ctx.db.patch(event._id, {
      img: undefined,
      imgStorageId: undefined,
    });

    return { success: true };
  },
});

export const getUserRegistrations = query({
  args: {
    eventId: v.id("onlineEvents"),
  },
  handler: async (ctx, args) => {
    const activeRegistrations = await ctx.db
      .query("userAddOns")
      .withIndex("by_paid_canceled_eventId", (q) =>
        q.eq("paid", true).eq("canceled", false).eq("eventId", args.eventId),
      )
      .collect();
    if (!activeRegistrations)
      return { status: "noRegistrations", registrations: null };

    return { status: "success", registrations: activeRegistrations };
  },
});
