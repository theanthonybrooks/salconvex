import EventEditionDetail from "@/app/(pages)/(artist)/thelist/components/event-edition-page";

import { capitalize } from "@/lib/utils";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { api } from "~/convex/_generated/api";

type Props = {
  params: Promise<{ slug: string; year: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
