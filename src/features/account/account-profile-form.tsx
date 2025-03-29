import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ArtistProfileForm } from "@/features/artists/artist-profile-form"
import { EventOCForm } from "@/features/events/event-add-form"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { useRouter } from "next/navigation"
import React from "react"

// type BaseTaskValues = {
//   title: string

//   priority: "low" | "medium" | "high"
// }

export type ModeType = "artist" | "organizer"

interface AccountSubscribeFormProps {
  className?: string
  mode: ModeType
  user: User | undefined
  onClick: () => void
  children?: React.ReactNode
}

export const AccountSubscribeForm = ({
  className,
  mode,
  user,
  children,
  onClick,
}: AccountSubscribeFormProps) => {
  const router = useRouter()
  const isArtist = mode === "artist"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DialogHeader
          className='w-full'
          onClick={(e) => {
            if (!user) {
              e.preventDefault()
              e.stopPropagation()
              router.push("/auth/register?src=newUser")
            }
          }}>
          {children}
        </DialogHeader>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "bg-card max-w-full max-h-full w-full  md:h-auto md:max-w-lg ",
          className,
          !isArtist && "xl:max-w-[95vw]  xl:max-h-[90vh] xl:h-full"
        )}>
        <div>
          <DialogTitle>
            {isArtist ? "Create Artist Profile" : "Add New Call"}
          </DialogTitle>
          <DialogDescription>
            {isArtist
              ? "Add information needed to apply for open calls"
              : "Add open call for your project or event"}
          </DialogDescription>
        </div>
        {isArtist ? (
          <ArtistProfileForm user={user} onClick={onClick} />
        ) : (
          <EventOCForm user={user} onClick={onClick} />
        )}
      </DialogContent>
    </Dialog>
  )
}
