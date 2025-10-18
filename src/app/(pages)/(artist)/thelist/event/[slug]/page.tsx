import EventDetail from "@/app/(pages)/(artist)/thelist/components/event-page";

import { capitalize } from "@/helpers/utilsFns";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { api } from "~/convex/_generated/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
