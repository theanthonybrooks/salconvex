import SalHeader from "@/components/ui/sal-header";
import ClientEventList from "@/features/events/event-list-client";

const TheList = async () => {
  // const token = await convexAuthNextjsToken();

  // let userData = null;
  // let subStatus = null;

  // if (token) {
  //   userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  //   subStatus = await fetchQuery(
  //     api.subscriptions.getUserSubscriptionStatus,
  //     {},
  //     { token },
  //   );
  // }
  // const user = userData?.user || null;
  // const accountType = user?.accountType ?? [];
  // const isArtist = accountType?.includes("artist");
  // const isAdmin = user?.role?.includes("admin");
  // const userPref = userData?.userPref ?? null;
  // const publicView =
  //   (!token || !subStatus?.hasActiveSubscription || !isArtist) && !isAdmin;

  return (
    <>
      <SalHeader />
      {/* <main className="min-w-screen max-w-screen flex min-h-screen flex-col items-center px-4"> */}
      <ClientEventList
      // initialEvents={testEventData}
      />
      {/* </main> */}
    </>
  );
};

export default TheList;
