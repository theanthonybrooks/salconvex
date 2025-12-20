import type { SystemIndexes } from "convex/server";

import slugify from "slugify";

import type { Doc, Id, TableNames } from "~/convex/_generated/dataModel";
import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "~/convex/_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation, query } from "~/convex/_generated/server";
import { upsertNotification } from "~/convex/general/notifications";
import {
  onlineEventsSchema,
  onlineEventStateValues,
  userAddOnStatusValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";

type TableIndexNames =
  | keyof SystemIndexes // "_id", "_creationTime" indexes [[SystemIndexes](https://docs.convex.dev/api/modules/
  | "by_slug" // your own indexes for that table
  | "by_state"
  | "by_endDate"
  | "by_imgStorageId"
  | "by_startDate"
  | "by_state_endDate"
  | "by_slug_startDate"
  | "by_slug_endDate"
  | "by_slug_state_endDate"
  | "by_slug_state_startDate"
  | "by_organizer";

export async function generateUniqueSlugForTable(
  ctx: MutationCtx,
  {
    table,
    baseName,
    slugIndexName,
  }: {
    table: Extract<TableNames, "onlineEvents">;
    baseName: string;
    slugIndexName: TableIndexNames;
  },
): Promise<{ slug: string }> {
  let base = baseName;
  let suffix = 1;

  const match = baseName.match(/^(.*?)(?:[-\s])(\d+)$/);
  if (match) {
    base = match[1];
    suffix = parseInt(match[2], 10) + 1;
  }

  const baseSlug = slugify(baseName, { lower: true, strict: true });
  const existingBaseSlug = await ctx.db
    .query(table)
    .withIndex(slugIndexName, (q) => q.eq("slug", baseSlug))
    .first();

  if (!existingBaseSlug) {
    return { slug: baseSlug };
  }

  while (true) {
    const tryName = match ? `${base} ${suffix}` : `${base}-${suffix}`;
    const trySlug = slugify(tryName, { lower: true, strict: true });

    const slugExists = await ctx.db
      .query(table)
      .withIndex(slugIndexName, (q) => q.eq("slug", trySlug))
      .unique();

    if (!slugExists) {
      return { slug: trySlug };
    }

    suffix++;
  }
}

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

export const getPublishedOnlineEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("onlineEvents").collect();
    if (!events) return { success: true, data: [], message: "No events found" };
    const filtered = events.filter((e) => e.state !== "draft");

    return { success: true, data: filtered, message: "Success" };
  },
});

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
          slug: event.slug,
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
    let resultEvent: Doc<"onlineEvents"> | null = null;
    const now = Date.now();
    const currentEvent = args.eventId
      ? await ctx.db.get(args.eventId)
      : isAdmin
        ? await ctx.db
            .query("onlineEvents")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug ?? ""))
            .order("asc")
            .first()
        : await ctx.db
            .query("onlineEvents")
            .withIndex("by_slug_state_endDate", (q) =>
              q
                .eq("slug", args.slug ?? "")
                .eq("state", "published")
                .gt("endDate", now),
            )
            .filter((q) => q.lte(q.field("startDate"), now))
            .order("asc")
            .first();

    if (currentEvent) resultEvent = currentEvent;

    const futureEvent = !resultEvent
      ? await ctx.db
          .query("onlineEvents")
          .withIndex("by_slug_startDate", (q) =>
            q.eq("slug", args.slug ?? "").gt("startDate", now),
          )
          .order("asc")
          .first()
      : null;

    if (futureEvent) resultEvent = futureEvent;

    const lastEvent = !resultEvent
      ? await ctx.db
          .query("onlineEvents")
          .withIndex("by_slug_state_endDate", (q) =>
            q
              .eq("slug", args.slug ?? "")
              .eq("state", "archived")
              .lte("endDate", now),
          )
          .order("desc")
          .first()
      : null;
    if (lastEvent) resultEvent = lastEvent;
    if (!resultEvent)
      return { success: false, message: "Event not found", data: null };

    if (resultEvent.state === "draft" && !isAdmin)
      return { success: false, message: "Event is draft", data: null };
    const userRegistration = await ctx.db
      .query("userAddOns")
      .withIndex("by_userId_eventId", (q) =>
        q.eq("userId", userId).eq("eventId", resultEvent._id),
      )
      .first();

    return {
      success: true,
      message: "Success",
      data: resultEvent,
      userRegistration: {
        paid: userRegistration?.paid,
        canceled: userRegistration?.canceled,
        registration: userRegistration,
      },
    };
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

    if (args.state === "published") {
      await upsertNotification(ctx, {
        type: "newResource",
        redirectUrl: `/resources/${event.slug}`,
        deadline: event.regDeadline,
        displayText: "New Resource Added",
        dedupeKey: `resource-${event._id}-published`,
      });
    }

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
    const { slug } = await generateUniqueSlugForTable(ctx, {
      table: "onlineEvents",
      baseName: args.name,
      slugIndexName: "by_slug",
    });
    const eventId = await ctx.db.insert("onlineEvents", {
      name: args.name,
      img: args.img,
      slug,
      description: args.description,
      requirements: args.requirements,
      formOptions: args.formOptions,
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
    if (eventId) {
      if (args.state === "published") {
        await upsertNotification(ctx, {
          type: "newResource",
          redirectUrl: `/resources/${slug}`,
          deadline: args.regDeadline,
          displayText: "New Resource Added",
          dedupeKey: `resource-${eventId}-published`,
        });
      }
    }
    return eventId;
  },
});

