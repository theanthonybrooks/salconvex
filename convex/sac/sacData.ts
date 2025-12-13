import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation, query } from "~/convex/_generated/server";
import { sacValidator } from "~/convex/schema";
import { v } from "convex/values";

export const upsertManyBySacIdInternal = internalMutation({
  args: {
    items: v.array(sacValidator),
  },
  handler: async (ctx, { items }) => {
    for (const item of items) {
      // find existing doc by sacId via your index
      console.log("deadline: ", item.openCall?.deadline);
      const existing = await ctx.db
        .query("sacData")
        .withIndex("by_sacId", (q) => q.eq("sacId", item.sacId))
        .unique();

      if (!existing) {
        // new document: set your own defaults (e.g. checked: false)
        await ctx.db.insert("sacData", {
          ...item,
          checked: false,
          salUpdatedAt: Date.now(),
        });
        await ctx.db.insert("notifications", {
          type: "newSac",
          userId: null,
          targetRole: "admin",
          displayText: "New Street Art Call",
          dismissed: false,
        });
        continue;
      }

      if (existing.updatedAt === item.updatedAt) continue;

      // update existing doc but DO NOT overwrite checked
      await ctx.db.patch(existing._id, {
        dataCollectionId: item.dataCollectionId,
        location: item.location,
        event: item.event,
        openCall: item.openCall,
        contact: item.contact,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        salUpdatedAt: Date.now(),
        // no `checked` here → it stays whatever it was
      });
      await ctx.db.insert("notifications", {
        type: "newSac",
        userId: null,
        targetRole: "admin",
        displayText: "Updated Street Art Call",
        dismissed: false,
      });
    }
  },
});

export const upsertManyBySacId = mutation({
  args: { items: v.array(sacValidator) },
  handler: async (ctx, { items }) => {
    await ctx.runMutation(internal.sac.sacData.upsertManyBySacIdInternal, {
      items,
    });
  },
});

export const getSacData = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.role?.includes("admin") || !user) return null;
    const sacData = await ctx.db
      .query("sacData")
      .withIndex("by_updatedAt")
      .order("asc")
      .collect();

    const mappedResults = sacData.map((result) => {
      const {
        _id,
        location,
        event,
        openCall,
        contact,
        createdAt,
        updatedAt,
        checked,
        salUpdatedAt,
      } = result;
      return {
        _id,
        name: event.name,
        email: contact.email,
        website: contact.website,
        deadline: openCall?.deadline,
        appLink: openCall?.applicationLink,
        country: location.country,
        location,
        event,
        openCall,
        contact,
        createdAt,
        updatedAt,
        salUpdatedAt,
        checked,
      };
    });
    return mappedResults;
  },
});

export const checkSacData = mutation({
  args: {
    salSacId: v.id("sacData"),
    checked: v.boolean(),
  },
  handler: async (ctx, { salSacId, checked }) => {
    const sacData = await ctx.db.get(salSacId);
    if (!sacData) return null;
    await ctx.db.patch(salSacId, {
      checked,
      salUpdatedAt: Date.now(),
    });
    return sacData;
  },
});
