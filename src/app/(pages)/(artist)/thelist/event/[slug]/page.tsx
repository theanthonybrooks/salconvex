import { Metadata } from "next";
import EventDetail from "@/app/(pages)/(artist)/thelist/components/event-page";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import { capitalize } from "@/helpers/utilsFns";

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
