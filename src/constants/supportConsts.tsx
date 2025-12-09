import type { Priority } from "@/constants/kanbanConsts";
import type { StatusValue } from "@/features/admin/dashboard/components/admin-support-actions";

import z from "zod";

import {
  Calendar,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleX,
  Construction,
  CreditCard,
  Megaphone,
  PaintRoller,
  Palette,
  Scroll,
  Users2,
} from "lucide-react";

import { cn } from "@/helpers/utilsFns";

export const supportCategoryOptions = [
  { label: "General", value: "general", icon: Construction, group: "General" },
  { label: "UI/UX", value: "ui/ux", icon: Palette, group: "General" },
  {
    label: "Account/Billing",
    value: "account",
    icon: CreditCard,
    group: "Account",
  },
  { label: "Artist", value: "artist", icon: PaintRoller, group: "Account" },
  {
    label: "Organization",
    value: "organization",
    icon: Users2,
    group: "Account",
  },
  { label: "The List", value: "theList", icon: Scroll, group: "The List" },
  { label: "Event", value: "event", icon: Calendar, group: "The List" },
  { label: "Open Call", value: "openCall", icon: Megaphone, group: "The List" },
  { label: "Other", value: "other", icon: Circle },
] as const;

export const ticketStatusOptions = [
  {
    value: "pending",
    label: "Pending",
    icon: CircleDashed,
  },
  {
    value: "open",
    label: "Open",
    icon: Circle,
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CircleCheck,
  },
  {
    value: "closed",
    label: "Closed",
    icon: CircleX,
  },
] as const;

export type SupportCategory = (typeof supportCategoryOptions)[number]["value"];

export const supportCategoryValidator = z.union(
  supportCategoryOptions.map((opt) => z.literal(opt.value)),
);

export function getSupportCategoryLabel(value: SupportCategory): string {
  const option = supportCategoryOptions.find((opt) => opt.value === value);

  return option ? option.label : value;
}

export const getSupportPriorityOptions = (status: StatusValue) => [
  {
    label: (
      <PriorityIndicatorBase
        priority="high"
        alternativeLow={status === "closed" || status === "resolved"}
      />
    ),
    value: "high",
  },
  {
    label: (
      <PriorityIndicatorBase
        priority="medium"
        alternativeLow={status === "closed" || status === "resolved"}
      />
    ),
    value: "medium",
  },
  {
    label: (
      <PriorityIndicatorBase
        priority="low"
        alternativeLow={status === "closed" || status === "resolved"}
      />
    ),
    value: "low",
  },
];

export function PriorityIndicatorBase({
  priority,
  onClickAction,
  alternativeLow,
}: {
  priority: Priority;
  onClickAction?: (value: Priority) => void;
  alternativeLow?: boolean;
}) {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onClickAction?.(priority);
      }}
      className={cn(
        "mt-1 block size-2 rounded-full border border-transparent p-[5px] hover:scale-105 hover:cursor-pointer hover:border-foreground active:scale-95",
        priority === "low" || alternativeLow
          ? "bg-green-500"
          : priority === "high"
            ? "bg-red-500"
            : "bg-yellow-500",
      )}
    />
  );
}
