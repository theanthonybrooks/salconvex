"use client";

import { Separator } from "@/components/ui/separator";
import { pricingFaqs } from "@/constants/accordions";
import { AccordionComponent } from "@/features/homepage/accordion-component";
import Pricing from "@/features/homepage/pricing";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { usePreloadedQuery } from "convex/react";

export default function PricingPage() {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);

  const userPref = userData?.userPref;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  return (
    <>
      <div className="container mx-auto">
        <Pricing />
        <Separator
          thickness={3}
          className="mx-auto my-8 w-1/2 max-w-[90vw] md:min-w-96"
        />
        <AccordionComponent fontSize={fontSize} src={pricingFaqs} />
      </div>
    </>
  );
}
