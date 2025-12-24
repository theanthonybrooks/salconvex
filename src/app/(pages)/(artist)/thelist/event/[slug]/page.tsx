import type { ParamsProps } from "@/types/nextTypes";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetail from "@/app/(pages)/(artist)/thelist/components/EventPage";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";

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
      description: data.event.blurb ?? data.event.about?.slice(0, 200) ?? "",
    };
  } catch {
    return { title: "Event - Error" };
  }
}

const EventPage = async ({ params }: ParamsProps) => {
  const token = await convexAuthNextjsToken();
  const { slug } = await params;
  let preloaded;
  try {
    preloaded = await preloadQuery(
      api.events.event.getEventBySlug,
      {
        slug,
      },
      { token },
    );
  } catch {
    notFound();
  }

  return <EventDetail preloaded={preloaded} />;
};

export default EventPage;
