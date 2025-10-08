//TODO: Look into namespaces for these. (at 11:22 in the convex aggregate component video)

import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "~/convex/_generated/api";
import { DataModel } from "~/convex/_generated/dataModel";

export const eventsAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: "events";
}>(components.eventsAggregate, {
  sortKey: (doc) => doc.state,
});

export const openCallsAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: "openCalls";
}>(components.openCallsAggregate, {
  sortKey: (doc) => (doc.state ? doc.state : "unknown"),
});
