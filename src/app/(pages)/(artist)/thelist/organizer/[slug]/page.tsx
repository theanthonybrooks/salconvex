import type { ParamsProps } from "@/types/nextTypes";

import { Metadata } from "next";
import OrganizerDetail from "@/app/(pages)/(artist)/thelist/components/OrganizerPage";

import { capitalize } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

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

const OrganizerPage = () => {
  return <OrganizerDetail />;
};

export default OrganizerPage;
