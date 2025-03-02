//import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper"
import { KanbanBoard2 } from "@/components/ui/kanban"
import { KanbanBoard } from "@/components/ui/kanban-board"
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

  console.log("userData", userData)

  return (
    // <ClientAuthWrapper>
    <>
      <NavBar
        userId={userData?.userId ?? "guest"}
        user={userData?.user ?? null}
      />
      <main className='flex min-w-screen min-h-screen flex-col pt-[4rem] items-center  justify-between'>
        {children}
      </main>
      <KanbanBoard2 />
      <KanbanBoard userRole={userData?.user?.role?.[0]} />
      <Footer />
    </>
    // </ClientAuthWrapper>
  )
}
