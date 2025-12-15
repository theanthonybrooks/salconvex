import type { ParamsProps } from "@/types/nextTypes";

import { Metadata } from "next";
import EventDetail from "@/app/(pages)/(artist)/thelist/components/EventPage";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata> {
  const token = await convexAuthNextjsToken();
  const { slug } = await params;

  try {
    const data = await fetchQuery(
      api.events.event.getEventBySlug,
      {
        slug,
      },
      { token },
    );

    if (!data?.event?.name) {
      return { title: "Event Not Found" };
    }

    return {
      title: `${capitalize(data.event.name)}`,
    };
  } catch {
    return { title: "Event - Error" };
  }
}

const EventPage = () => {
  return <EventDetail />;
};

export default EventPage;
