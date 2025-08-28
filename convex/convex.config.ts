import migrations from "@convex-dev/migrations/convex.config";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";
import workpool from "@convex-dev/workpool/convex.config";

import { defineApp } from "convex/server";

const app = defineApp();
app.use(migrations);
app.use(shardedCounter);
app.use(workpool, { name: "ticketCounterPool" });

export default app;
