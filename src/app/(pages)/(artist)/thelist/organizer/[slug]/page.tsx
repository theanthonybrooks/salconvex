import OrganizerDetail from "@/app/(pages)/(artist)/thelist/components/organizer-page";
import { capitalize } from "@/lib/utils";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
