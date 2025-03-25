"use client"
// import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react"

import { KanbanBoard } from "@/components/ui/kanban-board"
import { api } from "../../../../../convex/_generated/api"

export default function AccountPage() {
  const userData = useQuery(api.users.getCurrentUser, {})
  const user = userData?.user

  return (
    <>
      <KanbanBoard userRole={user?.role?.[0]} />
    </>
  )
}
