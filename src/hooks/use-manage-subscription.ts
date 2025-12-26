import { useRouter } from "next/navigation";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { toast } from "react-toastify";

import { getSubscriptionStatusVals } from "@/helpers/subscriptionFns";

import { api } from "~/convex/_generated/api";
import { UserSubscriptionType } from "~/convex/schema";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";

export type ManageSubscriptionArgs = {
  subscription?: UserSubscriptionType | null;
  type?: "existing" | "new";
  destination?: "newTab" | "window";
};

export function useManageSubscription({
  subscription,
  type = "existing",
  destination = "newTab",
}: ManageSubscriptionArgs) {
  const subData = getSubscriptionStatusVals(subscription);
  const { status, cancelDetails } = subData ?? {};
  const customerId = subscription?.customerId;
  const router = useRouter();
  const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl);
  const currentlyCanceled =
    status?.isCanceled || cancelDetails?.currentlyCanceled;

  async function handleManageSubscription() {
    const tabDestination = destination === "newTab";
    let url: string | undefined;
    let newTab: Window | null | undefined;

    if (currentlyCanceled && type === "existing") {
      router.push("/pricing");
      return;
    }

    if (tabDestination && customerId) newTab = window.open("about:blank");

    try {
      if (!customerId) {
        throw new Error(
          "No membership found. Please contact support if this is incorrect.",
        );
      }
      const result = await getDashboardUrl({
        customerId,
      });
      if (!result.url) {
        throw new Error("Unable to get Stripe url");
      } else {
        url = result.url;
      }

      if (!newTab && tabDestination) {
        toast.error(
          "Stripe redirect blocked. Please enable popups for this site.",
        );
        console.error("Popup was blocked");
        return;
      }

      if (url) {
        if (tabDestination && newTab) {
          newTab.document.write(getExternalRedirectHtml(url, 1));
          newTab.document.close();
          newTab.location.href = url;
        } else {
          window.location.href = url;
        }
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

  return handleManageSubscription;
}
