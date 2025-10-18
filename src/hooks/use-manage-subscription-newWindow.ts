import { ManageSubscriptionArgs } from "@/hooks/use-manage-subscription";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

export function useManageSubscription({
  subscription,
}: ManageSubscriptionArgs) {
  const { customerId } = subscription ?? {};
  const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl);

  const handleManageSubscription = async () => {
    if (!customerId) {
      toast.error(
        "No membership found. Please contact support if this is incorrect.",
      );
      return;
    }

    try {
      const result = await getDashboardUrl({
        customerId,
      });
      if (result) {
        toast.success("Successfully forwardeing to Stripe!");
      }
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
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
  };

  return handleManageSubscription;
}
