import type { ParamsYearProps } from "@/types/nextTypes";

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import OpenCallDetail from "@/app/(pages)/(artist)/thelist/components/OpenCallPage";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";

export async function generateMetadata({
  params,
}: ParamsYearProps): Promise<Metadata> {
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
      description: data.event.blurb ?? data.event.about?.slice(0, 200) ?? "",
    };
  } catch {
    return { title: "Open Call - Error" };
  }
}

const OpenCallPage = async ({ params }: ParamsYearProps) => {
  const token = await convexAuthNextjsToken();
  const { slug, year } = await params;
  let preloaded;

  try {
    preloaded = await preloadQuery(
      api.events.event.getEventWithOCDetails,
      {
        slug,
        edition: Number(year),
        source: "ocpage",
      },
      { token },
    );
  } catch (error) {
    if (error instanceof ConvexError) {
      const errorCode = (error.data as { code?: string }).code;
      if (errorCode === "OPEN_CALL_NOT_FOUND") {
        console.log("redirecting");
        redirect(`/thelist/event/${slug}/${year}`);
      } else {
        notFound();
      }
    }
    notFound();
  }

  return <OpenCallDetail preloaded={preloaded} />;
};

export default OpenCallPage;
