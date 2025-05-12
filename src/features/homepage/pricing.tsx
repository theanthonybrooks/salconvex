"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAction, usePreloadedQuery } from "convex/react";

import { Separator } from "@/components/ui/separator";
import DiscreteSlider from "@/components/ui/slider";
import {
  AccountSubscribeForm,
  ModeType,
} from "@/features/account/account-profile-form";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { useManageSubscription } from "@/hooks/use-manage-subscription";
import { useScrollToTopOnMount } from "@/hooks/use-scrollToTopOnMount";
import { User } from "@/types/user";
import { useQuery } from "convex-helpers/react/cache";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "~/convex/_generated/api";

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type PricingCardProps = {
  user?: User;
  isYearly?: boolean;
  title: string;
  planKey: string;
  accountType: string;

  prices: {
    month?: { usd?: { amount: number } };
    year?: { usd?: { amount: number } };
    rate?: number;
  };

  description: string;
  features?: string[];
  popular?: boolean;
  image?: string;
};

const pricingRange = [
  { value: 1, label: "Up to $5K" },
  { value: 33, label: "$10K" },
  { value: 66, label: "$20K" },
  { value: 100, label: "$25K+" },
];

const pricingIntervals = [
  { name: "Monthly", val: "0" },
  { name: "Yearly", val: "1" },
];

//--------------------- Existing Subscription  ----------------------//

const ExistingSubscription = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="mt-[1rem] flex w-full flex-col items-center justify-center gap-y-6 p-3">
      <div className="flex flex-col items-center">
        <p className="font-tanker text-[2.5em] lowercase tracking-wide text-foreground lg:text-[4em]">
          Your Subscription
        </p>
        <p className="text-balance text-center">
          Want to upgrade or cancel your subscription?
        </p>
      </div>

      <Button variant="salWithShadow" onClick={onClick}>
        Manage Subscription
      </Button>
    </div>
  );
};

//--------------------- Pricing Header  ----------------------//

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div
    id="pricing-header"
    className="my-6 flex flex-col items-center gap-4 text-center md:my-8 md:gap-8"
  >
    <h2 className="cursor-pointer text-pretty font-tanker text-4h lowercase tracking-wide text-foreground md:text-wrap md:text-[4em]">
      {title}
    </h2>
    <p className="max-w-2xl text-balance text-foreground">{subtitle}</p>
  </div>
);

//------------------- Pricing Switch -----------------------//

export const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => {
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
          onSwitch(val);
          setActiveTab(val);
        }}
      >
        <TabsList className="relative flex h-12 w-full justify-around rounded-xl bg-white/70">
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

// -------------------- Type Switch -----------------------//

