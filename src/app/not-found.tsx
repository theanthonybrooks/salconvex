import Force404Url from "@/components/force404url";
import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import NavBar from "@/features/wrapper-elements/navigation/components/navbar";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import Image from "next/image";
import { api } from "~/convex/_generated/api";

export default async function NotFound() {
  const token = await convexAuthNextjsToken();

  let userData = null;
  let subStatus = null;

  if (token) {
    userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
    subStatus = await fetchQuery(
      api.subscriptions.getUserSubscriptionStatus,
      {},
      { token },
    );
  }

  const userId = userData?.userId ?? "guest";
  const user = userData?.user ?? null;

  return (
    <ClientAuthWrapper>
      <Force404Url />
      <div className="h-full min-h-screen">
        <NavBar
          userId={userId ?? "guest"}
          user={user ?? null}
          subStatus={subStatus?.subStatus ?? "none"}
          // userPref={userPref ?? null}
        />
        <div className="scrollable mini darkbar flex min-h-screen flex-col justify-between">
          <main className="min-w-screen flex h-full flex-grow flex-col items-center justify-center px-4 pt-[135px] lg:pt-[100px]">
            <Image
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc28zdmdycW5tN3FuN2hpZnFhMG9xZXJybGhwNTY3OG14aW16aG9oMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HVxExOaWkOsOcdOWpA/giphy.gif"
              alt="404 Error"
              width={300}
              height={300}
              className="mx-auto mb-4 max-w-[90vw] rounded-full border-2"
            />
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-center font-tanker text-[9.5rem] leading-none md:leading-[9.5rem]">
                404
              </h1>
              <h2 className="w-min text-center font-tanker text-[2.6rem] leading-10 md:w-max md:max-w-min">
                Page Not Found
              </h2>
            </div>
            {/* <p className="text-center text-3xl font-bold text-foreground">
              At least, not yet 😘
            </p> */}
          </main>
          <Footer className="mt-10" />
        </div>
      </div>
    </ClientAuthWrapper>
  );
}
