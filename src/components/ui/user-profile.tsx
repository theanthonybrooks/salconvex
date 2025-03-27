"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SignOutBtn from "@/features/auth/components/sign-out-btn"
import { cn } from "@/lib/utils"
import { User as UserType } from "@/types/user"
// import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, Settings, Sparkles } from "lucide-react"
import Link from "next/link"
import { FaUserNinja } from "react-icons/fa6"

interface UserProfileProps {
  user: UserType | null
  className?: string
  subscription?: string
}

export function UserProfile({
  user,
  className,
  subscription,
}: UserProfileProps) {
  // console.log("User subscription:", subscription)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={cn("relative h-[50px] w-[50px] rounded-full", className)}>
          <Avatar
            className={cn("h-[50px] w-[50px] border border-border", className)}>
            <AvatarImage src={user?.image} alt={user?.name || "User Profile"} />

            <AvatarFallback
              className={cn(
                "border-border border bg-userIcon  text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-200"
              )}>
              {user?.firstName?.[0].toUpperCase()}
              {user?.lastName?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-row items-center gap-2 overflow-hidden'>
            <Avatar className='h-9 w-9 rounded-full border border-border'>
              <AvatarImage
                src={user?.image}
                alt={user?.name || "User Profile"}
              />

              <AvatarFallback
                className={cn(
                  "border-border border bg-userIcon  text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-200"
                )}>
                {/* {user?.firstName?.[0]}
                {user?.lastName?.[0]} */}
                <FaUserNinja className='h-6 w-6' />
                {/* <FaRegFaceFlushed className='h-6 w-6' /> */}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col space-y-1 overflow-hidden'>
              <p className='text-sm font-medium leading-none truncate'>
                {user?.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground truncate'>
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link
            href='/dashboard/account/settings'
            className='hover:underline underline-offset-2 hover:cursor-pointer'>
            <DropdownMenuItem className='focus:bg-blue-50 dark:focus:bg-blue-950'>
              <Settings className='mr-2 h-4 w-4' />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          {subscription !== "none" && subscription !== "cancelled" && (
            <>
              {/* <Link
            href='/user-profile'
            className='hover:underline underline-offset-2 hover:cursor-pointer'>
            <DropdownMenuItem className='focus:bg-blue-50 dark:focus:bg-blue-950'>
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link> */}

              <Link
                href='/dashboard/account'
                className='hover:underline underline-offset-2 hover:cursor-pointer'>
                <DropdownMenuItem className='focus:bg-blue-50 dark:focus:bg-blue-950'>
                  <Sparkles className='mr-2 h-4 w-4' />
                  <span>Manage Subscription</span>
                </DropdownMenuItem>
              </Link>
            </>
          )}
          {subscription === "cancelled" && (
            <Link
              href='/pricing#plans'
              className='hover:underline underline-offset-2 hover:cursor-pointer'>
              <DropdownMenuItem className='focus:bg-blue-50 dark:focus:bg-blue-950'>
                <Sparkles className='mr-2 h-4 w-4' />
                <span>Renew Subscription</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutBtn>
          <DropdownMenuItem className='focus:bg-blue-50 dark:focus:bg-blue-950'>
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </DropdownMenuItem>
        </SignOutBtn>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
