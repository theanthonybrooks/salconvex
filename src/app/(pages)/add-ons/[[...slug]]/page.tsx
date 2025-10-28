import { redirect } from "next/navigation";
import { CheckoutPage } from "@/app/(pages)/add-ons/components/checkoutPage";

import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

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
