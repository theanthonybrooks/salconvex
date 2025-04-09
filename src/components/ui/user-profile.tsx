"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignOutBtn from "@/features/auth/components/sign-out-btn";
import { cn } from "@/lib/utils";
import { User as UserType } from "@/types/user";
// import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { FaUserNinja } from "react-icons/fa6";

interface UserProfileProps {
  user: UserType | null;
  className?: string;
  subscription?: string;
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
          variant="ghost"
          className={cn("relative h-[50px] w-[50px] rounded-full", className)}
        >
          <Avatar
            className={cn(
              "h-[50px] w-[50px] border-1.5 border-border",
              className,
            )}
          >
            <AvatarImage src={user?.image} alt={user?.name || "User Profile"} />

            <AvatarFallback
              className={cn(
                "border border-border bg-userIcon font-bold text-foreground",
              )}
            >
              {user?.firstName?.[0].toUpperCase()}
              {user?.lastName?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[60] w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-row items-center gap-2 overflow-hidden">
            <Avatar className="size-9 rounded-full border border-border">
              <AvatarImage
                src={user?.image}
                alt={user?.name || "User Profile"}
              />

              <AvatarFallback
                className={cn(
                  "border-1.5 border-border bg-userIcon font-bold text-foreground",
                )}
              >
                {/* {user?.firstName?.[0]}
                {user?.lastName?.[0]} */}
                <FaUserNinja className="size-5" />
                {/* <FaRegFaceFlushed className='h-6 w-6' /> */}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-1 overflow-hidden">
              <p className="truncate text-sm font-medium leading-none">
                {user?.name}
              </p>
              <p className="truncate text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link
            href="/dashboard/account/settings"
            className="underline-offset-2 hover:cursor-pointer hover:underline"
          >
            <DropdownMenuItem className="focus:bg-salYellow/50">
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          {subscription !== "none" && subscription !== "cancelled" && (
            <>
              {/* <Link
            href='/user-profile'
            className='hover:underline underline-offset-2 hover:cursor-pointer'>
            <DropdownMenuItem className='focus:bg-blue-50 dark:focus:bg-blue-950'>
              <User className='mr-2 size-4' />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link> */}

              <Link
                href="/dashboard/account"
                className="underline-offset-2 hover:cursor-pointer hover:underline"
              >
                <DropdownMenuItem className="focus:bg-salYellow/50">
                  <Sparkles className="mr-2 size-4" />
                  <span>Manage Subscription</span>
                </DropdownMenuItem>
              </Link>
            </>
          )}
          {subscription === "cancelled" && (
            <Link
              href="/pricing#plans"
              className="underline-offset-2 hover:cursor-pointer hover:underline"
            >
              <DropdownMenuItem className="focus:bg-salYellow/50">
                <Sparkles className="mr-2 size-4" />
                <span>Renew Subscription</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutBtn>
          <DropdownMenuItem className="focus:bg-salPink/50">
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </SignOutBtn>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
