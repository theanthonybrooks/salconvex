import { capitalize, cn } from "@/lib/utils";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
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
      title: `${capitalize(data.event.name)} (${year}) - Socials Post`,
    };
  } catch {
    return { title: "Open Call - Error" };
  }
}

export default async function OpenCallPost({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;
  const token = await convexAuthNextjsToken();

  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;
  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );
  const subStatus = subscription?.status;
  const hasActiveSubscription =
    subStatus === "active" || subStatus === "trialing";
  if (!user) {
    redirect("/auth/sign-in");
  }

  const userId = user?._id;

  const isAdmin = user?.role?.includes("admin");
  let organizerId: string | null = null;

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
    if (data?.organizer?.ownerId) {
      organizerId = data.organizer.ownerId;
    }
  } catch {
    redirect(`/404-not-found`);
  }

  if (organizerId !== userId && !isAdmin) {
    redirect(
      `/thelist/event/${slug}/${year}/${hasActiveSubscription ? "call" : ""} `,
    );
  }

  return (
    <div
      className={cn("my-10 w-full justify-items-center lg:grid lg:grid-cols-2")}
    >
      <section className={cn("flex flex-col gap-3")}>
        <h1>Social Media Post</h1>
        <div className="h-[500px] w-[400px] rounded-sm border"></div>
      </section>
      <section className={cn("flex flex-col gap-3")}>
        <h1>Social Media Story</h1>
        <div className="h-[500px] w-[250px] rounded-sm border"></div>
      </section>
    </div>
  );
}
