"use client";

import { useState } from "react";
import Link from "next/link";

import { FaUserNinja } from "react-icons/fa6";
import { PiPiggyBank } from "react-icons/pi";
import {
  Bell,
  HelpCircle,
  Lock,
  LogOut,
  LucideLayoutDashboard,
  PaintRoller,
  Settings,
  Sparkles,
  Squirrel,
  User,
  Users2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsDropdown } from "@/components/ui/navbar/notifications-dropdown";
import { TooltipSimple } from "@/components/ui/tooltip";
import SignOutBtn from "@/features/auth/components/sign-out-btn";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

interface UserProfileProps {
  // user: UserType;
  className?: string;
}

export function UserProfile({
  // user,
  className,
}: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const [tooltipDisabled, setTooltipDisabled] = useState(false);

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { user, userPref } = userData ?? {};

  const userRole = user?.role;
  const accountType = user?.accountType ?? [];
  const multipleAccountTypes = accountType.length > 1;
  const isArtist = accountType?.includes("artist") ?? false;
  const isOrganizer = accountType?.includes("organizer") ?? false;
  const isAdmin = !!user && userRole?.includes("admin");
  const hasActiveSub = subData?.hasActiveSubscription;
  const subStatus = subData?.subStatus;
  // console.log("User subscription:", subscription)

  const artistDashboardLink = "/dashboard/";
  const organizerDashboardLink = "/dashboard/organizer/";

  return (
    <div className={cn("flex items-center gap-4")}>
      {isAdmin && (
        <NotificationsDropdown
          open={open}
          setOpen={setOpen}
          setTooltipDisabled={setTooltipDisabled}
          tooltipDisabled={tooltipDisabled}
          className={className}
          user={user}
          userPref={userPref}
        />
      )}
      <DropdownMenu
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setTooltipDisabled(true);
            setTimeout(() => setTooltipDisabled(false), 250);
          }
        }}
      >
        <TooltipSimple
          content="Open Profile Menu"
          side="bottom"
          disabled={open || tooltipDisabled}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "relative size-12.5 rounded-full hover:scale-[1.025]",
                className,
              )}
            >
              <Avatar className={cn(className)}>
                <AvatarImage
                  src={user?.image}
                  alt={user?.name || "User Profile"}
                />

                <AvatarFallback>
                  {user?.firstName?.[0].toUpperCase()}
                  {user?.lastName?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        </TooltipSimple>
        <DropdownMenuContent
          className="z-[60] w-56"
          thick
          align="end"
          alignOffset={-10}
        >
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
            {(hasActiveSub || isOrganizer) && (
              <>
                {multipleAccountTypes ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-x-1">
                      <LucideLayoutDashboard className="mr-2 size-4 gap-x-1" />
                      Dashboard
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="border-2">
                        {isAdmin && (
                          <DropdownMenuItem
                            className="gap-x-1 focus:bg-salYellow/50"
                            asChild
                          >
                            <Link
                              href={`/dashboard/admin/users`}
                              className="underline-offset-2 hover:cursor-pointer hover:underline"
                            >
                              <Squirrel className="mr-2 size-4" />

                              <p>Admin</p>
                            </Link>
                          </DropdownMenuItem>
                        )}

                        {hasActiveSub && (
                          <DropdownMenuItem
                            className="gap-x-1 focus:bg-salYellow/50"
                            asChild
                          >
                            <Link
                              href={artistDashboardLink}
                              className="underline-offset-2 hover:cursor-pointer hover:underline"
                            >
                              <PaintRoller className="mr-2 size-4" />
                              <p>Artist</p>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {isOrganizer && (
                          <DropdownMenuItem
                            className="gap-x-1 focus:bg-salYellow/50"
                            asChild
                          >
                            <Link
                              href={organizerDashboardLink}
                              className="underline-offset-2 hover:cursor-pointer hover:underline"
                            >
                              <Users2 className="mr-2 size-4" />
                              <p>Organizer</p>
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    className="gap-x-1 focus:bg-salYellow/50"
                    asChild
                  >
                    <Link
                      href={
                        isArtist ? artistDashboardLink : organizerDashboardLink
                      }
                      className="underline-offset-2 hover:cursor-pointer hover:underline"
                    >
                      <LucideLayoutDashboard className="mr-2 size-4" />
                      <p>Dashboard</p>
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-x-1">
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    className="gap-x-1 focus:bg-salYellow/50"
                    asChild
                  >
                    <Link
                      href="/dashboard/settings/account"
                      className="underline-offset-2 hover:cursor-pointer hover:underline"
                    >
                      <User className="mr-2 size-4" />
                      <p>Account</p>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1 focus:bg-salYellow/50"
                    asChild
                  >
                    <Link
                      href="/dashboard/settings/notifications"
                      className="underline-offset-2 hover:cursor-pointer hover:underline"
                    >
                      <Bell className="mr-2 size-4" />
                      <p>Notifications</p>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1 focus:bg-salYellow/50"
                    asChild
                  >
                    <Link
                      href="/dashboard/settings/appearance"
                      className="underline-offset-2 hover:cursor-pointer hover:underline"
                    >
                      <Sparkles className="mr-2 size-4" />
                      <p>Appearance</p>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1 focus:bg-salYellow/50"
                    asChild
                  >
                    <Link
                      href="/dashboard/settings/security"
                      className="underline-offset-2 hover:cursor-pointer hover:underline"
                    >
                      <Lock className="mr-2 size-4" />
                      <p>Security</p>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            {hasActiveSub && subStatus !== "canceled" && (
              <DropdownMenuItem
                className="gap-x-1 focus:bg-salYellow/50"
                asChild
              >
                <Link
                  href="/dashboard/billing"
                  className="underline-offset-2 hover:cursor-pointer hover:underline"
                >
                  <PiPiggyBank className="mr-2 size-4" />
                  <p>Manage Membership</p>
                </Link>
              </DropdownMenuItem>
            )}

            {subStatus === "canceled" && isArtist && (
              <DropdownMenuItem
                className="gap-x-1 focus:bg-salYellow/50"
                asChild
              >
                <Link
                  href="/pricing?type=artist"
                  className="underline-offset-2 hover:cursor-pointer hover:underline"
                >
                  <PiPiggyBank className="mr-2 size-4" />
                  <p>Renew Membership</p>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-x-1 focus:bg-salYellow/50" asChild>
            <Link
              href="/support"
              className="underline-offset-2 hover:cursor-pointer hover:underline"
            >
              <HelpCircle className="mr-2 size-4" />
              <p>Help & Support</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutBtn email={user?.email}>
            <DropdownMenuItem className="gap-x-1 focus:bg-salPink/50">
              <LogOut className="mr-2 size-4" />
              <p>Log out</p>
            </DropdownMenuItem>
          </SignOutBtn>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
