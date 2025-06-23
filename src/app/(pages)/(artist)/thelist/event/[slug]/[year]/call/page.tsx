import OpenCallDetail from "@/app/(pages)/(artist)/thelist/components/open-call-page";
import { capitalize } from "@/lib/utils";

import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;
  console.log(slug, year);

  try {
    const event = await fetchQuery(api.events.event.getEventWithOCDetails, {
      slug,
      edition: Number(year),
      source: "ocpage",
    });

    console.log(event);

    if (!event?.event?.name) {
      return { title: "Open Call | Event Not Found" };
    }

    return {
      title: `${capitalize(event.event.name)} (${year}) | Open Call`,
    };
  } catch {
    return { title: "Open Call | Error" };
  }
}

const OpenCallPage = () => {
  return <OpenCallDetail />;
};

export default OpenCallPage;
