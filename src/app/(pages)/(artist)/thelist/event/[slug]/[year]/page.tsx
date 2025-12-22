import type { EventEditionResult } from "@/types/eventTypes";
import type { ParamsYearProps } from "@/types/nextTypes";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import EventEditionDetail from "@/app/(pages)/(artist)/thelist/components/EventEditionPage";

import { EventSkeleton } from "@/components/ui/skeleton";
import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";

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
      description: data.event.blurb ?? data.event.about?.slice(0, 200) ?? "",
    };
  } catch {
    return { title: "Event - Error" };
  }
}

const EventPage = async ({ params }: ParamsYearProps) => {
  const token = await convexAuthNextjsToken();
  const { slug, year } = await params;
  let data: EventEditionResult | null = null;
  try {
    data = await fetchQuery(
      api.events.event.getEventWithDetails,
      {
        slug,
        edition: Number(year),
      },
      { token },
    );
  } catch (error) {
    if (error instanceof ConvexError) {
      notFound();
    }
  }

  if (!data) return <EventSkeleton />;

  return <EventEditionDetail data={data} />;
};

export default EventPage;
