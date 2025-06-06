import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "~/convex/_generated/api";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });

  const user = userData?.user;
  const isAdmin = user?.role.includes("admin");

  if (!isAdmin) {
    redirect("/thelist");
  }

  return (
    //<ClientAuthWrapper>
    <>
      <NavbarWrapper type="thelist" />
      <main className="flex w-full flex-1 flex-col items-center px-4 pt-32">
        {children}
      </main>
      <Footer />
    </>
    // </ClientAuthWrapper>
  );
}
