import React from "react";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";

type NotificationsDropdownProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  tooltipDisabled: boolean;
  className?: string;
  isAdmin?: boolean;
};

export const NotificationsDropdown = ({
  open,
  setOpen,
  setTooltipDisabled,
  tooltipDisabled,
  className,
  isAdmin,
}: NotificationsDropdownProps) => {
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: submittedEventsData } = useQueryWithStatus(
    api.events.event.getSubmittedEventCount,
    isAdmin ? {} : "skip",
  );
  const { data: submittedOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getSubmittedOpenCallCount,
    isAdmin ? {} : "skip",
  );
  const { data: queuedEventsData } = useQueryWithStatus(
    api.events.socials.getNumberOfQueuedEvents,
    isAdmin ? {} : "skip",
  );

  const queuedEvents = queuedEventsData?.data ?? 0;
  const pendingEvents = submittedEventsData ?? 0;
  const pendingOpenCalls = submittedOpenCallsData ?? 0;
  const totalPending = pendingOpenCalls + pendingEvents + queuedEvents;
  return (
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
        align="start"
        disabled={open || tooltipDisabled}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn("relative size-12.5 rounded-full", className)}
          >
            <Bell className="size-6" />
            {isAdmin && totalPending > 0 && (
              <div className="bg-salPinkMed absolute right-0 top-0 flex size-5 items-center justify-center rounded-full border-1.5 border-salPinkDark text-2xs font-semibold text-card hover:scale-105 hover:cursor-pointer">
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
            <Link
              href="/dashboard/admin/submissions?state=submitted"
              target="_blank"
            >
              <DropdownMenuItem className="w-full">
                {pendingEvents} - Pending Event{pendingEvents > 1 && "s"}
              </DropdownMenuItem>
            </Link>
          )}
          {pendingOpenCalls > 0 && (
            <Link
              href="/dashboard/admin/submissions?openCallState=submitted"
              target="_blank"
            >
              <DropdownMenuItem className="w-full">
                {pendingOpenCalls} - Pending Open Call
                {pendingOpenCalls > 1 && "s"}
              </DropdownMenuItem>
            </Link>
          )}
          {queuedEvents > 0 && (
            <Link href="/dashboard/admin/socials" target="_blank">
              <DropdownMenuItem className="w-full">
                {queuedEvents} - Scheduled Call{queuedEvents > 1 && "s"}
              </DropdownMenuItem>
            </Link>
          )}
          {totalPending === 0 && (
            <DropdownMenuItem className="pointer-events-none w-full">
              No New Notifications
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
