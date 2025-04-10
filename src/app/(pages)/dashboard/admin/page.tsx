import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";

export default async function AccountPage() {
  const token = await convexAuthNextjsToken();
  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;
  const subStatus = subscription?.status;

  if (!user) {
    redirect("/auth/sign-in");
  }

  if (!user?.role.includes("admin")) {
    if (!subStatus || subStatus === "cancelled") {
      redirect("/dashboard/account/settings");
    }

    redirect("/dashboard");
  }

  redirect("/dashboard/admin/todos");

  // return (
  //   <>
  //     <KanbanBoard userRole={user?.role?.[0]} />
  //   </>
  // )
}
