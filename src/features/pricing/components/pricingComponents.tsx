import type { ReactNode } from "react";
import { User } from "@/types/user";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useManageSubscription } from "@/hooks/use-manage-subscription";

import { CheckCircle2, CircleX, LoaderCircle } from "lucide-react";

import type { UserCurrenciesType } from "~/convex/actions/getUserInfo";
import type { FeatureMap, StripeIntervalPricesType } from "~/convex/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AccountSubscribeForm,
  ModeType,
} from "@/features/account/account-profile-form";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";
import { AccountTypeBase } from "~/convex/schema";
import { useAction, useQuery } from "convex/react";

export type PricingProps = {
  currency: UserCurrenciesType;
};

type PricingCardProps = {
  user?: User;
  currency: UserCurrenciesType;
  isYearly?: boolean;
  title: string;
  planKey: string;
  accountType: AccountTypeBase;

  prices: {
    month?: StripeIntervalPricesType;
    year?: StripeIntervalPricesType;
    rate?: number;
  };

  description: string;
  featureMap?: FeatureMap;
  features?: string[];
  notIncluded: string[];
  popular?: boolean;
  image?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  hadTrial?: boolean;
  subscription?: Doc<"userSubscriptions"> | null;
  activeSub?: boolean;
  className?: string;
};

// -------------------- Type Switch -----------------------//

export const AccountTypeSwitch = ({
  isArtist,
  orgAccount,
  hasSub,
}: {
  isArtist: boolean;
  setSelectedAccountTypeAction: (value: AccountTypeBase) => void;
  selectedAccountType: string;
  orgAccount: boolean;
  hasSub: boolean;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={cn("mt-8 flex flex-col items-center gap-4 3xl:mt-14")}>
        {isArtist ? (
          <p>
            Want to <span className="font-bold">add</span> an event/open call?
          </p>
        ) : hasSub ? (
          <p>
            Want to <span className="font-bold">manage</span> your plan?
          </p>
        ) : (
          <p>
            Want to <span className="font-bold">apply</span> to open calls?
          </p>
        )}
        <Button
          variant="salWithShadowHidden"
          size="lg"
          onClick={() => {
            router.push(isArtist ? "/submit" : "/pricing");
          }}
          className="w-fit"
        >
          {isArtist
            ? "Switch to Organizer Options"
            : hasSub
              ? orgAccount
                ? "Switch to Artist Options"
                : "View your current plan"
              : "Switch to Artist Options"}
        </Button>
      </div>
    </div>
  );
};

//--------------------- Pricing Card  ----------------------//

