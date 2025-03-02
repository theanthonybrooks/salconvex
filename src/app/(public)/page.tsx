"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"
import { useMutation } from "convex/react"
import { Poppins } from "next/font/google"
import Image from "next/image"
import { useState } from "react"
import { api } from "../../../convex/_generated/api"

const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const { signOut } = useAuthActions()
  const DeleteAccount = useMutation(api.users.deleteAccount)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDeleteAccount = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await DeleteAccount({ method: "deleteAccount" })
      signOut()
    } catch (err) {
      setError("Failed to delete account. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <Image
        src='/herotest.jpg'
        alt='The Street Art List'
        width={800}
        height={400}
        priority={true}
        className='ml-2'
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant='salWithShadow'
            className='absolute right-5 top-15  text-lg font-bold'
            aria-label='Close modal'
            disabled={isLoading}>
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='w-[80dvw] bg-salYellow text-black'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl'>
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className='text-black'>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className='text-red-600'>{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteAccount} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Yes, Delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
