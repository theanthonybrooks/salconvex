import { Metadata } from "next";
import OrganizerDetail from "@/app/(pages)/(artist)/thelist/components/organizer-page";
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