export const PricingCard = ({
  user,
  activeSub,
  currency,
  isYearly,
  title,
  planKey,
  prices,
  description,
  featureMap,
  features,
  notIncluded,
  popular,
  accountType,
  image,
  stripePriceId,
  subscription,
  className,
}: PricingCardProps) => {
  const [pending, setPending] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const monthlyFeatures = featureMap
    ? [...featureMap.base, ...featureMap.monthly]
    : features;
  const yearlyFeatures = featureMap
    ? [...featureMap.base, ...featureMap.yearly]
    : features;
  useEffect(() => {
    if (
      (featureMap &&
        featureMap?.base?.some((feature) => feature.includes("*"))) ||
      features?.some((feature) => feature.includes("*"))
    ) {
      setComingSoon(true);
    } else {
      setComingSoon(false);
    }
  }, [featureMap, features]);
  const isArtist = accountType === "artist";
  const isOrganizer = accountType === "organizer";
  const isFree = prices.rate === 0;
  const getCheckoutUrl = useAction(
    api.stripe.stripeSubscriptions.createStripeCheckoutSession,
  );

  const hadFreeCall = useQuery(
    api.stripe.stripeSubscriptions.getOrgHadFreeCall,
    user ? {} : "skip",
  );

  const handleManageSubscription = useManageSubscription({ subscription });

  const isEligibleForFree = (isOrganizer && hadFreeCall === false) || !user;
  const hadTrial = subscription?.hadTrial;
  const userSubPriceId = subscription?.stripePriceId;

  const isCurrentUserPlan =
    typeof stripePriceId === "string" &&
    typeof userSubPriceId === "string" &&
    stripePriceId === userSubPriceId &&
    activeSub;

  const handleCheckout = async (
    interval: "month" | "year",
    hadTrial: boolean,
  ) => {
    setPending(true);
    try {
      const { url } = await getCheckoutUrl({
        interval,
        planKey,
        hadTrial,
        currency,
      });

      if (url) {
        window.location.href = url;
      }
      showToast("success", "Forwarding to Stripe...");
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
      showToast("error", "Failed to redirect. Please contact support");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card
      id={`pricing-card-${title}`}
      className={cn(
        "pricing-card dark:bg-tab-a10 mx-auto flex w-full max-w-sm flex-col justify-between border-2 px-2 py-1 transition-opacity duration-200 ease-in-out lg:mx-0",
        {
          relative: popular || isFree || isCurrentUserPlan,
        },
        activeSub && isCurrentUserPlan && "ring-8 ring-salPink",
        isOrganizer && "self-start",
        isCurrentUserPlan && "border-3",
        className,
      )}
    >
      {popular && !activeSub && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-3 py-1">
          <p className="text-sm font-medium text-foreground dark:text-primary-foreground">
            Recommended
          </p>
        </div>
      )}
      {isCurrentUserPlan && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-4 py-2">
          <p className="text-sm font-medium text-foreground dark:text-primary-foreground">
            Current Plan
          </p>
        </div>
      )}
      {isFree && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-3 py-1">
          <p className="text-sm font-medium text-foreground dark:text-primary-foreground">
            Free Listing
          </p>
        </div>
      )}

      <div>
        <CardHeader className="space-y-2 pb-4">
          {image && (
            <Image
              src={image}
              alt={title}
              width={200}
              height={200}
              className="h-auto w-full"
            />
          )}
          {!image && (
            <>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className={cn("text-foreground")}>
                {description}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <Separator className="mb-4" thickness={2} />

        <CardContent className="pb-4">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-4xl font-bold")}>
              {!isFree ? (
                isArtist ? (
                  `${currency === "usd" ? "$" : ""}${
                    isYearly
                      ? ((prices.year?.usd?.amount ?? 0).toFixed(0) ?? "N/A")
                      : (prices.month?.usd?.amount?.toFixed(0) ?? "N/A")
                  }${currency === "eur" ? "€" : ""}`
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Starting at</p>
                    <span className="flex items-center gap-1">
                      <span
                        className={cn(
                          "mr-1",
                          isEligibleForFree && "line-through",
                        )}
                      >
                        {currency === "usd" ? "$" : ""}50
                        {currency === "eur" ? "€" : ""}
                      </span>

                      {isEligibleForFree && (
                        <span className="font-semibold text-green-600">
                          {currency === "usd" ? "$" : ""}0
                          {currency === "eur" ? "€" : ""}
                        </span>
                      )}
                    </span>
                  </div>
                )
              ) : (
                "Free"
              )}
            </span>

            <span className={cn("text-muted-foreground")}>
              {isArtist && (isYearly ? "/year" : "/month")}
            </span>
          </div>
          {isArtist && isYearly && (
            <p className={cn("mt-1 text-muted-foreground")}>
              ( {currency === "usd" ? "$" : ""}
              {((prices.year?.usd?.amount ?? 0) / 12).toFixed(2) ?? "N/A"}
              {currency === "eur" ? "€" : ""} per month )
            </p>
          )}
          {(!user || isEligibleForFree) && !isFree && isOrganizer && (
            <p className="mt-4 text-lg text-foreground text-green-600">
              First Open Call is free
            </p>
          )}

          <div className="mt-6 space-y-2">
            {isYearly
              ? yearlyFeatures?.map((feature) => (
                  <div key={feature} className="flex gap-2">
                    <CheckCircle2
                      className={cn("size-5 shrink-0 text-foreground")}
                    />
                    <p className={cn("text-muted-foreground")}>{feature}</p>
                  </div>
                ))
              : monthlyFeatures?.map((feature) => (
                  <div key={feature} className="flex gap-2">
                    <CheckCircle2
                      className={cn("size-5 shrink-0 text-foreground")}
                    />
                    <p className={cn("text-muted-foreground")}>{feature}</p>
                  </div>
                ))}
            {planKey === "1" &&
              isOrganizer &&
              notIncluded?.map((feature) => (
                <div key={feature} className="flex gap-2">
                  <CircleX className={cn("size-5 shrink-0 text-red-600")} />

                  <p className={cn("text-muted-foreground")}>{feature}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className={cn("flex flex-col gap-y-2")}>
        {comingSoon && (
          <p className="mt-2 w-full text-right text-sm italic text-muted-foreground">
            *Feature Coming Soon
          </p>
        )}
        {isFree && planKey === "2" && (
          <p className="mt-2 w-full text-center text-sm text-foreground">
            No application fees allowed
          </p>
        )}
        <AccountSubscribeForm
          user={user}
          mode={accountType as ModeType}
          onClick={() => {
            handleCheckout(isYearly ? "year" : "month", hadTrial ?? false);
          }}
          planKey={planKey}
          isEligibleForFree={isEligibleForFree}
          isCurrentUserPlan={isCurrentUserPlan}
        >
          <Button
            disabled={pending}
            onClick={() => {
              if (!activeSub || isCurrentUserPlan) return;
              handleManageSubscription();
            }}
            variant={
              (!activeSub && (popular || isFree)) || isCurrentUserPlan
                ? "salWithShadowPink"
                : "salWithShadowHiddenYlw"
            }
            className={cn(
              "h-14 w-full text-lg sm:h-11 sm:text-base",
              isCurrentUserPlan && "dark:hover:text-primary-foreground",
            )}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : isCurrentUserPlan && activeSub ? (
              "Update My Plan"
            ) : (
              `${isArtist ? "Get" : "List"} ${title}`
            )}
          </Button>
        </AccountSubscribeForm>
      </CardFooter>
    </Card>
  );
};

//--------------------- Pricing Header  ----------------------//

export const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: ReactNode;
}) => (
  <div
    id="pricing-header"
    className="my-6 flex flex-col items-center gap-4 text-center md:my-8 md:gap-8"
  >
    <h2 className="cursor-pointer text-balance font-tanker text-4h lowercase tracking-wide text-foreground md:text-wrap md:text-[4em]">
      {title}
    </h2>
    <span className="max-w-2xl text-balance text-foreground">{subtitle}</span>
  </div>
);

//--------------------- Pricing Container -----------------------//
export const PricingContainer = ({ children }: { children: ReactNode }) => {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 pt-8">{children}</section>
  );
};
