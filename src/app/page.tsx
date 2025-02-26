"use client"

import { UserBtn } from "@/features/auth/components/user-btn"
import { Poppins } from "next/font/google"
import { useState } from "react"

const font = Poppins({ subsets: ["latin"], weight: "600" })

const frameworksList = [
  { value: "artist", label: "Artist" },
  { value: "organizer", label: "Organizer" },
]

export default function Home() {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    "artist",
  ])

  // const tasks = useQuery(api.tasks.get)
  return (
    <div>
      <UserBtn />
    </div>
  )
}
