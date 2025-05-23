"use client";

import { Separator } from "@/components/ui/separator";
import { pricingFaqs } from "@/constants/accordions";
import { AccordionComponent } from "@/features/homepage/accordion-component";
import Pricing from "@/features/homepage/pricing";
import { useEffect } from "react";

export default function PricingPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    // console.log("hash", hash)
    if (hash !== "#plans") return;

    let attempts = 0;
    const maxAttempts = 10;
    // console.log("attempts", attempts)

    const scrollToSection = () => {
      const section = document.getElementById("plans");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        // Optional: Clear hash after scrolling
        window.history.replaceState(null, "", window.location.pathname);
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(scrollToSection);
      }
    };

    scrollToSection();
  }, []);

  return (
    <>
      <div className="container mx-auto">
        <Pricing />
        <Separator
          thickness={3}
          className="mx-auto my-8 w-1/2 max-w-[90vw] md:min-w-96"
        />
        <AccordionComponent src={pricingFaqs} />
      </div>
    </>
  );
}
