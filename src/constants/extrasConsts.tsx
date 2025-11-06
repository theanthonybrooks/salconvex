import { CheckCircle, Clock, Save } from "lucide-react";

import type { OnlineEventStateType } from "~/convex/schema";

export const onlineEventCategories = [
  {
    value: "published",
    label: "Published",
    icon: CheckCircle,
  },
  {
    value: "draft",
    label: "Draft",
    icon: Save,
  },
  {
    value: "archived",
    label: "Archived",
    icon: Clock,
  },
];

export const onlineEventStatusBgColorMap: Record<OnlineEventStateType, string> =
  {
    published: "bg-green-100",
    draft: "",
    archived: "bg-slate-100",
  };

export const onlineEventStatusColorMap: Record<OnlineEventStateType, string> = {
  published: "text-green-700 data-[state=selected]:text-foreground ",
  draft: "",
  archived: "text-blue-700 border-blue-700",
};
