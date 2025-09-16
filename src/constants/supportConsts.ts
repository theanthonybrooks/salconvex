import {
  Calendar,
  Circle,
  Construction,
  CreditCard,
  Megaphone,
  PaintRoller,
  Palette,
  Users2,
} from "lucide-react";

export const supportCategoryOptions = [
  { label: "General", value: "general", icon: Construction },
  { label: "UI/UX", value: "ui/ux", icon: Palette },
  { label: "Account/Billing", value: "account", icon: CreditCard },
  { label: "Artist", value: "artist", icon: PaintRoller },
  { label: "Organization", value: "organization", icon: Users2 },
  { label: "Event", value: "event", icon: Calendar },
  { label: "Open Call", value: "openCall", icon: Megaphone },
  { label: "Other", value: "other", icon: Circle },
] as const;

export type SupportCategory = (typeof supportCategoryOptions)[number]["value"];
