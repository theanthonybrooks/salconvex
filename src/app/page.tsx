"use client"

import { AuthScreen } from "@/features/auth/components/auth-screen"
import { Poppins } from "next/font/google"
import { useState } from "react"

const font = Poppins({ subsets: ["latin"], weight: "600" })

const frameworksList = [
  { value: "artist", label: "Artist" },
  { value: "organizer", label: "Organizer" },
]

function SignOut() {
  return (
    <button
      onClick={() => {}} // Calls the signOut() function from @/auth
      className='px-4 py-2 bg-red-500 text-white rounded'>
      Sign Out
    </button>
  )
}

export default function Home() {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    "artist",
  ])

  // const tasks = useQuery(api.tasks.get)
  return <AuthScreen />
}
