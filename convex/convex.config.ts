import aggregate from "@convex-dev/aggregate/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";
import workpool from "@convex-dev/workpool/convex.config";

import { defineApp } from "convex/server";

const app = defineApp();
app.use(shardedCounter);
app.use(workpool, { name: "ticketCounterPool" });
app.use(aggregate, { name: "eventsAggregate" });
app.use(aggregate, { name: "openCallsAggregate" });

app.use(migrations);

export default app;