export const duplicateOnlineEvent = mutation({
  args: {
    eventId: v.id("onlineEvents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new ConvexError("Event not found");
    const { _id, _creationTime, updatedAt, updatedBy, ...eventData } = event;

    const { slug } = await generateUniqueSlugForTable(ctx, {
      table: "onlineEvents",
      baseName: event.name,
      slugIndexName: "by_slug",
    });

    const duplicateEvent = await ctx.db.insert("onlineEvents", {
      ...eventData,
      slug,
      startDate: Date.now(),
      endDate: Date.now(),
      regDeadline: Date.now(),
      capacity: {
        ...event.capacity,
        current: 0,
      },
      organizer: userId,
      state: "draft",
    });

    return duplicateEvent;
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
      formOptions: args.formOptions ?? event.formOptions,
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
    await ctx.scheduler.runAfter(
      0,
      internal.general.notifications.runUpdateOrDeleteByDedupeKey,
      {
        dedupeKey: `resource-${args.eventId}-published`,
        numItems: 100,
        mode: "delete",
      },
    );
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
    action: v.union(
      v.literal("cancel"),
      v.literal("renew"),
      v.literal("update"),
    ),
    notes: v.optional(v.string()),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role?.includes("admin") ?? false;
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

      if (registration.plan && registration.plan < 2 && !isAdmin) {
        const voucher = await ctx.db
          .query("onlineEventVouchers")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
        if (voucher) {
          const initialVoucherAmt = voucher.amount;
          await ctx.db.patch(voucher._id, {
            redeemed: false,
            amount: initialVoucherAmt + event.price,
          });
        } else {
          await ctx.db.insert("onlineEventVouchers", {
            userId,
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
      if (registration.plan && registration.plan < 2 && !isAdmin) {
        const voucher = await ctx.db
          .query("onlineEventVouchers")
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
    } else if (args.action === "update") {
      await ctx.db.patch(registration._id, {
        notes: args.notes,
        link: args.link,
      });
    }

    if (args.action !== "update") {
      await sendEventRegistrationEmailHelper(
        ctx,
        args.eventId,
        userId,
        formattedEmail,
        args.action,
      );
    }
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

export const getUserVoucher = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const voucher = await ctx.db
      .query("onlineEventVouchers")
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
    const eventsUsingImg = await ctx.db
      .query("onlineEvents")
      .withIndex("by_imgStorageId", (q) => q.eq("imgStorageId", storageId))
      .collect();

    if (eventsUsingImg.length > 1) {
      return {
        success: true,
        message: "This image is used by other events. Not deleting.",
      };
    }
    await ctx.storage.delete(storageId);
    await ctx.db.patch(event._id, {
      img: undefined,
      imgStorageId: undefined,
    });

    return { success: true, message: "Image deleted successfully" };
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

export const getAllRegistrationsForEvent = query({
  args: {
    eventId: v.id("onlineEvents"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    const registrations = await ctx.db
      .query("userAddOns")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const assignedOrders = registrations.map((r) => r.order);
    const takenOrders = assignedOrders.filter(
      (n): n is number => n !== undefined,
    );

    const enrichedRegistrations = await Promise.all(
      registrations.map(async (registration) => {
        return {
          ...registration,
          status: registration.status ?? "",
          capacity: event?.capacity?.max ?? 20,
          order: registration.order,
          takenOrders,
        };
      }),
    );

    return enrichedRegistrations;
  },
});

export const updateRegistrationAdmin = mutation({
  args: {
    registrationId: v.id("userAddOns"),
    order: v.optional(v.number()),
    status: v.optional(userAddOnStatusValidator),
    type: v.union(v.literal("order"), v.literal("status")),
  },
  handler: async (ctx, args) => {
    const { registrationId, order, status, type } = args;
    const registration = await ctx.db.get(registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    if (type === "order") {
      await ctx.db.patch(registrationId, {
        order,
      });
    } else if (type === "status") {
      await ctx.db.patch(registrationId, {
        status,
        ...(status !== "chosen" && { order: undefined }),
      });
    }

    return registration;
  },
});

export const archivePastEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db
      .query("onlineEvents")
      .withIndex("by_state_endDate", (q) =>
        q.eq("state", "published").lte("endDate", now),
      )
      .collect();
    try {
      for (const event of events) {
        await ctx.db.patch(event._id, {
          state: "archived",
          updatedAt: Date.now(),
          updatedBy: "system",
        });
      }
    } catch (error) {
      console.error("Error archiving past events:", error);
    }
  },
});
