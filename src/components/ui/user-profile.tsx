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
import { supportEmail } from "@/constants/siteInfo";
import SignOutBtn from "@/features/auth/components/sign-out-btn";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import { usePreloadedQuery } from "convex/react";
// import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  HelpCircle,
  LogOut,
  LucideLayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { FaUserNinja } from "react-icons/fa6";
import { PiPiggyBank } from "react-icons/pi";

interface UserProfileProps {
  // user: UserType;
  className?: string;
  subscription?: string;
}

export function UserProfile({
  // user,
  className,
  subscription,
}: UserProfileProps) {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user;
  const userRole = user?.role;
  const isAdmin = userRole?.includes("admin");
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
              "h-[50px] w-[50px] border-1.5 border-border active:scale-95",
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
                // src="/1.jpg"
                alt={user?.name || "User Profile"}
              />

              <AvatarFallback
                className={cn(
                  "border-1.5 border-border bg-userIcon font-bold text-foreground",
                )}
              >
                <FaUserNinja className="size-5" />
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
          {isAdmin && (
            <Link
              href="/dashboard/admin/submissions"
              className="underline-offset-2 hover:cursor-pointer hover:underline"
            >
              <DropdownMenuItem className="focus:bg-salYellow/50">
                <Users className="mr-2 size-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>
          )}

          {subscription !== "none" && subscription !== "cancelled" && (
            <>
              <Link
                href="/dashboard/"
                className="underline-offset-2 hover:cursor-pointer hover:underline"
              >
                <DropdownMenuItem className="focus:bg-salYellow/50">
                  <LucideLayoutDashboard className="mr-2 size-4" />
                  <span>{isAdmin ? "User Dashboard" : "Dashboard"}</span>
                </DropdownMenuItem>
              </Link>
              <Link
                href="/dashboard/account/billing"
                className="underline-offset-2 hover:cursor-pointer hover:underline"
              >
                <DropdownMenuItem className="focus:bg-salYellow/50">
                  <PiPiggyBank className="mr-2 size-4" />
                  <span>Manage Membership</span>
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
                <PiPiggyBank className="mr-2 size-4" />
                <span>Renew Membership</span>
              </DropdownMenuItem>
            </Link>
          )}
          <Link
            href="/dashboard/account/settings"
            className="underline-offset-2 hover:cursor-pointer hover:underline"
          >
            <DropdownMenuItem className="focus:bg-salYellow/50">
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link
          href={`mailto:${supportEmail}`}
          className="underline-offset-2 hover:cursor-pointer hover:underline"
        >
          <DropdownMenuItem className="focus:bg-salYellow/50">
            <HelpCircle className="mr-2 size-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </Link>
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
