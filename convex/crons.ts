import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "Delete unconfirmed users every 15 min",
  "*/15 * * * *", // Every 15 minutes
  internal.users.deleteUnconfirmedUsers,
);

crons.cron(
  "Delete unverified pending emails every 15 min",
  "*/15 * * * *", // Every 30 minutes
  internal.users.deleteUnverifiedPendingEmails,
  {
    cursor: undefined,
  },
);

crons.cron(
  "delete orphaned user passwords every 15 min",
  "*/15 * * * *", // Every 15 minutes
  internal.users.deleteOrphanedUserPw,
);

crons.cron(
  "archive expired open calls every 30 min",
  "*/30 * * * *", // Every 30 minutes
  internal.openCalls.openCall.archiveExpiredOpenCalls,
);

crons.hourly(
  "archive past online events every 60 min",
  { minuteUTC: 0 }, // Run hourly  UTC (-1 from Berlin)
  internal.userAddOns.onlineEvents.archivePastEvents,
);

crons.hourly(
  "archive past notifications every 60 min",
  { minuteUTC: 0 }, // Run hourly  UTC (-1 from Berlin)
  internal.general.notifications.archivePastNotificationsStarter,
);

crons.interval(
  "check scheduled newsletter campaigns",
  { minutes: 30 }, // every half hour
  internal.newsletter.campaign.processScheduledCampaigns,
);

crons.daily(
  "remind admins of upcoming social posts",
  { hourUTC: 6, minuteUTC: 0 }, // Run daily  UTC
  internal.events.socials.sendSocialReminderNotification,
);

export default crons;
