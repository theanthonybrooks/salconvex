// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// console.log("is Stripe key issue:", new Stripe(process.env.STRIPE_SECRET_KEY!));

export type Feedback =
  | "customer_service"
  | "low_quality"
  | "missing_features"
  | "other"
  | "switched_service"
  | "too_complex"
  | "too_expensive"
  | "unused";

export const FeedbackLabels: Record<Feedback, string> = {
  too_expensive: "It's too expensive",
  missing_features: "I need more features",
  switched_service: "I found an alternative",
  unused: "I no longer need it",
  customer_service: "Customer service was less than expected",
  too_complex: "Ease of use was less than expected",
  low_quality: "Quality was less than expected",
  other: "Other reason",
};
