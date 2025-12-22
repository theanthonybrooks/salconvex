"use client";

import { User } from "@/types/user";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useManageSubscription } from "@/hooks/use-manage-subscription";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { CheckCircle2, CircleX, LoaderCircle } from "lucide-react";

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
import { Link } from "@/components/ui/custom-link";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccountSubscribeForm,
  ModeType,
} from "@/features/account/account-profile-form";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getPrice } from "@/helpers/pricingFns";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { useUserInfo } from "@/providers/user-info-provider";

import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";
import { AccountTypeBase } from "~/convex/schema";
import { useAction, usePreloadedQuery, useQuery } from "convex/react";

export type UserCurrenciesType = "usd" | "eur";

type SwitchProps = {
  onSwitchAction: (value: string) => void;
};

type PricingCardProps = {
  user?: User;
  currency: UserCurrenciesType;
  isYearly?: boolean;
  title: string;
  planKey: string;
  accountType: string;

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

// const pricingRange = [
//   { value: 1, label: "Up to $5K" },
//   { value: 33, label: "$10K" },
//   { value: 66, label: "$20K" },
//   { value: 100, label: "$25K+" },
// ];

const pricingIntervals = [
  { name: "Monthly", val: "0" },
  { name: "Yearly", val: "1" },
];

//--------------------- Existing Subscription  ----------------------//

// const ExistingSubscription = ({ onClick }: { onClick: () => void }) => {
//   return (
//     <div className="mt-[1rem] flex w-full flex-col items-center justify-center gap-y-6 p-3">
//       <div className="flex flex-col items-center">
//         <p className="font-tanker text-[2.5em] lowercase tracking-wide text-foreground lg:text-[4em]">
//           Your Membership
//         </p>
//         <p className="text-balance text-center">
//           Want to upgrade or cancel your membership?
//         </p>
//       </div>

//       <Button variant="salWithShadow" onClick={onClick}>
//         Manage Membership
//       </Button>
//     </div>
//   );
// };

//--------------------- Pricing Header  ----------------------//

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: React.ReactNode;
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

//------------------- Pricing Switch -----------------------//

export const PricingSwitch = ({ onSwitchAction }: SwitchProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3">
      <Tabs
        defaultValue="0"
        className="relative w-[400px]"
        onValueChange={(val) => {
          onSwitchAction(val);
          setActiveTab(val);
        }}
      >
        <TabsList className="relative flex h-12 w-full justify-around bg-white/70">
          {pricingIntervals.map((opt) => (
            <TabsTrigger
              key={opt.val}
              value={opt.val}
              className={cn(
                "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium",
                activeTab === opt.val
                  ? "font-bold text-black"
                  : "text-foreground/80",
              )}
            >
              {hasMounted && activeTab === opt.val && (
                <motion.div
                  exit={{ opacity: 0 }}
                  layoutId="tab-bg"
                  className="absolute inset-0 z-0 flex items-center justify-center rounded-md border-2 bg-background shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="z-10"> {opt.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
export const OpenCallSwitch = ({ onSwitchAction }: SwitchProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const [hasMounted, setHasMounted] = useState(false);
  const ocOptions = [
    { name: "Yes", val: "0" },
    { name: "No", val: "1" },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3">
      <Tabs
        defaultValue="0"
        className="relative w-[400px]"
        onValueChange={(val) => {
          onSwitchAction(val);
          setActiveTab(val);
        }}
      >
        <TabsList className="relative flex h-12 w-full justify-around rounded-xl bg-white/70">
          {ocOptions.map((opt) => (
            <TabsTrigger
              key={opt.val}
              value={opt.val}
              className={cn(
                "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium",
                activeTab === opt.val
                  ? "font-bold text-black"
                  : "text-foreground/80",
              )}
            >
              {hasMounted && activeTab === opt.val && (
                <motion.div
                  exit={{ opacity: 0 }}
                  layoutId="tab-bg"
                  className="absolute inset-0 z-0 flex items-center justify-center rounded-md border-2 bg-background shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="z-10"> {opt.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

// -------------------- Type Switch -----------------------//

export const AccountTypeSwitch = ({
  isArtist,
  setSelectedAccountTypeAction,
  orgAccount,
  // selectedAccountType,
  setIsYearlyAction,
  hasSub,
}: {
  isArtist: boolean;
  setSelectedAccountTypeAction: (value: AccountTypeBase) => void;
  selectedAccountType: string;
  orgAccount: boolean;
  setIsYearlyAction: (value: boolean) => void;
  hasSub: boolean;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type");

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
            if (typeParam) router.replace("/pricing");
            setSelectedAccountTypeAction(isArtist ? "organizer" : "artist");
            if (!hasSub) setIsYearlyAction(false);
            // window.scrollTo({ top: 0, behavior: "smooth" });
            // const firstCard = document.querySelector(".pricing-card");
            // if (firstCard) {
            //   const yOffset = -100;
            //   const y =
            //     firstCard.getBoundingClientRect().top +
            //     window.pageYOffset +
            //     yOffset;
            //   window.scrollTo({ top: y, behavior: "auto" });
            // }
            const target = document.querySelector(".pricing-card");
            if (target) {
              const rect = target.getBoundingClientRect();
              const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
              const elementTop = rect.top + scrollTop;
              const elementHeight = rect.height;
              const viewportHeight = window.innerHeight;

              const scrollTo =
                elementTop - viewportHeight / 2 + elementHeight / 2;

              window.scrollTo({
                top: scrollTo,
                behavior: "auto",
              });
            }
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

const PricingCard = ({
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
  // const userInterval = subscription?.interval;
  // const sameInterval =
  //   (isYearly && userInterval === "year") ||
  //   (!isYearly && userInterval === "month");
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
      toast.success("Forwarding to Stripe...");
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
      toast.error("Failed to redirect. Please contact support");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card
      id={`pricing-card-${title}`}
      className={cn(
        "pricing-card mx-auto flex w-full max-w-sm flex-col justify-between border-2 px-2 py-1 transition-opacity duration-200 ease-in-out lg:mx-0",
        {
          relative: popular || isFree || isCurrentUserPlan,
        },
        activeSub && isCurrentUserPlan && "ring-8 ring-salPink",
        // activeSub &&
        //   !isCurrentUserPlan &&
        //   sameInterval &&
        // "ring-2 ring-salPink ring-offset-1",
        //   `scale-90 transition-transform duration-500 ease-in-out hover:translate-x-0 hover:scale-100 ${cardIndex === 0 ? "sm:translate-x-5" : cardIndex === numberOfCards - 1 ? "sm:-translate-x-5" : ""}`,
        isOrganizer && "self-start",
        isCurrentUserPlan && "border-3",
        className,
        // isFree && "self-start",
      )}
    >
      {popular && !activeSub && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-3 py-1">
          <p className="text-sm font-medium text-foreground">Recommended</p>
        </div>
      )}
      {isCurrentUserPlan && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-4 py-2">
          <p className="text-sm font-medium text-foreground">Current Plan</p>
        </div>
      )}
      {isFree && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-3 py-1">
          <p className="text-sm font-medium text-foreground">Free Listing</p>
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
            // console.log("stripeId and currency", stripePriceId, currency);

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
            className={cn("h-14 w-full text-lg sm:h-11 sm:text-base")}
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

//--------------------- Pricing Section  ----------------------//

export default function Pricing() {
  // useScrollToTopOnMount();
  const { currency: userCurrency } = useUserInfo();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as AccountTypeBase;
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const {
    hasActiveSubscription: hasSub,
    subscription,
    hadTrial,
  } = subData ?? {};
  const { fontSize, currency: userPrefCurrency } = userPref ?? {};
  const fontSizePref = getUserFontSizePref(fontSize);
  const baseFontSize = fontSizePref?.body;
  const currencySource = hasSub
    ? (userPrefCurrency ?? userCurrency)
    : userCurrency;

  const currency = (
    currencySource ?? "usd"
  ).toLowerCase() as UserCurrenciesType;

  const bannedSub = subscription?.banned;
  const subInterval = subscription?.intervalNext ?? subscription?.interval;

  const [urlAccountType, setUrlAccountType] = useState<AccountTypeBase | null>(
    null,
  );
  const userAccountTypes = user?.accountType ?? urlAccountType ?? [];
  const accountType = typeParam ?? user?.accountType[0] ?? "artist";
  const [isYearly, setIsYearly] = useState<boolean>(subInterval === "year");
  const [hasOpenCall, setHasOpenCall] = useState<boolean>(true);
  const [selectedAccountType, setSelectedAccountType] = useState(accountType);

  // const multiType = userAccountTypes.length > 1

  const isAdmin = user?.role?.includes("admin");

  const isArtist = selectedAccountType === "artist";
  const isOrganizer = selectedAccountType === "organizer";
  const orgAccountType = userAccountTypes.includes("organizer");

  useEffect(() => {
    const hasSubmitParam = searchParams.has("submit");
    const hash = window?.location?.hash;
    const hasSubmitHash = hash === "#submit";

    if (hasSubmitParam || hasSubmitHash) {
      setSelectedAccountType("organizer");
      setUrlAccountType("organizer");
    } else {
      setUrlAccountType(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) return;
    setSelectedAccountType("artist");
    setIsYearly(false);
  }, [user, subscription]);

  // useEffect(() => {
  //   if (!isArtist) return;
  //   if (!hasSub) {
  //     setIsYearly(false);
  //   } else {
  //     setIsYearly(subInterval === "year");
  //   }
  // }, [subInterval, hasSub, isArtist]);

  // useEffect(() => setSelectedAccountType(accountType), [accountType]);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);
  const toggleOpenCall = (value: string) =>
    setHasOpenCall(parseInt(value) === 0);

  const plans = useQuery(api.plans.getUserPlans, !bannedSub ? {} : "skip");
  const orgPlans = useQuery(api.plans.getOrgPlans, !bannedSub ? {} : "skip");

  console.log(currency);

  if (bannedSub)
    return (
      <div className="my-20 flex flex-col items-center">
        <p className="font-tanker text-[2.5em] lowercase tracking-wide text-foreground lg:text-[4em]">
          Your Membership Has Been Canceled
        </p>
        <p className="text-center text-lg font-semibold">
          For more information and/or to reinstate your membership,{" "}
          <Link
            href="/support?reason=account"
            className="!text-lg font-semibold underline underline-offset-2"
          >
            contact support
          </Link>
        </p>
      </div>
    );

  if (!plans || !orgPlans)
    return <div className="h-screen w-screen bg-background" />;

  // console.log(isArtist, hasSub, isOrganizer, orgAccountType);
  return (
    <section id="plans" className="price-card-cont px-4 pt-6">
      <div className="mx-auto max-w-7xl">
        {/* {isAdmin && <ExistingSubscription onClick={handleManageSubscription} />} */}
        {isArtist && !hasSub && (
          <>
            <PricingHeader
              title="Choose Your Plan"
              subtitle="All plans include a 14-day free trial."
            />
            <PricingSwitch onSwitchAction={togglePricingPeriod} />
          </>
        )}
        {isArtist && hasSub && (
          <>
            <PricingHeader
              title="Your Plan"
              subtitle="Manage your plan or payment method at any time."
            />
            <PricingSwitch onSwitchAction={togglePricingPeriod} />
          </>
        )}

        {isOrganizer && (
          <>
            <PricingHeader
              title="Do you have an open call?"
              subtitle={
                hasOpenCall ? (
                  <p>
                    Graffiti jams and low-budget calls are always free to list
                    and mural projects are priced on a sliding scale. See{" "}
                    <Link
                      href="/submit#submission-costs"
                      className="font-semibold underline underline-offset-2"
                      fontSize={baseFontSize}
                    >
                      Pricing FAQ
                    </Link>{" "}
                    for more info.
                  </p>
                ) : (
                  "All event-only listings (without open call) are free. You can always add an open call later."
                )
              }
            />
            <OpenCallSwitch onSwitchAction={toggleOpenCall} />
          </>
        )}

        {(isArtist && !hasSub) ||
        (isAdmin && !isOrganizer) ||
        (isArtist && hasSub) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col justify-center gap-y-6 lg:flex-row lg:gap-10 3xl:mt-16"
          >
            {[...plans]

              .sort((a, b) => {
                const priceA = isYearly
                  ? (getPrice(a.prices.year, currency)?.amount ?? Infinity)
                  : (getPrice(a.prices.month, currency)?.amount ?? Infinity);

                const priceB = isYearly
                  ? (getPrice(b.prices.year, currency)?.amount ?? Infinity)
                  : (getPrice(b.prices.month, currency)?.amount ?? Infinity);

                return priceA - priceB;
              })

              .map((plan) => {
                const stripePriceId = isYearly
                  ? getPrice(plan.prices.year, currency)?.stripeId
                  : getPrice(plan.prices.month, currency)?.stripeId;

                const { key, ...rest } = plan;
                return (
                  <PricingCard
                    currency={currency}
                    image={plan.img}
                    key={plan.title}
                    user={user}
                    planKey={key}
                    {...rest}
                    isYearly={isYearly}
                    accountType={selectedAccountType}
                    stripePriceId={stripePriceId}
                    stripeProductId={plan.stripeProductId}
                    hadTrial={hadTrial}
                    subscription={subscription}
                    activeSub={hasSub}
                  />
                );
              })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col justify-center gap-y-6 md:flex-row md:gap-10 3xl:mt-16"
          >
            {orgPlans &&
              orgPlans
                .filter((plan) =>
                  hasOpenCall ? Number(plan.key) > 1 : Number(plan.key) === 1,
                )
                .sort((a, b) => Number(a.key) - Number(b.key))
                .map((plan) => {
                  const { key, prices, ...rest } = plan;
                  // console.log(plan);

                  const normalizedPrices = {
                    month: undefined,
                    year: undefined,
                    rate: prices?.rate ?? 0,
                  };
                  return (
                    <PricingCard
                      currency={currency}
                      key={plan.title}
                      user={user}
                      planKey={key}
                      {...rest}
                      accountType={selectedAccountType}
                      prices={normalizedPrices}
                    />
                  );
                })}
          </motion.div>
        )}
        {isArtist && hasSub && (
          <p className="mx-auto w-full max-w-[90vw] pb-3 pt-9 sm:text-center">
            If you would like to change your plan, you can do so by clicking the
            desired plan above and updating your membership via Stripe.
          </p>
        )}

        <AccountTypeSwitch
          isArtist={isArtist}
          setSelectedAccountTypeAction={setSelectedAccountType}
          selectedAccountType={selectedAccountType}
          orgAccount={orgAccountType}
          setIsYearlyAction={setIsYearly}
          hasSub={hasSub}
        />

        {/* {isOrganizer && (
          <div className='flex flex-col gap-2 text-sm max-w-[60%] mx-auto text-pretty mt-6'>
            <p className='font-bold'>NOTE:</p>
            <p className='w-fit'>
              If you&apos;re unable to pay a listing fee due to financial
              reasons, you can submit your project as a free open call. We
              understand that budgets can be tight and though this site takes a
              lot of work to build/maintain, we do understand that it&apos;s not
              always possible to pay. All submissions are reviewed and subject
              to approval prior to listing.
            </p>
          </div>
        )} */}
      </div>
    </section>
  );
}
