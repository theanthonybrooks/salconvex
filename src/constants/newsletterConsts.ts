export const newsletterFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
] as const;

export type NewsletterFrequency =
  (typeof newsletterFrequencyOptions)[number]["value"];

export const newsletterFrequencyValues = newsletterFrequencyOptions.map(
  (opt) => opt.value,
) as [NewsletterFrequency, ...NewsletterFrequency[]];

//todo: add an organizer type and perhaps an artist type? Event type of upcoming events each month?
export const newsletterTypeOptions = [
  { value: "general", label: "General" },
  { value: "openCall", label: "Open Call" },
] as const;

export type NewsletterType = (typeof newsletterTypeOptions)[number]["value"];
