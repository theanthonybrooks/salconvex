"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useAuthActions } from "@convex-dev/auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"
import { Loader, LogOut } from "lucide-react"

export const UserBtn = () => {
  const { signOut } = useAuthActions()
  const { data, isLoading } = useCurrentUser()

  if (isLoading) {
    return <Loader className='size-4 animate-spin text-muted-foreground' />
  }

  if (!data) {
    return null
  }

  const { image, name, email } = data
  const nameParts = name!.split(" ")
  const avatarFallback = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className='outline-none relative'>
        <Avatar className='size=10 hover:opacity-75 transition'>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className='bg-sky-500 text-white'>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' side='right' className='w-60'>
        <DropdownMenuItem
          onClick={() => signOut()}
          className='h-10 flex items-center cursor-pointer'>
          <LogOut className='size-4 mr-2 text-muted-foreground' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
