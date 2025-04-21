import SalHeader from "@/components/ui/sal-header";
import ClientEventList from "@/features/events/event-list-client";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

const TheList = async () => {
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
  const user = userData?.user || null;
  const userPref = userData?.userPref ?? null;
  const publicView = !token || !subStatus?.hasActiveSubscription;

  return (
    <>
      <SalHeader />
      {/* <main className="min-w-screen max-w-screen flex min-h-screen flex-col items-center px-4"> */}
      <ClientEventList
        // initialEvents={testEventData}
        publicView={publicView}
        userPref={userPref}
        user={user}
      />
      {/* </main> */}
    </>
  );
};

export default TheList;
