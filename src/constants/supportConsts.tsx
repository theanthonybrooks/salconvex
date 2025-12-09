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
