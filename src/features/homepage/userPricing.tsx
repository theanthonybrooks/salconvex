"use client";

import type { PricingProps } from "@/features/pricing/components/pricingComponents";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Link } from "@/components/ui/custom-link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PricingCard,
  PricingContainer,
  PricingHeader,
} from "@/features/pricing/components/pricingComponents";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getPrice } from "@/helpers/pricingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { usePreloadedQuery, useQuery } from "convex/react";

type SwitchProps = {
  onSwitchAction: (value: string) => void;
};

const pricingIntervals = [
  { name: "Monthly", val: "0" },
  { name: "Yearly", val: "1" },
];

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
              className={cn("relative z-10")}
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

//--------------------- Pricing Section  ----------------------//

export default function UserPricing({ currency }: PricingProps) {
  // useScrollToTopOnMount();

  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const { user } = userData ?? {};
  const {
    hasActiveSubscription: hasSub,
    subscription,
    hadTrial,
  } = subData ?? {};

  const bannedSub = subscription?.banned;
  const subInterval = subscription?.intervalNext ?? subscription?.interval;
  const [isYearly, setIsYearly] = useState<boolean>(subInterval === "year");

  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);

  const plans = useQuery(api.plans.getUserPlans, !bannedSub ? {} : "skip");

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

  if (!plans) return <div className="h-screen w-screen bg-background" />;

  return (
    <PricingContainer>
      <>
        {!hasSub && (
          <>
            <PricingHeader
              title="Choose Your Plan"
              subtitle="All plans include a 14-day free trial."
            />
            <PricingSwitch onSwitchAction={togglePricingPeriod} />
          </>
        )}
        {hasSub && (
          <>
            <PricingHeader
              title="Your Plan"
              subtitle="Manage your plan or payment method at any time."
            />
            <PricingSwitch onSwitchAction={togglePricingPeriod} />
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col justify-center gap-y-12 lg:mt-14 lg:flex-row lg:gap-10 3xl:mt-16"
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
                  accountType="artist"
                  stripePriceId={stripePriceId}
                  stripeProductId={plan.stripeProductId}
                  hadTrial={hadTrial}
                  subscription={subscription}
                  activeSub={hasSub}
                />
              );
            })}
        </motion.div>

        {hasSub && (
          <p className="mx-auto w-full max-w-[90vw] pb-3 pt-9 sm:text-center">
            If you would like to change your plan, you can do so by clicking the
            desired plan above and updating your membership via Stripe.
          </p>
        )}
      </>
    </PricingContainer>
  );
}
