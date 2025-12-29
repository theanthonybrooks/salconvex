import { capitalize } from "lodash";
import slugify from "slugify";

import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation, query } from "~/convex/_generated/server";
import { ensureAdminOrCreator } from "~/convex/helpers/authHelpers";
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

export const getCampaigns = query({
  handler: async (ctx) => {
    const adminUser = await ensureAdminOrCreator(ctx);
    if (!adminUser) return null;

    const campaigns = await ctx.db.query("newsletterCampaign").collect();

    return campaigns;
  },
});

export const updateNewsletterCampaignStatus = mutation({
  args: {
    campaignId: v.id("newsletterCampaign"),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const { campaignId, status } = args;
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) return null;
    await ctx.db.patch(campaign._id, {
      status,
      updatedAt: Date.now(),
    });
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

    const adminUser = await ensureAdminOrCreator(ctx);
    if (!adminUser)
      return {
        success: false,
        message: "You must be an admin to create a campaign",
      };
    const getFormattedDate = (date: number, options: { public: boolean }) => {
      const hideDay = options.public;
      return new Date(date).toLocaleString(undefined, {
        month: "short",
        day: hideDay ? undefined : "2-digit",
        year: "2-digit",
      });
    };

    const formattedTitle = `${title} (${capitalize(type)} | ${capitalize(frequency)} - ${getFormattedDate(plannedSendTime, { public: false })}) ${isTest ? "(TEST)" : ""}`;
    const publicTitle = `${title} (${capitalize(frequency)}) - ${getFormattedDate(plannedSendTime, { public: true })}`;
    const slug = slugify(formattedTitle, { lower: true, strict: true });
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
      title: formattedTitle,
      publicTitle,
      slug,
      status: "draft",
      type,
      frequency,
      userPlan,
      isTest,
      plannedSendTime,
      createdBy: adminUser._id,
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
        idx.eq("newsletter", "active").gte("userPlan", userPlan),
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

export const processScheduledCampaigns = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const campaigns = await ctx.db
      .query("newsletterCampaign")
      .withIndex("by_status_plannedSendTime", (q) =>
        q.eq("status", "scheduled").lte("plannedSendTime", now),
      )
      .take(50); // some reasonable batch size

    for (const campaign of campaigns) {
      await ctx.scheduler.runAfter(
        0,
        internal.newsletter.emails.startSendingCampaignInternal,
        { campaignId: campaign._id },
      );
    }
  },
});
