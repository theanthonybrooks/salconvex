export const supportCategoryOptions = [
  { label: "General", value: "general" },
  { label: "UI/UX", value: "ui/ux" },
  { label: "Account/Billing", value: "account" },
  { label: "Artist", value: "artist" },
  { label: "Organization", value: "organization" },
  { label: "Event", value: "event" },
  { label: "Open Call", value: "openCall" },
  { label: "Other", value: "other" },
] as const;

export type SupportCategory = typeof supportCategoryOptions[number]["value"];
