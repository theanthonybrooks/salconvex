"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import {
  CheckCircle,
  CircleX,
  Ellipsis,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/types/applications";
import { EventCategory } from "@/types/event";
import { OpenCallStatus } from "@/types/openCall";

import { Separator } from "@/components/ui/separator";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { User } from "@/types/user";
import { FaBookmark, FaRegBookmark, FaRegCopy } from "react-icons/fa6";
import { Id } from "~/convex/_generated/dataModel";

interface EventContextMenuProps {
  // onHide: () => void;
  eventId: string;
  openCallId: string;
  isHidden: boolean;
  // setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  appStatus: ApplicationStatus | null;
  eventCategory: EventCategory;
  openCallStatus: OpenCallStatus;
  // setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  publicView?: boolean;
  buttonTrigger?: boolean;
  align?: "center" | "start" | "end" | undefined;
  user?: User | null;
  isBookmarked?: boolean;
}

const EventContextMenu = ({
  eventId,
  openCallId,
  // onHide,
  isHidden,
  // setIsHidden,
  publicView,
  appStatus,
  eventCategory,
  openCallStatus,
  // setManualApplied,
  buttonTrigger,
  align,
  user,
  isBookmarked,
}: EventContextMenuProps) => {
  const isAdmin = user?.role?.includes("admin") || false;
  const { toggleListAction } = useToggleListAction(eventId as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const hasApplied = appStatus !== null;
  const onHide = () => {
    toggleListAction({ hidden: !isHidden });
  };
  const onBookmark = () => {
    toggleListAction({ bookmarked: !isBookmarked || false });
  };
  const onApply = () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;
    toggleAppActions({
      openCallId: openCallId as Id<"openCalls">,
      manualApplied: appStatus === "applied" ? false : true,
    });
  };

  const nonAdminPublicView = publicView && !isAdmin;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {buttonTrigger ? (
          <Button
            variant="salWithShadowHidden"
            size="lg"
            className={cn(
              "relative z-[1] h-14 w-fit rounded-l-none border-l px-3 sm:h-11 sm:px-3 [&_svg]:size-6",

              appStatus !== null &&
                !nonAdminPublicView &&
                "border-foreground/50 bg-background text-foreground/50 hover:shadow-slga",
            )}
          >
            <Ellipsis className="size-6" />
          </Button>
        ) : (
          <Ellipsis className="size-6 cursor-pointer" />
        )}
      </PopoverTrigger>
      <PopoverContent
        showCloseButton={false}
        className="max-w-max border-1.5 p-0 text-sm"
        align={align}
      >
        <p className="py-2 pl-4 font-bold">More options</p>
        <Separator />
        <div className="flex flex-col gap-y-1 pb-2">
          <div
            onClick={onHide}
            className={cn(
              "cursor-pointer rounded px-4 py-2 text-black/80 hover:bg-salPinkLtHover hover:text-red-700",
              nonAdminPublicView && "hidden",
            )}
          >
            {isHidden ? (
              <span className="flex items-center gap-x-1 capitalize">
                <EyeOff className="size-4" />
                Unhide{" "}
                {openCallId !== ""
                  ? "Open Call"
                  : eventCategory.slice(0, 1).toUpperCase() +
                    eventCategory.slice(1)}
              </span>
            ) : (
              <span className="flex items-center gap-x-1 capitalize">
                <Eye className="size-4" />
                Hide{" "}
                {openCallId !== ""
                  ? "Open Call"
                  : eventCategory.slice(0, 1).toUpperCase() +
                    eventCategory.slice(1)}
              </span>
            )}
          </div>
          {(openCallStatus === "active" || isAdmin) && (
            <div
              onClick={onApply}
              className={cn(
                "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                nonAdminPublicView && "hidden",
                appStatus
                  ? "text-black/80 hover:text-emerald-700"
                  : "text-emerald-700 hover:text-black/80",
              )}
            >
              {appStatus ? (
                <span className="flex items-center gap-x-1 text-sm">
                  <CircleX className="size-4" />
                  Mark as Not Applied
                </span>
              ) : (
                <span className="flex items-center gap-x-1 text-sm">
                  <CheckCircle className="size-4" />
                  Mark as Applied
                </span>
              )}
            </div>
          )}
          {hasApplied && isBookmarked !== undefined && (
            <div
              onClick={onBookmark}
              className={cn(
                "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                nonAdminPublicView && "hidden",
              )}
            >
              {isBookmarked ? (
                <span className="flex items-center gap-x-1 text-sm">
                  <FaBookmark className="size-4 text-red-500" />
                  Remove Bookmark
                </span>
              ) : (
                <span className="flex items-center gap-x-1 text-sm">
                  <FaRegBookmark className="size-4" />
                  Bookmark Event
                </span>
              )}
            </div>
          )}
          {nonAdminPublicView && (
            <div
              className={cn(
                "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",

                appStatus
                  ? "text-emerald-700 hover:text-black/80"
                  : "text-black/80 hover:text-emerald-700",
              )}
            >
              <Link href="/pricing">
                Become a member to bookmark, hide, or apply
              </Link>
            </div>
          )}
          {isAdmin && (
            <>
              <Link
                href={`/dashboard/admin/event?eventId=${eventId}`}
                target="_blank"
                className={cn(
                  "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                  nonAdminPublicView && "hidden",
                )}
              >
                <span className="flex items-center gap-x-1 text-sm">
                  <Pencil className="size-4" />
                  Edit Event
                </span>
              </Link>
              <div
                onClick={() => {
                  navigator.clipboard.writeText(eventId);
                }}
                className={cn(
                  "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                  nonAdminPublicView && "hidden",
                )}
              >
                <span className="flex items-center gap-x-1 text-sm">
                  <FaRegCopy className="size-4" />
                  Copy Event ID
                </span>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EventContextMenu;
