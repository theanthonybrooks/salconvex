import { OpenCallData } from "@/types/openCallTypes";

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import OpenCallSocials from "@/app/(pages)/(artist)/thelist/components/open-call-socials";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

type Props = {
  params: Promise<{ slug: string; year: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const token = await convexAuthNextjsToken();
  const { slug, year } = await params;

  try {
    const data = await fetchQuery(
      api.events.event.getEventWithOCDetails,
      {
        slug,
        edition: Number(year),
        source: "ocpage",
      },
      { token },
    );

    if (!data?.event?.name) {
      return { title: "Open Call - Event Not Found" };
    }

    return {
      title: `${capitalize(data.event.name)} (${year}) - Socials Post`,
    };
  } catch {
    return { title: "Open Call - Error" };
  }
}

export default async function OpenCallSocialsPage({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;
  const token = await convexAuthNextjsToken();

  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;
  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );
  const subStatus = subscription?.status;
  const hasActiveSubscription =
    subStatus === "active" || subStatus === "trialing";
  if (!user) {
    redirect("/auth/sign-in");
  }

  const userId = user?._id;

  const isAdmin = user?.role?.includes("admin");
  let organizerId: string | null = null;
  let ocData: OpenCallData | null = null;

  try {
    const data = await fetchQuery(
      api.events.event.getEventWithOCDetails,
      {
        slug,
        edition: Number(year),
        source: "ocpage",
      },
      { token },
    );
    if (data?.organizer?.ownerId) {
      organizerId = data.organizer.ownerId;
    }
    if (data) {
      ocData = data;
    }
  } catch {
    notFound();
  }

  if (organizerId !== userId && !isAdmin) {
    redirect(
      `/thelist/event/${slug}/${year}/${hasActiveSubscription ? "call" : ""} `,
    );
  }

  return <OpenCallSocials data={ocData} />;
}
