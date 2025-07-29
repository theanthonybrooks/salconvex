import EventEditionDetail from "@/app/(pages)/(artist)/thelist/components/event-edition-page";

import { capitalize } from "@/lib/utils";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
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
