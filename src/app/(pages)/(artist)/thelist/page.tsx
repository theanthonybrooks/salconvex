import { mockEventData } from "@/data/mockEventData"
import ClientEventList from "@/features/events/event-list-client"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { api } from "~/convex/_generated/api"

const TheList = async () => {
  const token = await convexAuthNextjsToken()
  const subStatus = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token }
  )
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token })

  const userPref = userData?.userPref ?? null

  const publicView = !token || !subStatus?.hasActiveSubscription

  return (
    <div className='px-4 flex flex-col items-center max-w-screen'>
      <ClientEventList
        initialEvents={mockEventData}
        publicView={publicView}
        userPref={userPref}
      />
    </div>
  )
}

export default TheList
