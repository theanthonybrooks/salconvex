import React from "react";

import { Bell } from "lucide-react";

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
import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/helpers/utilsFns";

type NotificationsDropdownProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  tooltipDisabled: boolean;
  className?: string;
  isAdmin?: boolean;
  pendingEvents: number;
  pendingOpenCalls: number;
  totalPending: number;
};

export const NotificationsDropdown = ({
  open,
  setOpen,
  setTooltipDisabled,
  tooltipDisabled,
  className,
  isAdmin,
  totalPending,
  pendingEvents,
  pendingOpenCalls,
}: NotificationsDropdownProps) => {
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
            <DropdownMenuItem className="pointer-events-none w-full">
              No New Notifications
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
