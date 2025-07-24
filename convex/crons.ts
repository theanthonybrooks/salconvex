import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "Delete unconfirmed users",
  { minuteUTC: 0 }, // Run hourly  UTC (-1 from Berlin)
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

crons.hourly(
  "delete orphaned user passwords",
  { minuteUTC: 0 },
  internal.users.deleteOrphanedUserPw,
);

export default crons;
