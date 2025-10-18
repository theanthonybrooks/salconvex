import OpenCallDetail from "@/app/(pages)/(artist)/thelist/components/open-call-page";
import { capitalize } from "@/helpers/utilsFns";
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
      title: `${capitalize(data.event.name)} (${year}) - Open Call`,
    };
  } catch {
    return { title: "Open Call - Error" };
  }
}

const OpenCallPage = () => {
  return <OpenCallDetail />;
};

export default OpenCallPage;
