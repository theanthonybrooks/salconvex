import OpenCallDetail from "@/app/(pages)/(artist)/thelist/components/open-call-page";
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
