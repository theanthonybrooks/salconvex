import SalHeader from "@/components/ui/sal-header"
import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper"
import Footer from "@/features/wrapper-elements/navigation/components/footer"
import NavBar from "@/features/wrapper-elements/navigation/components/navbar"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { api } from "~/convex/_generated/api"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await convexAuthNextjsToken()
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token })
  // const userPref = userData?.userPref ?? null
  const userId = userData?.userId ?? null
  const user = userData?.user ?? undefined

  const subStatus = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token }
  )

  return (
    <ClientAuthWrapper>
      <NavBar
        userId={userId ?? "guest"}
        user={user ?? null}
        subStatus={subStatus?.subStatus ?? "none"}
        // userPref={userPref ?? null}
      />
      <div className='scrollable mini boundless darkbar pt-32'>
        <SalHeader />
        <main className='min-w-screen min-h-screen'>{children}</main>

        <Footer />
      </div>
    </ClientAuthWrapper>
  )
}
