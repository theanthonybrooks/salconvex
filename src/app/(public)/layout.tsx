//import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper"
import Footer from "@/features/wrapper-elements/navigation/components/footer"
import NavBar from "@/features/wrapper-elements/navigation/components/navbar"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await convexAuthNextjsToken()
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token })
  const userPref = userData?.userPref ?? null
  const userId = userData?.userId ?? null
  const user = userData?.user ?? null

  const subStatus = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token }
  )

  return (
    // <ClientAuthWrapper>
    <>
      <NavBar
        userId={userId ?? "guest"}
        user={user ?? null}
        subStatus={subStatus?.subStatus ?? "none"}
        userPref={userPref ?? null}
      />
      <main className='flex min-w-screen min-h-screen flex-col pt-[4rem] items-center  justify-between'>
        {children}
      </main>

      <Footer />
    </>
    // </ClientAuthWrapper>
  )
}
