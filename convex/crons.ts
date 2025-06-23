import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "Delete unconfirmed users",
  { hourUTC: 0, minuteUTC: 0 }, // Run daily at midnight UTC (-1 from Berlin)
  internal.users.deleteUnconfirmedUsers,
);

crons.hourly(
  "archive expired open calls",
  { minuteUTC: 0 },
  internal.openCalls.openCall.archiveExpiredOpenCalls,
);

crons.hourly(
  "archive expired open calls (30)",
  { minuteUTC: 30 },
  internal.openCalls.openCall.archiveExpiredOpenCalls,
);

export default crons;
