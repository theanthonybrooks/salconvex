import { FeedbackLabels } from "@/constants/stripe";
import { intervalToLetter, userPlans } from "@/constants/subscriptions";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { ConvexError } from "convex/values";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { UserSubscriptionType } from "~/convex/schema";

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

export type SubscriptionOutput = {
  status: {
    isCanceled: boolean;
    isPastDue: boolean;
    isUnpaid: boolean;
    isTrialing: boolean;
    isActive: boolean;
  };
  cancelDetails: {
    hasCanceled: boolean;
    willCancel: boolean;
    currentlyCanceled: boolean;
    cancelAtTime?: Date;
  };
  baseDetails: {
    // plan: string;
    interval: {
      currentInterval: string;
      nextInterval?: string;
    };
    planAmount: number;
    actualAmount: number | string;
    nextAmount: string | null;
    discount: {
      hasDiscount: boolean;
      amount: number;
      percent: number;
      type: "one-time" | "recurring" | null;
    };
  };
};

export function getSubscriptionStatusVals(
  subscription?: UserSubscriptionType | null,
): SubscriptionOutput | undefined {
  if (!subscription) return undefined;
  const subStatus = subscription.status ?? "none";
  // [X] Handle `isCanceled` — subscription fully canceled
  // [X] Handle "canceled but not yet ended" — scheduled to cancel at period end
  // [X] Handle `isActive` — normal active subscription
  // [X] Handle `isPastDue` — payment failed
  // [X] Handle `isUnpaid` — unpaid state
  // [X] Handle `isTrialing` — trial period active
  // [-] Distinguish between one-time vs recurring subscription
  // [-] Determine behavior when canceling with a promo code
  // [ ] Manage and format discount handling (move to helper function)

  // #region ------------- Plan Amount/Interval Handling --------------

  const planAmount =
    typeof subscription.amount === "number" ? subscription.amount / 100 : 0;

  const nextAmount =
    (subscription.amountNext && (subscription.amountNext! / 100).toFixed(0)) ||
    null;

  // #region ------------- Discount Handling --------------
  const discountDuration = subscription.discountDuration;
  const oneTimeDiscount = discountDuration === "once";
  const ongoingDiscount =
    typeof discountDuration === "string" && !oneTimeDiscount;
  let discountType: "one-time" | "recurring" | null = null;

  if (typeof discountDuration === "string") {
    if (oneTimeDiscount) discountType = "one-time";
    else if (ongoingDiscount) discountType = "recurring";
  }
  const hasDiscountAmt = typeof subscription.discountAmount === "number";
  const hasDiscountPercent = typeof subscription.discountPercent === "number";
  const hasDiscount = hasDiscountAmt || hasDiscountPercent;
  const discountAmt =
    typeof subscription.discountAmount === "number"
      ? subscription.discountAmount / 100
      : 0;
  const discountPercent =
    typeof subscription.discountPercent === "number"
      ? subscription.discountPercent / 100
      : 0;
  let actualAmount: string | number = planAmount.toFixed(0);

  switch (true) {
    case hasDiscountAmt:
      actualAmount = planAmount - discountAmt;
      break;

    case hasDiscountPercent:
      actualAmount = planAmount - planAmount * discountPercent;
      break;

    default:
      actualAmount = planAmount.toFixed(0);
      break;
  }
  // #endregion

  // #region ------------- Cancel Handling --------------
  const now = new Date();
  const cancelAtTime = subscription.cancelAt
    ? new Date(subscription.cancelAt)
    : undefined;

  const currentlyCanceled = Boolean(cancelAtTime && cancelAtTime < now);
  const willCancel = Boolean(cancelAtTime && cancelAtTime > now);
  // #endregion

  return {
    status: {
      isCanceled: subStatus === "canceled",
      isPastDue: subStatus === "past_due",
      isUnpaid: subStatus === "unpaid",
      isTrialing: subStatus === "trialing",
      isActive: subStatus === "active",
    },
    baseDetails: {
      interval: {
        currentInterval: subscription.interval ?? "month",
        nextInterval: subscription.intervalNext,
      },

      planAmount,
      actualAmount,
      nextAmount,
      discount: {
        hasDiscount,
        amount: discountAmt,
        percent: discountPercent,
        type: discountType,
      },
    },
    cancelDetails: {
      hasCanceled: willCancel || currentlyCanceled,
      willCancel,
      currentlyCanceled,
      cancelAtTime: subscription.cancelAt
        ? new Date(subscription.cancelAt)
        : undefined,
    },
  };
}

interface ManageSubscriptionArgs {
  subscription: { customerId?: string | null } | null | undefined;
  currentlyCanceled?: boolean;
  getDashboardUrl: (args: { customerId: string }) => Promise<{ url?: string }>;
  router: AppRouterInstance;
}

export async function handleManageSubscription({
  subscription,
  currentlyCanceled,
  getDashboardUrl,
  router,
}: ManageSubscriptionArgs): Promise<void> {
  console.log(currentlyCanceled);
  let url: string | undefined;

  if (!subscription?.customerId) {
    toast.error(
      "No membership found. Please contact support if this is incorrect.",
    );
    return;
  }

  if (currentlyCanceled) {
    router.push("/pricing?type=artist");
    return;
  }

  const newTab = window.open("about:blank");

  try {
    const result = await getDashboardUrl({
      customerId: subscription.customerId,
    });
    if (result?.url) url = result.url;

    if (!newTab) {
      toast.error(
        "Stripe redirect blocked. Please enable popups for this site.",
      );
      console.error("Popup was blocked");
      return;
    }

    if (url) {
      newTab.document.write(getExternalRedirectHtml(url, 1));
      newTab.document.close();
      newTab.location.href = url;
    }
  } catch (err: unknown) {
    if (!newTab?.closed) newTab?.document.close();

    if (err instanceof ConvexError) {
      toast.error(
        typeof err.data === "string" &&
          err.data.toLowerCase().includes("no such customer")
          ? "Your account was canceled. Contact support for assistance."
          : err.data || "An unexpected error occurred.",
      );
    } else if (err instanceof Error) {
      toast.error(
        typeof err.message === "string" &&
          err.message.toLowerCase().includes("no such customer")
          ? "Your account was canceled. Contact support for assistance."
          : err.message || "An unexpected error occurred.",
      );
    } else {
      toast.error("An unknown error occurred.");
    }
  }
}
