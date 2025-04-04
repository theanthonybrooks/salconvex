import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import NavBar from "@/features/wrapper-elements/navigation/components/navbar";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

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
      <NavBar
        userId={userId ?? "guest"}
        user={user ?? null}
        subStatus={subStatus?.subStatus ?? "none"}
        // userPref={userPref ?? null}
      />
      <div className="scrollable mini darkbar">
        <main className="min-w-screen flex flex-col px-4 pt-[100px]">
          {children}
        </main>

        <Footer className="mt-10" />
      </div>
    </ClientAuthWrapper>
  );
}