export const AccountTypeSwitch = ({
  isArtist,
  setSelectedAccountType,
  orgAccount,
  // selectedAccountType,
  setIsYearly,
  hasSub,
}: {
  isArtist: boolean;
  setSelectedAccountType: (value: string) => void;
  selectedAccountType: string;
  orgAccount: boolean;
  setIsYearly: (value: boolean) => void;
  hasSub: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={cn("mt-8 flex flex-col items-center gap-4 3xl:mt-14")}>
        {isArtist ? (
          <p>
            Want to <span className="font-bold">add</span> an event/open call?
          </p>
        ) : !hasSub ? (
          <p>
            Want to <span className="font-bold">apply</span> to open calls?
          </p>
        ) : (
          <p>
            Want to <span className="font-bold">manage</span> your plan?
          </p>
        )}
        <Button
          variant="salWithShadowHidden"
          size="lg"
          onClick={() => {
            setSelectedAccountType(isArtist ? "organizer" : "artist");
            setIsYearly(false);
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
  isYearly,
  title,
  planKey,
  prices,
  description,
  features,
  popular,
  accountType,
  image,
}: PricingCardProps) => {
  const [comingSoon, setComingSoon] = useState(false);
  useEffect(() => {
    if (features?.some((feature) => feature.includes("*"))) {
      setComingSoon(true);
    } else {
      setComingSoon(false);
    }
  }, [features]);

  const isArtist = accountType === "artist";
  const isOrganizer = accountType === "organizer";
  const isFree = prices.rate === 0;
  // const [slidingPrice, setSlidingPrice] = useState(50)
  const [sliderPrice, setSliderPrice] = useState(0);
  const getCheckoutUrl = useAction(
    api.stripeSubscriptions.createStripeCheckoutSession,
  );
  const hadTrial = useQuery(
    api.stripeSubscriptions.getUserHadTrial,
    user ? {} : "skip",
  );

  const hadFreeCall = useQuery(
    api.stripeSubscriptions.getOrgHadFreeCall,
    user ? {} : "skip",
  );

  const isEligibleForFree =
    (!isFree && isOrganizer && hadFreeCall === false) || !user;

  const slidingPrice = useMemo(() => {
    switch (sliderPrice) {
      case 1:
        return 50;
      case 33:
        return 100;
      case 66:
        return 200;
      case 100:
        return 250;
      default:
        return 50;
    }
  }, [sliderPrice]);

  const handleCheckout = async (
    interval: "month" | "year",
    hadTrial: boolean,
  ) => {
    try {
      const { url } = await getCheckoutUrl({
        interval,
        planKey,
        hadTrial,
        slidingPrice: slidingPrice,
        accountType,
        isEligibleForFree,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
    }
  };

  return (
    <Card
      id={`pricing-card-${title}`}
      className={cn(
        "pricing-card mx-auto flex w-full min-w-[20vw] max-w-sm flex-col justify-between border-2 px-2 py-1 lg:mx-0",
        {
          relative: popular || isFree,
        },
        isOrganizer && "self-start",
        // isFree && "self-start",
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full border-2 bg-salPinkLt px-3 py-1">
          <p className="text-sm font-medium text-foreground">Recommended</p>
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
              {!isFree && <CardTitle className="text-xl">{title}</CardTitle>}
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
                  `$${
                    isYearly
                      ? (prices.year?.usd?.amount?.toFixed(0) ?? "N/A")
                      : (prices.month?.usd?.amount?.toFixed(0) ?? "N/A")
                  }`
                ) : isEligibleForFree ? (
                  <span className="flex items-center gap-1">
                    <span className="mr-1 line-through">${slidingPrice}</span>
                    <span className="font-semibold text-green-600">$0</span>
                  </span>
                ) : (
                  `$${slidingPrice}`
                )
              ) : (
                "Free"
              )}
            </span>
            {/* <span className={cn("text-muted-foreground")}>
              {isOrganizer &&
                sliderPrice === 0 &&
                prices.rate !== 0 &&
                "Starting at"}
            </span> */}

            <span className={cn("text-muted-foreground")}>
              {isArtist && (isYearly ? "/year" : "/month")}
            </span>
          </div>
          {(!user || isEligibleForFree) && !isFree && isOrganizer && (
            <p className="mt-4 text-lg text-foreground text-green-600">
              First Open Call is free
            </p>
          )}
          {isOrganizer && !isFree && (
            <div className="mt-3 flex flex-col gap-2">
              <p>Select your project budget:</p>
              <DiscreteSlider
                disabled={isEligibleForFree}
                value={sliderPrice ?? prices?.rate}
                onChange={(val) => setSliderPrice(val)}
                marks={pricingRange}
                prefix="$"
                suffix="/mo"
                labelFormatter={(val) => `$${val}`}
                labelDisplay="off"
                className="mx-auto max-w-[80%]"
              />
            </div>
          )}

          <div className="mt-6 space-y-2">
            {features?.map((feature) => (
              <div key={feature} className="flex gap-2">
                <CheckCircle2
                  className={cn("size-5 shrink-0 text-foreground")}
                />
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
        <AccountSubscribeForm
          user={user}
          mode={accountType as ModeType}
          onClick={() => {
            handleCheckout(isYearly ? "year" : "month", hadTrial ?? false);
          }}
        >
          <Button
            variant={
              popular || isFree ? "salWithShadowPink" : "salWithShadowHiddenYlw"
            }
            className={cn("h-14 w-full text-lg sm:h-11 sm:text-base")}
          >
            {isArtist ? "Get" : "List"} {title}
          </Button>
        </AccountSubscribeForm>
      </CardFooter>
    </Card>
  );
};

//--------------------- Pricing Section  ----------------------//

export default function Pricing() {
  useScrollToTopOnMount();
  const searchParams = useSearchParams();
  const [isYearly, setIsYearly] = useState<boolean>(false);

  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);

  const hasSub = subData?.hasActiveSubscription;
  const subscription = subData?.subscription;
  const handleManageSubscription = useManageSubscription(subscription ?? {});

  const user = userData?.user;
  const userAccountTypes = user?.accountType ?? [];
  // const multiType = userAccountTypes.length > 1
  const [urlAccountType, setUrlAccountType] = useState<string | null>(null);
  const accountType = urlAccountType ?? user?.accountType[0] ?? "artist";
  const isAdmin = user?.role?.includes("admin");

  // if (hasSub) {
  //   accountType = "organizer"
  // }

  // console.log("accountType: ", accountType)
  const [selectedAccountType, setSelectedAccountType] = useState(accountType);
  // const userIsArtist = userAccountTypes.includes("artist")
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
    setSelectedAccountType(accountType);
  }, [accountType]);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);

  const plans = useQuery(api.plans.getUserPlans);
  const orgPlans = useQuery(api.plans.getOrgPlans);

  if (!plans || !orgPlans)
    return <div className="h-screen w-screen bg-background" />;

  // console.log(isArtist, hasSub, isOrganizer, orgAccountType);

  return (
    <section id="plans" className="price-card-cont px-4 pt-6">
      <div className="mx-auto max-w-7xl">
        {/* {isAdmin && <ExistingSubscription onClick={handleManageSubscription} />} */}
        {((isArtist && !hasSub) || (isAdmin && !isOrganizer)) && (
          <>
            <PricingHeader
              title="Choose Your Plan"
              subtitle="All plans include a 14-day free trial."
            />
            <PricingSwitch onSwitch={togglePricingPeriod} />
          </>
        )}

        {isOrganizer && (
          <PricingHeader
            title="Select your call type"
            subtitle="Graffiti jams are always free to list and mural projects are priced on a sliding scale. All event-only listings (without open call) are free."
          />
        )}

        {(isArtist && !hasSub) ||
        (isAdmin && !isOrganizer) ||
        (isArtist && hasSub && orgAccountType) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col justify-center gap-y-6 lg:flex-row lg:gap-5 3xl:mt-16"
          >
            {[...plans]
              .sort((a, b) => {
                const priceA = isYearly
                  ? (a.prices.year?.usd?.amount ?? Infinity)
                  : (a.prices.month?.usd?.amount ?? Infinity);
                const priceB = isYearly
                  ? (b.prices.year?.usd?.amount ?? Infinity)
                  : (b.prices.month?.usd?.amount ?? Infinity);
                return priceA - priceB;
              })
              .map((plan) => {
                const { key, ...rest } = plan;
                return (
                  <PricingCard
                    image={plan.img}
                    key={plan.title}
                    user={user}
                    planKey={key}
                    {...rest}
                    isYearly={isYearly}
                    accountType={selectedAccountType}
                  />
                );
              })}
          </motion.div>
        ) : isArtist && hasSub && !orgAccountType ? (
          <ExistingSubscription onClick={handleManageSubscription} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col justify-center gap-y-6 md:flex-row md:gap-8 3xl:mt-16"
          >
            {orgPlans &&
              orgPlans.map((plan) => {
                const { key, prices, ...rest } = plan;

                const normalizedPrices = {
                  month: undefined,
                  year: undefined,
                  rate: prices?.rate ?? 0,
                };
                return (
                  <PricingCard
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

        <AccountTypeSwitch
          isArtist={isArtist}
          setSelectedAccountType={setSelectedAccountType}
          selectedAccountType={selectedAccountType}
          orgAccount={orgAccountType}
          setIsYearly={setIsYearly}
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
        {/* //TODO:Add functionality that will allow artists/organizers to add other account type (prompt them) */}
      </div>
    </section>
  );
}
