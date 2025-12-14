import slugify from "slugify";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation, query } from "~/convex/_generated/server";
import { v } from "convex/values";

export const getCampaignById = query({
  args: {
    campaignId: v.id("newsletterCampaign"),
  },
  handler: async (ctx, args) => {
    const { campaignId } = args;
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) return null;
    return campaign;
  },
});

export const createNewsletterCampaign = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("general"), v.literal("openCall")),
    frequency: v.union(
      v.literal("monthly"),
      v.literal("weekly"),
      v.literal("all"),
    ),
    userPlan: v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3)),
    isTest: v.boolean(),
    plannedSendTime: v.number(),
  },
  handler: async (ctx, args) => {
    const { title, type, frequency, userPlan, isTest, plannedSendTime } = args;

    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!userId || !user?.role?.includes("admin"))
      return {
        success: false,
        message: "You must be an admin to create a campaign",
      };

    const slug = slugify(title, { lower: true, strict: true });
    const existingCampaign = await ctx.db
      .query("newsletterCampaign")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existingCampaign) {
      return {
        success: false,
        message: "A campaign with this name already exists",
      };
    }

    const campaignId = await ctx.db.insert("newsletterCampaign", {
      title,
      slug,
      status: "draft",
      type,
      frequency,
      userPlan,
      isTest,
      sendTime: plannedSendTime,
      createdBy: userId,
      audienceStatus: "pending",
    });

    if (!campaignId)
      return { success: false, message: "Failed to create campaign" };

    await ctx.scheduler.runAfter(
      0,
      internal.newsletter.campaign.populateCampaignAudienceBatch,
      {
        campaignId,
        cursor: null,
        batchSize: 200,
      },
    );

    return { success: true, campaignId };
  },
});

export const populateCampaignAudienceBatch = internalMutation({
  args: {
    campaignId: v.id("newsletterCampaign"),
    cursor: v.union(v.string(), v.null()),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;
    if (campaign.audienceStatus !== "inProgress") {
      await ctx.db.patch(campaign._id, {
        audienceStatus: "inProgress",
        ...(campaign.audienceError && { audienceError: undefined }),
      });
    }

    const { type, frequency, userPlan, isTest } = campaign;

    let q = ctx.db
      .query("newsletter")
      .withIndex("by_active_plan", (idx) =>
        idx.eq("newsletter", true).gte("userPlan", userPlan),
      );

    if (frequency !== "all") {
      q = q.filter((f) =>
        f.or(
          f.eq(f.field("frequency"), frequency),
          f.eq(f.field("frequency"), "weekly"),
        ),
      );
    }

    if (isTest) {
      q = q.filter((f) => f.eq(f.field("tester"), true));
    }

    const { page, isDone, continueCursor } = await q.paginate({
      cursor: args.cursor,
      numItems: args.batchSize,
    });

    const filteredPage = page.filter((subscriber) => {
      if (type.includes("openCall")) {
        return subscriber.type.includes("openCall");
      } else if (type.includes("general")) {
        return subscriber.type.includes("general");
      }
      return false;
    });
    let insertedCount = 0;
    for (const subscriber of filteredPage) {
      await ctx.db.insert("newsletterCampaignAudience", {
        campaignId: args.campaignId,
        subscriberId: subscriber._id,
        email: subscriber.email,
        status: "pending",
        updatedAt: Date.now(),
      });
      insertedCount += 1;
    }

    if (insertedCount > 0) {
      await ctx.db.patch(campaign._id, {
        audienceCount: (campaign.audienceCount ?? 0) + insertedCount,
      });
    }

    if (!isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.newsletter.campaign.populateCampaignAudienceBatch,
        {
          campaignId: args.campaignId,
          cursor: continueCursor,
          batchSize: args.batchSize,
        },
      );
    } else {
      await ctx.db.patch(campaign._id, {
        audienceStatus: "complete",
        ...(campaign.audienceError && { audienceError: undefined }),
      });
    }
  },
});
