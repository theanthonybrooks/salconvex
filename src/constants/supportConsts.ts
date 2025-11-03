import {
  Calendar,
  Circle,
  Construction,
  CreditCard,
  Megaphone,
  PaintRoller,
  Palette,
  Scroll,
  Users2,
} from "lucide-react";
import z from "zod";

export const supportCategoryOptions = [
  { label: "General", value: "general", icon: Construction },
  { label: "UI/UX", value: "ui/ux", icon: Palette },
  { label: "Account/Billing", value: "account", icon: CreditCard },
  { label: "Artist", value: "artist", icon: PaintRoller },
  { label: "Organization", value: "organization", icon: Users2 },
  { label: "The List", value: "theList", icon: Scroll },
  { label: "Event", value: "event", icon: Calendar },
  { label: "Open Call", value: "openCall", icon: Megaphone },
  { label: "Other", value: "other", icon: Circle },
] as const;

export type SupportCategory = (typeof supportCategoryOptions)[number]["value"];


export const supportCategoryValidator = z.union(
  supportCategoryOptions.map((opt) => z.literal(opt.value)),
);

export function getSupportCategoryLabel(value: SupportCategory): string {
  const option = supportCategoryOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
}
