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
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { usePreloadedQuery, useQuery } from "convex/react";

type SwitchProps = {
  onSwitchAction: (value: string) => void;
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

export default function OrganizerPricing({ currency }: PricingProps) {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const { fontSize } = userPref ?? {};
  const fontSizePref = getUserFontSizePref(fontSize);
  const baseFontSize = fontSizePref?.body;

  const [hasOpenCall, setHasOpenCall] = useState<boolean>(true);

  const toggleOpenCall = (value: string) =>
    setHasOpenCall(parseInt(value) === 0);

  const orgPlans = useQuery(api.plans.getOrgPlans);

  if (!orgPlans) return <div className="h-screen w-screen bg-background" />;

  return (
    <PricingContainer>
      <>
        <PricingHeader
          title="Do you have an open call?"
          subtitle={
            hasOpenCall ? (
              <p>
                Graffiti jams and low-budget calls are always free to list and
                mural projects are priced on a sliding scale. See{" "}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col justify-center gap-y-12 md:flex-row md:gap-10 lg:mt-14 3xl:mt-16"
        >
          {orgPlans &&
            orgPlans
              .filter((plan) =>
                hasOpenCall ? Number(plan.key) > 1 : Number(plan.key) === 1,
              )
              .sort((a, b) => Number(a.key) - Number(b.key))
              .map((plan) => {
                const { key, prices, ...rest } = plan;

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
                    accountType="organizer"
                    prices={normalizedPrices}
                  />
                );
              })}
        </motion.div>
      </>
    </PricingContainer>
  );
}
