import TheListNavBar from "@/app/(pages)/(artist)/thelist/components/artist-navbar";
import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <TheListNavBar
        userId={userId ?? "guest"}
        user={user ?? null}
        subStatus={subStatus?.subStatus ?? "none"}
        // userPref={userPref ?? null}
      />
      <div className="scrollable mini darkbar pt-32">
        {children}

        <Footer />
      </div>
    </ClientAuthWrapper>
  );
}
