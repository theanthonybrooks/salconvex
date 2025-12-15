import { vOnEmailEventArgs } from "@convex-dev/resend";
import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation } from "~/convex/_generated/server";
import { ConvexError, v } from "convex/values";

//todo: use the event type to handle a field in the newsletter table (existing or new) to show the current status for that user/the current email. I think it should maybe have a campaign table that then opens a secondary table with the recipents of that specific campaign and when they received it (and their actions thereafter). created_at should be used to update a lastUpdatedAt field on the campaign table.
export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (ctx, { id, event }) => {
    const audience = await ctx.db
      .query("newsletterCampaignAudience")
      .withIndex("by_resendEmailId", (q) => q.eq("resendEmailId", id))
      .unique();

    if (!audience) return;

    if (event.type === "email.sent") {
      await ctx.db.patch("newsletterCampaignAudience", audience._id, {
        status: "sent",
        sentAt: Date.now(),
      });
    } else if (event.type === "email.bounced") {
      await ctx.db.patch("newsletterCampaignAudience", audience._id, {
        status: "bounced",
        bouncedAt: Date.now(),
      });
    } else if (event.type === "email.failed") {
      await ctx.db.patch("newsletterCampaignAudience", audience._id, {
        status: "failed",
        failedAt: Date.now(),
      });
    } else if (event.type === "email.delivered") {
      await ctx.db.patch("newsletterCampaignAudience", audience._id, {
        status: "delivered",
        deliveredAt: Date.now(),
      });
    }
  },
});

export const startSendingCampaign = mutation({
  args: {
    campaignId: v.id("newsletterCampaign"),
  },
  handler: async (ctx, { campaignId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    // Delegate to the internal entrypoint
    await ctx.runMutation(
      internal.newsletter.emails.startSendingCampaignInternal,
      { campaignId },
    );
  },
});

// 1. Internal entrypoint: does the real work, including status patch.
export const startSendingCampaignInternal = internalMutation({
  args: {
    campaignId: v.id("newsletterCampaign"),
  },
  handler: async (ctx, { campaignId }) => {
    // 1. Load campaign
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) {
      throw new ConvexError({
        code: "NO_CAMPAIGN",
        message: "Campaign not found",
      });
    }

    if (!campaign.emailContent || campaign.emailContent?.trim() === "") {
      throw new ConvexError({
        code: "NO_CONTENT",
        message: "Campaign has no email content",
      });
    }

    // 2. Validate status
    if (campaign.status === "sent") {
      throw new ConvexError({ code: "SENT", message: "Campaign already sent" });
    }
    if (campaign.status === "sending") {
      return;
    }
    if (campaign.status === "cancelled") {
      throw new ConvexError({
        code: "CANCELLED",
        message: "Campaign is cancelled",
      });
    }

    // 3. Ensure there is an audience
    const audienceSample = await ctx.db
      .query("newsletterCampaignAudience")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .take(1);

    if (audienceSample.length === 0) {
      throw new ConvexError({
        code: "NO_AUDIENCE",
        message: "Campaign has no audience",
      });
    }

    // 4. Mark campaign as sending
    await ctx.db.patch(campaignId, {
      status: "sending",
      startedSendTime: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.newsletter.emails.sendCampaignBatch,
      {
        campaignId,
        cursor: null,
        batchSize: 100,
      },
    );
  },
});

export const sendCampaignBatch = internalMutation({
  args: {
    campaignId: v.id("newsletterCampaign"),
    cursor: v.union(v.string(), v.null()),
    batchSize: v.number(),
  },
  handler: async (ctx, { campaignId, cursor, batchSize }) => {
    const page = await ctx.db
      .query("newsletterCampaignAudience")
      .withIndex("by_campaignId_status", (q) =>
        q.eq("campaignId", campaignId).eq("status", "pending"),
      )
      .paginate({ cursor, numItems: batchSize });

    const batch = page.page;

    if (batch.length > 0) {
      await ctx.scheduler.runAfter(
        0,
        internal.actions.newsletter.sendBatchAction,
        {
          campaignId,
          audienceIds: batch.map((r) => r._id),
          emails: batch.map((r) => r.email),
        },
      );
    }

    // 2) recurse to next page
    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.newsletter.emails.sendCampaignBatch,
        {
          campaignId,
          cursor: page.continueCursor,
          batchSize,
        },
      );
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.newsletter.emails.markCampaignSent,
        { campaignId },
      );
    }
  },
});

export const markCampaignSent = internalMutation({
  args: { campaignId: v.id("newsletterCampaign") },
  handler: async (ctx, { campaignId }) => {
    await ctx.db.patch(campaignId, {
      status: "sent",
      finishedSendTime: Date.now(),
    });
  },
});

export const markBatchAsSending = internalMutation({
  args: {
    audienceIds: v.array(v.id("newsletterCampaignAudience")),
    emailIds: v.array(v.string()),
  },
  handler: async (ctx, { audienceIds, emailIds }) => {
    const now = Date.now();

    for (let i = 0; i < audienceIds.length; i++) {
      const audienceId = audienceIds[i];
      const emailId = emailIds[i];

      await ctx.db.patch("newsletterCampaignAudience", audienceId, {
        status: "sending",
        resendEmailId: emailId,
      });
    }
  },
});
