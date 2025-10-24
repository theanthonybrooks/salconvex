"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";
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
import { FaUserNinja } from "react-icons/fa6";
import { PiPiggyBank } from "react-icons/pi";

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
import { TooltipSimple } from "@/components/ui/tooltip";
import SignOutBtn from "@/features/auth/components/sign-out-btn";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

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
  const user = userData?.user;

  const userRole = user?.role;
  const accountType = user?.accountType;
  const isArtist = accountType?.includes("artist") ?? false;
  const isOrganizer = accountType?.includes("organizer") ?? false;
  const isAdmin = userRole?.includes("admin");
  const hasActiveSub = subData?.hasActiveSubscription;
  const subStatus = subData?.subStatus;
  // console.log("User subscription:", subscription)
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: submittedEventsData } = useQueryWithStatus(
    api.events.event.getSubmittedEventCount,
    isAdmin ? {} : "skip",
  );
  const { data: submittedOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getSubmittedOpenCallCount,
    isAdmin ? {} : "skip",
  );
  const pendingEvents = submittedEventsData ?? 0;
  const pendingOpenCalls = submittedOpenCallsData ?? 0;
  const totalPending = pendingOpenCalls + pendingEvents;

  return (
    <div className={cn("flex items-center gap-4")}>
      {isAdmin && (
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
            content="View Nofitications"
            side="bottom"
            disabled={open || tooltipDisabled}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn("relative size-12.5 rounded-full", className)}
              >
                <Bell className="size-6" />
                {isAdmin && totalPending > 0 && (
                  <div className="absolute -bottom-[0.05rem] -left-1 flex size-5 items-center justify-center rounded-full border-1.5 border-foreground bg-card text-2xs font-bold hover:scale-105 hover:cursor-pointer">
                    {totalPending}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipSimple>
          <DropdownMenuContent className="z-[60] w-48" thick align="end">
            <DropdownMenuLabel className="font-normal">
              <p>Notifications</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {pendingEvents > 0 && (
                <DropdownMenuItem
                  className="w-full"
                  onClick={() => {
                    window.location.href =
                      "/dashboard/admin/submissions?state=submitted";
                  }}
                >
                  {pendingEvents} - Pending Events
                </DropdownMenuItem>
              )}
              {pendingOpenCalls > 0 && (
                <DropdownMenuItem
                  className="w-full"
                  onClick={() => {
                    window.location.href =
                      "/dashboard/admin/submissions?openCallState=submitted";
                  }}
                >
                  {pendingOpenCalls} - Pending Open Calls
                </DropdownMenuItem>
              )}
              {!pendingEvents && !pendingOpenCalls && (
                <DropdownMenuItem className="w-full">
                  No New Notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
              className={cn("relative size-12.5 rounded-full", className)}
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
        <DropdownMenuContent className="z-[60] w-56" thick align="end">
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LucideLayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="border-2">
                    {isAdmin && (
                      <Link
                        href={`/dashboard/admin/users`}
                        className="underline-offset-2 hover:cursor-pointer hover:underline"
                      >
                        <DropdownMenuItem className="focus:bg-salYellow/50">
                          {totalPending > 0 ? (
                            <div className="flex size-5 items-center justify-center rounded-full border-1.5 border-foreground bg-background text-xs font-bold hover:no-underline">
                              {totalPending}
                            </div>
                          ) : (
                            <Squirrel className="mr-2 size-4" />
                          )}
                          <span>Admin</span>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {hasActiveSub && (
                      <Link
                        href="/dashboard/"
                        className="underline-offset-2 hover:cursor-pointer hover:underline"
                      >
                        <DropdownMenuItem className="focus:bg-salYellow/50">
                          <PaintRoller className="mr-2 size-4" />
                          <span>{isAdmin ? "User" : "Artist"}</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {isOrganizer && (
                      <Link
                        href="/dashboard/organizer/events"
                        className="underline-offset-2 hover:cursor-pointer hover:underline"
                      >
                        <DropdownMenuItem className="focus:bg-salYellow/50">
                          <Users2 className="mr-2 size-4" />
                          <span>Organizer</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <Link
                    href="/dashboard/settings/account"
                    className="underline-offset-2 hover:cursor-pointer hover:underline"
                  >
                    <DropdownMenuItem className="focus:bg-salYellow/50">
                      <User className="mr-2 size-4" />
                      <span>Account</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href="/dashboard/settings/notifications"
                    className="underline-offset-2 hover:cursor-pointer hover:underline"
                  >
                    <DropdownMenuItem className="focus:bg-salYellow/50">
                      <Bell className="mr-2 size-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href="/dashboard/settings/appearance"
                    className="underline-offset-2 hover:cursor-pointer hover:underline"
                  >
                    <DropdownMenuItem className="focus:bg-salYellow/50">
                      <Sparkles className="mr-2 size-4" />
                      <span>Appearance</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href="/dashboard/settings/security"
                    className="underline-offset-2 hover:cursor-pointer hover:underline"
                  >
                    <DropdownMenuItem className="focus:bg-salYellow/50">
                      <Lock className="mr-2 size-4" />
                      <span>Security</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            {hasActiveSub && subStatus !== "canceled" && (
              <Link
                href="/dashboard/billing"
                className="underline-offset-2 hover:cursor-pointer hover:underline"
              >
                <DropdownMenuItem className="focus:bg-salYellow/50">
                  <PiPiggyBank className="mr-2 size-4" />
                  <span>Manage Membership</span>
                </DropdownMenuItem>
              </Link>
            )}

            {subStatus === "canceled" && isArtist && (
              <Link
                href="/pricing?type=artist"
                className="underline-offset-2 hover:cursor-pointer hover:underline"
              >
                <DropdownMenuItem className="focus:bg-salYellow/50">
                  <PiPiggyBank className="mr-2 size-4" />
                  <span>Renew Membership</span>
                </DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Link
            href="/support"
            className="underline-offset-2 hover:cursor-pointer hover:underline"
          >
            <DropdownMenuItem className="focus:bg-salYellow/50">
              <HelpCircle className="mr-2 size-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <SignOutBtn email={user?.email}>
            <DropdownMenuItem className="focus:bg-salPink/50">
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </SignOutBtn>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
