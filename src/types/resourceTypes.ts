import type { onlineEventLocationOptions } from "@/constants/resourcesConsts";

import type { Doc } from "~/convex/_generated/dataModel";

export type OnlineEventType = Doc<"onlineEvents">;

export type OnlineEventLocation =
  (typeof onlineEventLocationOptions)[number]["value"];
