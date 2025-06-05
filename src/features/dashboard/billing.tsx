"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction, useQuery } from "convex/react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { ConvexError } from "convex/values";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

export default function BillingPage() {
  // const userData = useQuery(api.users.getCurrentUser, {})
  // const user = userData?.user // This avoids destructuring null or undefined
  const [promoCode, setPromoCode] = useState("");
  const [promoAttempts, setPromoAttempts] = useState(0);
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl);
  const applyCoupon = useAction(
    api.stripeSubscriptions.applyCouponToSubscription,
  );
  const currentPeriodEnd = new Date(
    subscription?.currentPeriodEnd ?? Date.now(),
  );
  const subPromoCode = subscription?.promoCode;
  const canceledAt =
    subscription?.canceledAt !== undefined && subscription?.canceledAt;

  const isCancelled = subscription?.status === "cancelled";
  // const cancelAtTime = new Date(subscription?.cancelAt ?? Date.now());
  const cancelAtTime = subscription?.cancelAt
    ? new Date(subscription.cancelAt)
    : undefined;

  let interval: string | undefined;
  // let nextInterval: string | undefined
  let nextAmount: string | undefined;

  // if (subscription?.intervalNext !== undefined) {
  //   // intervalNext exists
  //   nextInterval = subscription.intervalNext
  // }
  if (subscription?.amountNext !== undefined) {
    // amountNext exists
    nextAmount = (subscription.amountNext! / 100).toFixed(0);
    interval = subscription.interval;
  }

  const handleManageSubscription = async () => {
    let url: string | undefined;
    const newTab = window.open("about:blank");

    if (!subscription?.customerId) {
      toast.error(
        "No membership found. Please contact support if this is incorrect.",
      );
      return;
    }

    try {
      const result = await getDashboardUrl({
        customerId: subscription.customerId,
      });
      if (result?.url) {
        // window.location.href = result.url;
        url = result.url;
      }
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
      if (!newTab?.closed) {
        newTab?.document.close();
      }
      if (err instanceof ConvexError) {
        toast.error(
          typeof err.data === "string" &&
            err.data.toLowerCase().includes("no such customer")
            ? "Your account was cancelled. Contact support for assistance."
            : err.data || "An unexpected error occurred.",
        );
      } else if (err instanceof Error) {
        toast.error(
          typeof err.message === "string" &&
            err.message.toLowerCase().includes("no such customer")
            ? "Your account was cancelled. Contact support for assistance."
            : err.message || "An unexpected error occurred.",
        );
      } else {
        toast.error("An unknown error occurred.");
      }
      return;
    }
  };

  const handleApplyCoupon = async () => {
    if (!promoCode) return;
    if (promoAttempts >= 5) {
      toast.error(
        "You have exceeded the maximum number of coupon attempts. Try again later.",
      );
      setPromoCode("");
      return;
    }
    try {
      await applyCoupon({ couponCode: promoCode });
      toast.success("Coupon applied successfully");
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(
          typeof err.data === "string" &&
            err.data.includes("Invalid or expired coupon code")
            ? "Code is invalid or expired. Contact support if you believe this is an error."
            : err.data.includes("Subscription already has a discount applied.")
              ? "You already have a discount applied."
              : err.data || "An unexpected error occurred.",
        );
      } else if (err instanceof Error) {
        toast.error(
          typeof err.message === "string" &&
            err.message.includes("Invalid or expired coupon code")
            ? "Code is invalid or expired. Contact support if you believe this is an error."
            : err.message.includes(
                  " This promotion code cannot be redeemed on a subscription update because it uses the `minimum_amount` restriction and the amount may change.",
                )
              ? "This code can only be applied to one-time purchases, not subscriptions."
              : "An unexpected error occurred.",
        );
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setPromoCode("");
      setPromoAttempts((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Membership Overview
        </h1>
        <p className="mt-2 text-foreground">
          Manage your membership, update your billing information, or cancel
          your subscription.
        </p>
      </div>

      {/* Account Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Details Card */}
        <div className="flex flex-col gap-6">
          <Button
            className="mt-3 w-full"
            onClick={handleManageSubscription}
            variant="salWithShadow"
          >
            Manage Membership
          </Button>
          {!subPromoCode && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyCoupon();
              }}
              className="space-y-2"
            >
              <p>Have a promo code? Enter it below:</p>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Enter Promo Code"
                  value={promoCode}
                  disabled={promoAttempts >= 5}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 uppercase placeholder:normal-case"
                />
                {promoCode && promoCode.trim().length > 3 && (
                  <Button
                    type="submit"
                    variant="salWithShadowHidden"
                    className="w-fit"
                    disabled={promoAttempts >= 5}
                  >
                    Apply Promo Code
                  </Button>
                )}
              </div>
            </form>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Membership Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!subscription ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[170px]" />
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">
                      {subscription?.status === "active" ? (
                        <span className="rounded bg-green-100 px-3 py-1 font-medium text-green-700">
                          Active
                        </span>
                      ) : subscription?.status === "past_due" ? (
                        <span className="rounded bg-red-100 px-3 py-1 font-medium text-red-700">
                          Past Due
                        </span>
                      ) : subscription?.status === "unpaid" ? (
                        <span className="rounded bg-yellow-100 px-3 py-1 font-medium text-yellow-700">
                          Unpaid
                        </span>
                      ) : subscription?.status === "trialing" ? (
                        <span className="rounded bg-yellow-100 px-3 py-1 font-medium text-yellow-700">
                          2 Week Free Trial
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-3 py-1 font-medium text-gray-700">
                          No Plan
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="mt-0 flex items-start justify-between">
                    <span className="whitespace-nowrap text-muted-foreground">
                      Plan Amount:
                    </span>
                    <span className="flex flex-col items-end justify-start font-medium">
                      <span className="flex items-center gap-2">
                        $
                        {subscription?.amount
                          ? (subscription.amount / 100).toFixed(0)
                          : 0}
                        <p
                          className={
                            cn(
                              subscription?.discount &&
                                "text-red-600 line-through",
                            ) || ""
                          }
                        >
                          {subscription?.discount && (
                            <>${(subscription.discount / 100).toFixed(0)}</>
                          )}
                        </p>
                      </span>
                      {nextAmount !== undefined && (
                        <>
                          <span className="text-sm font-light italic text-gray-400">
                            {" "}
                            {/* (${(nextAmount! / 100).toFixed(0)} starting ) */}
                            (${nextAmount}/{interval} starting{" "}
                            {format(currentPeriodEnd, "MMM do yyyy")})
                          </span>
                          <span className="mt-1 text-balance text-end text-sm font-light italic text-gray-400">
                            Can be changed before start date via the{" "}
                            <a
                              href="#"
                              className="font-normal text-foreground/70 underline"
                              onClick={handleManageSubscription}
                            >
                              Manage Membership
                            </a>{" "}
                            page
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Account Interval:
                    </span>
                    <span className="font-medium capitalize">
                      {subscription?.interval + "ly"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto Renew:</span>
                    <span className="font-medium">
                      {isCancelled
                        ? "-"
                        : subscription?.cancelAtPeriodEnd
                          ? "No"
                          : "Yes"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {!cancelAtTime && (
                      <>
                        <span className="text-muted-foreground">
                          Next Due Date:
                        </span>
                        <span className="font-medium">
                          {isCancelled
                            ? "Cancelled"
                            : format(currentPeriodEnd, "MMM do, yyyy")}
                        </span>
                      </>
                    )}
                    {cancelAtTime && !isCancelled && (
                      <>
                        <span className="text-muted-foreground">
                          Cancels on:
                        </span>
                        <span className="font-medium text-red-500">
                          {format(cancelAtTime, "MMM do, yyyy")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {isCancelled ? "Account Created:" : "Member Since:"}
                    </span>
                    <span className="font-medium">
                      {subscription?.startedAt
                        ? format(
                            new Date(subscription.startedAt),
                            "MMM do, yyyy",
                          )
                        : "No Membership"}
                    </span>
                  </div>
                  {/* {!canceledAt ? (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Last Updated:</span>
                      <span className='font-medium'>
                        {subscription?.lastEditedAt
                          ? format(
                              new Date(subscription.lastEditedAt),
                              "MMM do, yyyy @ h:mm a"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  ) :  */}
                  {canceledAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Cancellation Date:
                      </span>
                      <span className="font-medium text-red-500">
                        {subscription?.canceledAt
                          ? format(
                              new Date(subscription.canceledAt),
                              "MMM do, yyyy @ h:mm a",
                            )
                          : "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
