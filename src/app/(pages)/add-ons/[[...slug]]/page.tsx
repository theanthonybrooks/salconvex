import type { Metadata } from "next";

import { redirect } from "next/navigation";
import { CheckoutPage } from "@/app/(pages)/add-ons/components/checkoutPage";
import { capitalize } from "lodash";

import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

type Props = {
  params: Promise<{ slug: string; year: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  try {
    const event = slug
      ? await fetchQuery(api.userAddOns.onlineEvents.getOnlineEvent, {
          slug: slugValue,
        })
      : null;

    if (!event) {
      return { title: "Add-Ons - Online Event Not Found" };
    }

    return {
      title: `${capitalize(event.name)}  - Registration`,
    };
  } catch {
    return { title: "Registration - Error" };
  }
}

export default async function AddOnsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const event = slug
    ? await fetchQuery(api.userAddOns.onlineEvents.getOnlineEvent, {
        slug: slugValue,
      })
    : null;

  if (!event) {
    redirect("/404");
  }

  return <CheckoutPage event={event} />;
}
