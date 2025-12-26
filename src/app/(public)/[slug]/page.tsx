import type { ParamsProps } from "@/types/nextTypes";
import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { PricingWrapper } from "@/features/homepage/pricingWrapper";

export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata> {
  const { slug } = await params;

  const pageTitle = slug === "pricing" ? "Pricing" : "Submit";

  return {
    title: `${pageTitle} | The Street Art List`,
    description:
      "Sign up for a membership to keep up with the latest open calls, projects and events or submit your own call and reach the global community of street artists, muralists, graffiti artists, and more.",
  };
}

export default async function PricingPage({ params }: ParamsProps) {
  const { slug } = await params;

  if (slug !== "pricing" && slug !== "submit") notFound();

  return (
    <>
      <div className="container mx-auto">
        <PricingWrapper
          defaultType={slug === "pricing" ? "artist" : "organizer"}
        />
      </div>
    </>
  );
}
