import type { ParamsYearProps } from "@/types/nextTypes";

import { Metadata } from "next";
import EventEditionDetail from "@/app/(pages)/(artist)/thelist/components/EventEditionPage";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function generateMetadata({
  params,
}: ParamsYearProps): Promise<Metadata> {
  const token = await convexAuthNextjsToken();
  const { slug, year } = await params;

  try {
    const data = await fetchQuery(
      api.events.event.getEventWithDetails,
      {
        slug,
        edition: Number(year),
      },
      { token },
    );

    if (!data?.event?.name) {
      return { title: "Event Not Found" };
    }

    return {
      title: `${capitalize(data.event.name)} (${year})`,
    };
  } catch {
    return { title: "Event - Error" };
  }
}

const EventPage = () => {
  return <EventEditionDetail />;
};

export default EventPage;
