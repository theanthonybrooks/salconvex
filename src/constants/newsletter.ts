export const newsletterFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
] as const;

export type NewsletterFrequency = (typeof newsletterFrequencyOptions)[number]["value"];