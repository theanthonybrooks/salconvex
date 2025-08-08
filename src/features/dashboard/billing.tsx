"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction, usePreloadedQuery } from "convex/react";
import { format } from "date-fns";

import { CanceledBanner } from "@/components/ui/canceled-banner";
import ConfettiBlast from "@/components/ui/confetti";
import { ConfirmDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { ConvexError } from "convex/values";
import { CircleCheck, CreditCard, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

export default function BillingPage() {
  // const userData = useQuery(api.users.getCurrentUser, {})
  // const user = userData?.user // This avoids destructuring null or undefined
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { subscription, hasActiveSubscription } = subData;
  const [promoCode, setPromoCode] = useState("");
  const [promoAttempts, setPromoAttempts] = useState(0);

  const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl);
  const applyCoupon = useAction(
    api.stripeSubscriptions.applyCouponToSubscription,
  );
  const deleteCoupon = useAction(
    api.stripeSubscriptions.deleteCouponFromSubscription,
  );
  const currentPeriodEnd = new Date(
    subscription?.currentPeriodEnd ?? Date.now(),
  );
  const subPromoCode = subscription?.promoCode;
  const canceledAt =
    subscription?.canceledAt !== undefined && subscription?.canceledAt;

  const isCanceled = subscription?.status === "canceled";
  // const cancelAtTime = new Date(subscription?.cancelAt ?? Date.now());
  const cancelAtTime = subscription?.cancelAt
    ? new Date(subscription.cancelAt)
    : undefined;
  const now = new Date();

  const currentlyCanceled = cancelAtTime && cancelAtTime < now;

  const subStatus = subscription?.status ?? "none";

  let interval: string | undefined;
  let nextInterval: string | undefined;
  let nextAmount: string | undefined;
  const discountDuration = subscription?.discountDuration;
  const oneTime = discountDuration === "once";
  const subAmount =
    typeof subscription?.amount === "number" ? subscription.amount / 100 : 0;
  const hasDiscountAmt = typeof subscription?.discountAmount === "number";
  const hasDiscountPercent = typeof subscription?.discountPercent === "number";
  const hasDiscount = hasDiscountAmt || hasDiscountPercent;
  const discountAmt =
    typeof subscription?.discountAmount === "number"
      ? subscription.discountAmount / 100
      : 0;
  const discountPercent =
    typeof subscription?.discountPercent === "number"
      ? subscription.discountPercent / 100
      : 0;

  // console.log("subAmount: ", subAmount);
  // console.log("discountAmt: ", discountAmt);
  // console.log("discountPercent: ", discountPercent);

  // console.log("intervals: ", interval, nextInterval);

  // if (subscription?.intervalNext !== undefined) {
  //   // intervalNext exists
  //   nextInterval = subscription.intervalNext
  // }
  if (subscription?.amountNext !== undefined) {
    // amountNext exists
    nextAmount = (subscription.amountNext! / 100).toFixed(0);
    interval = subscription.interval;
    nextInterval = subscription.intervalNext;
  } else {
    interval = subscription?.interval;
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

    if (currentlyCanceled) {
      router.push("/pricing#plans");
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
      // toast.success("Coupon applied successfully");
      setShowConfetti(true);
    } catch (err) {
      setPromoAttempts((prev) => prev + 1);
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
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const onCancelPromoCode = () => {
    try {
      if (!subscription?.stripeId) {
        toast.error("No active subscription found");
        return;
      }
      deleteCoupon({ subscriptionId: subscription.stripeId });
    } catch (err) {
      console.error("Error deleting coupon:", err);
    } finally {
      setPromoCode("");
    }
  };

  return (
    <div className="flex w-max max-w-[100dvw] flex-col gap-6 p-6">
      {showConfetti && <ConfettiBlast active={showConfetti} />}
      <CanceledBanner activeSub={hasActiveSubscription} subStatus={subStatus} />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Membership Overview
        </h1>
        <p className="mt-2 text-foreground sm:text-sm">
          Manage/cancel your membership or update your billing information.
        </p>
      </div>
      {subStatus === "past_due" && (
        <span className="mt-2 flex items-center gap-4 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-sm text-red-600">
          <FaExclamationTriangle className="color-red-600 size-10 shrink-0" />
          There was a problem with your last payment. Please update your payment
          method to resume access to the full membership features.
        </span>
      )}

      {/* Account Information Grid */}
      {typeof subStatus === "string" && (
        <div className="grid gap-6">
          {/* Subscription Details Card */}
          <div className="flex flex-col gap-6">
            <Button
              className="mt-3 w-full max-w-lg"
              onClick={handleManageSubscription}
              variant="salWithShadow"
            >
              {subStatus === "past_due" || (isCanceled && !currentlyCanceled)
                ? "Resume Membership"
                : isCanceled
                  ? "Choose Plan"
                  : "Manage Membership"}
            </Button>
            {hasActiveSubscription && (
              <>
                {!subPromoCode ? (
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
                      {promoAttempts > 5 && (
                        <p className="text-sm italic text-red-600">
                          You have exceeded the maximum number of coupon
                          attempts. Try again later.
                        </p>
                      )}
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
                ) : (
                  <div className="flex items-center justify-center gap-1 rounded-lg border-2 border-dotted border-foreground/70 bg-green-600/10 px-3 py-2 sm:gap-2">
                    <CircleCheck className="size-7 shrink-0 text-emerald-600 sm:size-5" />
                    <p className="text-center text-sm italic">
                      A <strong>{subPromoCode}</strong> code has been applied to
                      your subscription.{" "}
                    </p>

                    <TooltipSimple content="Delete Promo Code" side="top">
                      <X
                        className="hidden size-7 shrink-0 cursor-pointer text-red-600 hover:scale-110 active:scale-95 sm:block sm:size-5"
                        onClick={() => setConfirmDialogOpen(true)}
                      />
                    </TooltipSimple>
                    {confirmDialogOpen && (
                      <ConfirmDialog
                        label="Delete Promo Code"
                        description="Are you sure you want to delete this promo code? You may not be able to apply it again."
                        onConfirm={() => {
                          onCancelPromoCode();
                          setConfirmDialogOpen(false);
                        }}
                        onCancel={() => setConfirmDialogOpen(false)}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5" />
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
                        ) : subscription?.status === "canceled" ? (
                          <span className="rounded bg-red-100 px-3 py-1 font-medium text-red-700">
                            Canceled
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
                          {hasDiscountAmt
                            ? subAmount - discountAmt
                            : hasDiscountPercent
                              ? subAmount - subAmount * discountPercent
                              : subAmount.toFixed(0)}
                          {/* {subscription?.amount
                            ? (subscription.amount / 100).toFixed(0)
                            : 0} */}
                          <p
                            className={
                              cn(hasDiscount && "text-red-600 line-through") ||
                              ""
                            }
                          >
                            {hasDiscount && subAmount.toFixed(0)}
                          </p>
                        </span>
                        {nextAmount !== undefined && (
                          <>
                            <span className="text-sm font-light italic text-gray-400">
                              {" "}
                              {/* (${(nextAmount! / 100).toFixed(0)} starting ) */}
                              (${nextAmount}/{nextInterval ?? interval} starting{" "}
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
                    {oneTime && !isCanceled && (
                      <span className="mt-2 w-full items-center gap-3 rounded-lg border border-dashed border-foreground/30 bg-salYellowLt/30 p-2 text-sm font-light italic text-foreground/50 sm:inline-flex">
                        <Info className="size-5 shrink-0 text-sm text-foreground/50 [@media(max-width:768px)]:hidden" />
                        This discount will expire in one{" "}
                        {nextInterval ?? interval} and your membership price
                        will return to the original price.
                      </span>
                    )}

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
                        {isCanceled || !subscription
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
                            {isCanceled
                              ? "Canceled"
                              : format(currentPeriodEnd, "MMM do, yyyy")}
                          </span>
                        </>
                      )}
                      {cancelAtTime && !isCanceled && (
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
                        {isCanceled ? "Account Created:" : "Member Since:"}
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
                      <div className="flex items-center justify-between gap-4">
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
      )}
      {typeof subStatus === undefined && (
        <span className="mt-2 flex items-center gap-4 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-sm text-red-600">
          <FaExclamationTriangle className="color-red-600 size-10 shrink-0" />
          You don&apos;t currently have a membership. Please contact support if
          this is incorrect.
        </span>
      )}
    </div>
  );
}
