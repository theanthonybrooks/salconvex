import { redirect } from "next/navigation";
import { OpenCallPost } from "@/app/(pages)/(artist)/thelist/components/open-call-post";
import { OpenCallData } from "@/types/openCallTypes";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function PostPreview({
  searchParams,
}: {
  searchParams: Promise<{
    fontSize?: string;
    bgColor?: string;
    budget?: string;
    slug: string;
    year: string;
  }>;
}) {
  const resultParams = await searchParams;
  const { fontSize, bgColor, budget, slug, year } = resultParams;
  const postSettings = {
    fontSize: Number(fontSize) || 30,
    bgColor: bgColor || "hsla(50, 100%, 72%, 1.0)",
    budget: budget === "true",
  };
  const token = await convexAuthNextjsToken();

  let ocData: OpenCallData | null = null;
  const thisYear = new Date().getFullYear();
  try {
    const data = await fetchQuery(
      api.events.event.getEventWithOCDetails,
      {
        slug: slug ?? "",
        edition: year ? Number(year) : thisYear,
        source: "ocpage",
      },
      { token },
    );

    if (data) {
      ocData = data;
    }
  } catch {
    redirect(`/404-not-found`);
  }

  return <OpenCallPost data={ocData} postSettings={postSettings} />;
}
