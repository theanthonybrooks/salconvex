import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "Delete unconfirmed users every 15 min",
  "*/15 * * * *", // Every 15 minutes
  internal.users.deleteUnconfirmedUsers,
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

crons.cron(
  "archive past online events every 60 min",
  "*/60 * * * *", // Every 60 minutes
  internal.userAddOns.onlineEvents.archivePastEvents,
);

// crons.hourly(
//   "Delete unconfirmed users",
//   { minuteUTC: 0 }, // Run hourly  UTC (-1 from Berlin)
//   internal.users.deleteUnconfirmedUsers,
// );
// crons.hourly(
//   "Delete unconfirmed users (15)",
//   { minuteUTC: 15 }, // Run hourly  UTC (-1 from Berlin)
//   internal.users.deleteUnconfirmedUsers,
// );
// crons.hourly(
//   "Delete unconfirmed users (30)",
//   { minuteUTC: 30 }, // Run hourly  UTC (-1 from Berlin)
//   internal.users.deleteUnconfirmedUsers,
// );
// crons.hourly(
//   "Delete unconfirmed users (45)",
//   { minuteUTC: 45 }, // Run hourly  UTC (-1 from Berlin)
//   internal.users.deleteUnconfirmedUsers,
// );

// crons.hourly(
//   "archive expired open calls",
//   { minuteUTC: 0 },
//   internal.openCalls.openCall.archiveExpiredOpenCalls,
// );

// crons.hourly(
//   "archive expired open calls (30)",
//   { minuteUTC: 30 },
//   internal.openCalls.openCall.archiveExpiredOpenCalls,
// );

// crons.hourly(
//   "delete orphaned user passwords",
//   { minuteUTC: 0 },
//   internal.users.deleteOrphanedUserPw,
// );

export default crons;
