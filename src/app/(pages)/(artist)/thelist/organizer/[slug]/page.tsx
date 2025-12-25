import type { ParamsProps } from "@/types/nextTypes";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizerErrorPage } from "@/app/(pages)/(artist)/thelist/components/OrganizerErrorPage";
import OrganizerDetail from "@/app/(pages)/(artist)/thelist/components/OrganizerPage";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";

export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata> {
  const token = await convexAuthNextjsToken();
  const { slug } = await params;

  try {
    const data = await fetchQuery(
      api.organizer.organizations.getOrganizerBySlug,
      {
        slug,
      },
      { token },
    );

    if (!data?.organizer.name) {
      return { title: "Organization Not Found" };
    }

    return {
      title: `${capitalize(data.organizer.name)}`,
    };
  } catch {
    return { title: "Organization - Error" };
  }
}

const OrganizerPage = async ({ params }: ParamsProps) => {
  const token = await convexAuthNextjsToken();
  const { slug } = await params;
  let preloaded;
  try {
    preloaded = await preloadQuery(
      api.organizer.organizations.getOrganizerBySlug,
      {
        slug,
      },
      { token },
    );
  } catch (error) {
    if (error instanceof ConvexError) {
      const errorCode = (error.data as { code?: string }).code;
      if (errorCode === "ORGANIZATION_NOT_FOUND") {
        return <OrganizerErrorPage type="notFound" />;
      } else if (errorCode === "INCOMPLETE_ORGANIZER") {
        return <OrganizerErrorPage type="incomplete" />;
      }
    }
    notFound();
  }
  return <OrganizerDetail preloaded={preloaded} />;
};

export default OrganizerPage;
