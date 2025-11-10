import {
  CheckCircle,
  CheckIcon,
  CircleSmallIcon,
  CircleX,
  Clock,
  Save,
} from "lucide-react";

import type { OnlineEventStateType, UserAddOnStatus } from "~/convex/schema";

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

export const registrationStatusOptions = [
  { value: "chosen", label: "Chosen", icon: CheckIcon },
  { value: "backup", label: "Backup", icon: CircleSmallIcon },
  { value: "ineligible", label: "Ineligible", icon: CircleX },
];

export const registrationStatusColorMap: Record<UserAddOnStatus, string> = {
  chosen: "text-green-700",
  ineligible: "text-red-700",
  backup: "text-amber-700",
  "": "",
};
export const registrationStatusBgColorMap: Record<UserAddOnStatus, string> = {
  chosen: "bg-green-100",
  ineligible: "bg-red-100",
  backup: "bg-amber-100",
  "": "",
};
