"use client";

import { Link } from "@/components/ui/custom-link";
import { generalFaqs, openCallFaqs } from "@/constants/accordions";
import { infoEmail } from "@/constants/siteInfo";
import { AccordionComponent } from "@/features/homepage/accordion-component";

export default function FAQPage() {
  return (
    <>
      <div className="container mx-auto">
        <section className="mx-auto mb-12 max-w-[80vw] text-center">
          <h2 className="font-tanker text-[4em] lowercase tracking-wide text-foreground">
            FAQ
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-bold text-foreground">
            Have questions? Check out the various FAQs below or{" "}
            <Link href={`mailto:${infoEmail}&subject=Site%20Contact`}>
              contact me
            </Link>{" "}
            directly for more information.
          </p>
        </section>
        <AccordionComponent src={generalFaqs} />
        <AccordionComponent src={openCallFaqs} />
      </div>
    </>
  );
}
