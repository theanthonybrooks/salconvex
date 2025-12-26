"use client";

import { pricingFaqs } from "@/constants/accordions";

import { useState } from "react";

import type { UserCurrenciesType } from "~/convex/actions/getUserInfo";
import type { AccountTypeBase } from "~/convex/schema";
import { Separator } from "@/components/ui/separator";
import { AccordionComponent } from "@/features/homepage/accordion-component";
import OrganizerPricing from "@/features/homepage/organizerPricing";
import UserPricing from "@/features/homepage/userPricing";
import { AccountTypeSwitch } from "@/features/pricing/components/pricingComponents";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { useUserInfo } from "@/providers/user-info-provider";

import { usePreloadedQuery } from "convex/react";

type PricingWrapperProps = {
  defaultType?: AccountTypeBase;
  page?: "pricing" | "other";
};

export const PricingWrapper = ({
  defaultType = "artist",
  page = "pricing",
}: PricingWrapperProps) => {
  const { currency: userCurrency } = useUserInfo();

  const [accountType, setAccountType] = useState<AccountTypeBase>(defaultType);
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const { userPref, user } = userData ?? {};
  const { hasActiveSubscription: hasSub } = subData ?? {};
  const { fontSize: fontSizeUserPref, currency: userPrefCurrency } =
    userPref ?? {};

  const userAccountTypes = user?.accountType ?? [];
  const orgAccountType = userAccountTypes.includes("organizer");

  const fontSizePref = getUserFontSizePref(fontSizeUserPref);
  const fontSize = fontSizePref?.body;

  const currencySource = hasSub
    ? (userPrefCurrency ?? userCurrency)
    : userCurrency;

  const currency = (
    currencySource ?? "usd"
  ).toLowerCase() as UserCurrenciesType;
  return (
    <>
      {accountType === "artist" ? (
        <UserPricing currency={currency} />
      ) : (
        <OrganizerPricing currency={currency} />
      )}
      <AccountTypeSwitch
        isArtist={accountType === "artist"}
        setSelectedAccountTypeAction={setAccountType}
        selectedAccountType={accountType}
        orgAccount={orgAccountType}
        hasSub={hasSub}
      />
      {page === "pricing" && (
        <>
          <Separator
            thickness={3}
            className="mx-auto my-8 w-1/2 max-w-[90vw] md:min-w-96"
          />
          <AccordionComponent fontSize={fontSize} src={pricingFaqs} />
        </>
      )}
    </>
  );
};
