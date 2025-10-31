import type { Metadata } from "next";

import { redirect } from "next/navigation";
import { CheckoutPage } from "@/app/(pages)/extras/components/checkoutPage";
import { capitalize } from "lodash";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery, preloadedQueryResult, preloadQuery } from "convex/nextjs";

type Props = {
  params: Promise<{ slug: string; year: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const token = await convexAuthNextjsToken();
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  try {
    const result = slug
      ? await fetchQuery(
          api.userAddOns.onlineEvents.getOnlineEvent,
          {
            slug: slugValue,
          },
          { token },
        )
      : null;

    if (!result?.data || !result) {
      return { title: "Extras - Online Event Not Found" };
    }

    return {
      title: `${capitalize(result.data.name)}  - Registration`,
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
  const token = await convexAuthNextjsToken();

  const preloadedResult = slug
    ? await preloadQuery(
        api.userAddOns.onlineEvents.getOnlineEvent,
        {
          slug: slugValue,
        },
        { token },
      )
    : null;

  const event = preloadedResult ? preloadedQueryResult(preloadedResult) : null;

  console.log(event);
  if (!preloadedResult || !event?.data) {
    redirect("/404");
  }

  return <CheckoutPage preloaded={preloadedResult} />;
}
