import { intervalToLetter, userPlans } from "@/constants/subscriptions";

export function formatSubscriptionLabel(planName: string, interval: string) {
  const planNumber = userPlans[planName] ?? 0;
  const intervalLetter = intervalToLetter[interval] ?? "?";
  const intervalLabel =
    interval === "month"
      ? "monthly"
      : interval === "year"
        ? "yearly"
        : interval;
  return `${planNumber}${intervalLetter}. ${intervalLabel}-${planName}`;
}
