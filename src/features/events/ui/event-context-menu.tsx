"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { capitalize, cn } from "@/lib/utils";
import {
  ArrowRightCircle,
  ArrowRightCircleIcon,
  CheckCircle,
  CircleCheck,
  CircleX,
  Ellipsis,
  Eye,
  EyeOff,
  Mail,
  Pencil,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/types/applications";
import {
  EventCategory,
  SubmissionFormState as EventState,
  PostStatus,
} from "@/types/event";
import { OpenCallState, OpenCallStatus } from "@/types/openCall";

import { CopyableItem } from "@/components/ui/copyable-item";
import { Separator } from "@/components/ui/separator";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { ConvexDashboardLink } from "@/features/events/ui/convex-dashboard-link";
import {
  getEventCategoryLabel,
  getEventCategoryLabelAbbr,
} from "@/lib/eventFns";
import { User } from "@/types/user";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { FaBookmark, FaRegBookmark, FaRegCopy } from "react-icons/fa6";
import { MdPhoto } from "react-icons/md";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface EventContextMenuProps {
  // onHide: () => void;
  appLink?: string;
  eventId: string;
  eventState?: EventState;
  openCallId: string;
  openCallState: OpenCallState | null;
  isHidden: boolean;
  // setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  appStatus: ApplicationStatus | null;
  eventCategory: EventCategory;
  openCallStatus: OpenCallStatus;
  // setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  mainOrgId?: Id<"organizations">;
  publicView?: boolean;
  buttonTrigger?: boolean;
  align?: "center" | "start" | "end" | undefined;
  user?: User | null;
  isBookmarked?: boolean;
  reviewMode?: boolean;
  orgPreview?: boolean;
  postStatus?: PostStatus;
  postOptions?: boolean;
}

const EventContextMenu = ({
  appLink,
  eventId,
  mainOrgId,
  openCallId,
  eventState,
  openCallState,
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
  reviewMode = false,
  orgPreview,
  postStatus,
  postOptions = false,
}: EventContextMenuProps) => {
  const router = useRouter();
  const isAdmin = user?.role?.includes("admin") || false;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const updateEventPostStatus = useMutation(
    api.events.event.updateEventPostStatus,
  );
  const approveEvent = useMutation(api.events.event.approveEvent);
  const { toggleListAction } = useToggleListAction(eventId as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const hasApplied = appStatus !== null;
  const onHide = async () => {
    toggleListAction({ hidden: !isHidden });
    await updateUserLastActive({ email: user?.email ?? "" });
  };
  const onBookmark = async () => {
    toggleListAction({ bookmarked: !isBookmarked || false });
    await updateUserLastActive({ email: user?.email ?? "" });
  };
  const onApply = async () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;
    toggleAppActions({
      openCallId: openCallId as Id<"openCalls">,
      manualApplied: appStatus === "applied" ? false : true,
    });
    await updateUserLastActive({ email: user?.email ?? "" });
  };
  const {
    data: orgOwnerEmailData,
    // isError: isOrgOwnerError,
    // error,
  } = useQueryWithStatus(
    api.organizer.organizations.getOrgContactInfo,
    mainOrgId ? { orgId: mainOrgId, eventId: eventId as Id<"events"> } : "skip",
  );

  const isOwner =
    typeof user?.email === "string" &&
    user?.email === orgOwnerEmailData?.orgOwnerEmail;

  const nonAdminPublicView = publicView && !isAdmin && !orgPreview;

  const handlePostEvent = async (postStatus: PostStatus | null) => {
    if (!user) return;
    try {
      await updateEventPostStatus({
        eventId: eventId as Id<"events">,
        posted: postStatus,
      });
    } catch (error) {
      console.error("Error updating event post status:", error);
    }
  };

  return (
    <Popover>
      <TooltipSimple content="More options" side="top">
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
      </TooltipSimple>
      <PopoverContent
        showCloseButton={false}
        className="z-[19] max-w-max border-1.5 p-0 text-sm"
        align={align}
      >
        <p className="py-2 pl-4 font-bold">More options</p>
        <Separator />
        <div className="flex flex-col gap-y-1 pb-2">
          {(!isOwner || (isAdmin && !reviewMode)) && (
            <>
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
                    {openCallId !== "" && openCallStatus === "active"
                      ? "Open Call"
                      : getEventCategoryLabel(eventCategory)}
                  </span>
                ) : (
                  <span className="flex items-center gap-x-1 capitalize">
                    <Eye className="size-4" />
                    Hide{" "}
                    {openCallId !== "" && openCallStatus === "active"
                      ? "Open Call"
                      : getEventCategoryLabel(eventCategory)}
                  </span>
                )}
              </div>

              {openCallStatus === "active" &&
                (openCallState === "published" ||
                  openCallState === "archived") && (
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
            </>
          )}
          {isAdmin && postOptions && (
            <div
              className={cn(
                "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                nonAdminPublicView && "hidden",
              )}
            >
              {/* //TODO: Make this link to the socials page as well as updating the post status  */}
              {!postStatus ? (
                <span
                  className="flex items-center gap-x-1 text-sm"
                  onClick={() => handlePostEvent("toPost")}
                >
                  <MdPhoto className="size-4" />
                  Make Post
                </span>
              ) : (
                <span
                  className="flex items-center gap-x-1 text-sm"
                  onClick={() => handlePostEvent(null)}
                >
                  <X className="size-4" />
                  Cancel Post
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

          {nonAdminPublicView && !isOwner && (
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
          {isOwner && !isAdmin && (
            <>
              <div
                className="flex cursor-pointer items-center gap-x-2 rounded px-4 py-2 text-sm hover:bg-salPinkLtHover"
                onClick={() =>
                  router.push(
                    `/dashboard/organizer/update-event?_id=${eventId}`,
                  )
                }
              >
                <Pencil className="size-4" />{" "}
                {openCallState === "pending"
                  ? "Finish Submission"
                  : `Edit ${getEventCategoryLabelAbbr(eventCategory)}`}
              </div>

              {eventId && (
                <CopyableItem
                  copyContent={eventId}
                  className="gap-x-1 rounded px-4 py-2 hover:bg-salPinkLtHover"
                  defaultIcon={<FaRegCopy className="size-4" />}
                >
                  Copy Event ID
                </CopyableItem>
              )}
              {openCallId && (
                <CopyableItem
                  copyContent={openCallId}
                  className="gap-x-1 rounded px-4 py-2 hover:bg-salPinkLtHover"
                  defaultIcon={<FaRegCopy className="size-4" />}
                >
                  Copy Open Call ID
                </CopyableItem>
              )}
            </>
          )}
          {isAdmin && (
            <>
              {reviewMode &&
                openCallState === "submitted" &&
                eventState === "submitted" && (
                  <span
                    className="flex cursor-pointer items-center gap-x-1 px-4 py-2 text-sm hover:bg-salPinkLtHover"
                    onClick={() =>
                      approveEvent({ eventId: eventId as Id<"events"> })
                    }
                  >
                    <CircleCheck className="size-4" />
                    Approve Event
                  </span>
                )}
              {reviewMode && appLink && (
                <Link
                  href={appLink}
                  target={appLink.includes("mailto:") ? "_self" : "_blank"}
                  className="flex items-center gap-x-1 px-4 py-2 text-sm hover:bg-salPinkLtHover"
                >
                  <ArrowRightCircle className="size-4" />
                  Preview Link
                </Link>
              )}
              {openCallId && (
                <ConvexDashboardLink
                  table="openCalls"
                  id={openCallId}
                  className="flex cursor-pointer items-center gap-x-1 px-4 py-2 text-sm hover:bg-salPinkLtHover"
                >
                  <ArrowRightCircleIcon className="size-4" />
                  Go to Convex
                </ConvexDashboardLink>
              )}
              <Link
                href={`/dashboard/admin/event?_id=${eventId}`}
                target="_blank"
                className={cn(
                  "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                )}
              >
                <span className="flex items-center gap-x-1 text-sm">
                  <Pencil className="size-4" />
                  Edit Event
                </span>
              </Link>

              {eventId && (
                <CopyableItem
                  copyContent={eventId}
                  className="gap-x-1 rounded px-4 py-2 hover:bg-salPinkLtHover"
                  defaultIcon={<FaRegCopy className="size-4" />}
                >
                  Copy Event ID
                </CopyableItem>
              )}
              {mainOrgId && (
                <CopyableItem
                  copyContent={mainOrgId}
                  className="gap-x-1 rounded px-4 py-2 hover:bg-salPinkLtHover"
                  defaultIcon={<FaRegCopy className="size-4" />}
                >
                  Copy Org ID
                </CopyableItem>
              )}
              {reviewMode && mainOrgId && (
                <Link
                  href={`mailto:${orgOwnerEmailData?.orgOwnerEmail ?? ""}?subject=${capitalize(orgOwnerEmailData?.eventName ?? "")} submission`}
                  className="flex items-center gap-x-1 px-4 py-2 text-sm hover:bg-salPinkLtHover"
                >
                  <Mail className="size-4" />
                  Contact Org
                </Link>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EventContextMenu;
