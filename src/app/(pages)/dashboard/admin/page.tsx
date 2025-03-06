"use client"
// import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react"

import { KanbanBoard } from "@/components/ui/kanban-board"
import { api } from "../../../../../convex/_generated/api"

export default function AccountPage() {
  const userData = useQuery(api.users.getCurrentUser, {})
  const user = userData?.user

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div>
        <h1 className='text-3xl font-semibold tracking-tight'>
          Admin Overview
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Current pending applications, planned posts, tasks/todos, and more.
        </p>
      </div>
      <KanbanBoard userRole={user?.role?.[0]} />
    </div>
  )
}
