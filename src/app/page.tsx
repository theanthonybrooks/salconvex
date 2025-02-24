"use client"

import { LoginButton } from "@/components/auth/login-button"
import { MultiSelect } from "@/components/multi-select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'>
      <div className='space-y-6 text-center'>
        <SignOut />
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}>
          🔐Auth
        </h1>
        <p className='text-white text-lg'> A simple authentication example </p>
        <div>
          <LoginButton>
            <Button size='lg' variant='secondary'>
              Sign In
            </Button>
          </LoginButton>
        </div>
      </div>
      <div className='p-4 max-w-[400px]'>
        <MultiSelect
          options={frameworksList}
          onValueChange={setSelectedFrameworks}
          defaultValue={["artist"]}
          // lockedValue={["artist"]}
          placeholder='Select account type'
          variant='basic'
          maxCount={3}
          height={8}
          hasSearch={false}
          selectAll={false}
        />
      </div>

      {/* {tasks?.map(({ _id, text }) => (
        <div key={_id}>{text}</div>
      ))} */}
    </main>
  )
}
