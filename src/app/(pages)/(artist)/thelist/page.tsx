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

  const userPref = userData?.userPref ?? null;
  const publicView = !token || !subStatus?.hasActiveSubscription;

  return (
    <div className="max-w-screen flex flex-col items-center px-4">
      <ClientEventList
        // initialEvents={testEventData}
        publicView={publicView}
        userPref={userPref}
      />
    </div>
  );
};

export default TheList;
