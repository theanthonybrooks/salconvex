import { FeedbackLabels } from "@/constants/stripe";
import { intervalToLetter, userPlans } from "@/constants/subscriptions";

export function formatSubscriptionLabel(planName: string, interval: string) {
  if (!userPlans[planName]) return "";
  const planNumber = userPlans[planName] ?? 0;
  const intervalLetter = intervalToLetter[interval] ?? "";
  const intervalLabel =
    interval === "month"
      ? "monthly"
      : interval === "year"
        ? "yearly"
        : interval;
  return `${planNumber}${intervalLetter}. ${intervalLabel}-${planName}`;
}

export function getFeedbackLabel(feedback: unknown): string | undefined {
  if (typeof feedback !== "string") return undefined;
  return FeedbackLabels[feedback as keyof typeof FeedbackLabels];
}
