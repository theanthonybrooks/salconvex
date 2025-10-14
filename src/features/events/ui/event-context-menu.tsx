"use client";
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
  Globe,
  Mail,
  Pencil,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/types/applications";
import {
  EventCategory,
  EventData,
  SubmissionFormState as EventState,
  PostStatus,
} from "@/types/event";
import { OpenCallState, OpenCallStatus } from "@/types/openCall";

import { CopyableItem } from "@/components/ui/copyable-item";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { SocialDropdownMenus } from "@/features/events/components/social-dropdown-menus";
import { ConvexDashboardLink } from "@/features/events/ui/convex-dashboard-link";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getEventCategoryLabel } from "@/lib/eventFns";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useMutation, usePreloadedQuery } from "convex/react";
import { FaBookmark, FaRegBookmark, FaRegCopy } from "react-icons/fa6";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface EventContextMenuProps {
  // onHide: () => void;
  appLink?: string | null;
  isUserOrg: boolean;
  event: EventData;
  eventId: Id<"events">;
  eventState?: EventState;
  openCallId: Id<"openCalls"> | null;
  openCallState: OpenCallState | null;
  isHidden: boolean;
  // setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  appStatus: ApplicationStatus | null;
  eventCategory: EventCategory;
  openCallStatus: OpenCallStatus;
  // setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  mainOrgId: Id<"organizations">;
  publicView?: boolean;
  buttonTrigger?: boolean;
  align?: "center" | "start" | "end" | undefined;
  isBookmarked?: boolean;
  reviewMode?: boolean;
  orgPreview?: boolean;
  postStatus?: PostStatus;
  postOptions?: boolean;
  type?: "event" | "admin";
}

const EventContextMenu = ({
  appLink,
  isUserOrg,
  eventId,
  event,
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

  isBookmarked,
  reviewMode = false,
  orgPreview,
  postStatus,
  postOptions = false,
  type = "event",
}: EventContextMenuProps) => {
  // const router = useRouter();
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  // const userPref = userData?.userPref ?? null;
  // const fontSize = userPref?.fontSize === "large" ? "text-base" : "text-sm";
  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");

  const hasActiveSubscription = subData?.hasActiveSubscription || isAdmin;
  const hasValidSub = hasActiveSubscription && isArtist;

  const updateUserLastActive = useMutation(api.users.updateUserLastActive);

  const approveEvent = useMutation(api.events.event.approveEvent);
  const { toggleListAction } = useToggleListAction(eventId as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const hasApplied = appStatus !== null;
  // const { slug, dates } = event;

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

  const { data: orgOwnerEmailData } = useQueryWithStatus(
    api.organizer.organizations.getOrgContactInfo,
    reviewMode && mainOrgId && isAdmin
      ? { orgId: mainOrgId, eventId: eventId as Id<"events"> }
      : "skip",
  );

  const { orgOwnerEmail, eventName } = orgOwnerEmailData ?? {};

  const nonAdminPublicView = publicView && !isAdmin && !orgPreview;

  return (
    <DropdownMenu>
      <TooltipSimple content="More options" side="top">
        <DropdownMenuTrigger asChild>
          {buttonTrigger ? (
            <Button
              variant="salWithShadowHidden"
              size="lg"
              className={cn(
                "relative z-[1] h-14 w-fit rounded-l-none border-l px-3 sm:h-11 sm:px-3 [&_svg]:size-6",

                appStatus !== null &&
                  !nonAdminPublicView &&
                  hasValidSub &&
                  type === "event" &&
                  "border-foreground/50 bg-background text-foreground/50 hover:shadow-slga",
              )}
            >
              <Ellipsis className="size-6" />
            </Button>
          ) : (
            <Ellipsis className="size-6 cursor-pointer" />
          )}
        </DropdownMenuTrigger>
      </TooltipSimple>
      <DropdownMenuContent
        className="z-[19] w-max min-w-44 text-sm"
        align={align}
      >
        <DropdownMenuLabel>More options</DropdownMenuLabel>
        {/* <p className="py-2 pl-4 font-bold">More options</p> */}
        <DropdownMenuSeparator />
        {isUserOrg && !isAdmin && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Organizer</DropdownMenuLabel>

            {/* <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/dashboard/organizer/update-event?_id=${eventId}&sidebar=false`,
                )
              }
            >
              <Pencil className="size-4" />{" "}
              {openCallState === "pending"
                ? "Finish Submission"
                : `Edit ${getEventCategoryLabelAbbr(eventCategory)}`}
            </DropdownMenuItem> */}
            {appLink && (
              <DropdownMenuItem>
                <Link
                  href={appLink}
                  target={appLink.includes("mailto:") ? "_self" : "_blank"}
                  className="flex items-center gap-x-2"
                >
                  <ArrowRightCircle className="size-4" />
                  Preview Link
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                <Ellipsis className="size-4" /> More
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className={cn("p-2")}>
                  {eventId && (
                    <DropdownMenuItem>
                      <CopyableItem
                        copyContent={eventId}
                        className="gap-x-2"
                        defaultIcon={<FaRegCopy className="size-4" />}
                      >
                        Copy Event ID
                      </CopyableItem>
                    </DropdownMenuItem>
                  )}
                  {openCallId && (
                    <DropdownMenuItem>
                      <CopyableItem
                        copyContent={openCallId}
                        className="gap-x-2"
                        defaultIcon={<FaRegCopy className="size-4" />}
                      >
                        Copy Open Call ID
                      </CopyableItem>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        )}
        {hasValidSub && (!isUserOrg || (isAdmin && !reviewMode)) && (
          <DropdownMenuGroup>
            {/* Artist section: */}

            <DropdownMenuItem onClick={onHide}>
              {/* <div
                    onClick={onHide}
                    className={cn(
                      "cursor-pointer rounded px-4 py-2 text-black/80 hover:bg-salPinkLtHover hover:text-red-700",
                      nonAdminPublicView && "hidden",
                    )}
                  > */}
              {isHidden ? (
                <span className="flex items-center gap-x-2 capitalize">
                  <EyeOff className="size-4" />
                  Unhide{" "}
                  {openCallId !== "" && openCallStatus === "active"
                    ? "Open Call"
                    : getEventCategoryLabel(eventCategory)}
                </span>
              ) : (
                <span className="flex items-center gap-x-2 capitalize">
                  <Eye className="size-4" />
                  Hide{" "}
                  {openCallId !== "" && openCallStatus === "active"
                    ? "Open Call"
                    : getEventCategoryLabel(eventCategory)}
                </span>
              )}
              {/* </div> */}
            </DropdownMenuItem>

            {openCallStatus === "active" &&
              (openCallState === "published" ||
                openCallState === "archived") && (
                <DropdownMenuItem
                  onClick={onApply}
                  className={cn(
                    // "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                    nonAdminPublicView && "hidden",
                    appStatus
                      ? "text-black/80 hover:text-emerald-700"
                      : "text-emerald-700 hover:text-black/80",
                  )}
                >
                  {appStatus ? (
                    <span className="flex items-center gap-x-2 text-sm">
                      <CircleX className="size-4" />
                      Mark as Not Applied
                    </span>
                  ) : (
                    <span className="flex items-center gap-x-2 text-sm">
                      <CheckCircle className="size-4" />
                      Mark as Applied
                    </span>
                  )}
                </DropdownMenuItem>
              )}
            {hasApplied && isBookmarked !== undefined && (
              <DropdownMenuItem
                onClick={onBookmark}
                className={cn(
                  // "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                  nonAdminPublicView && "hidden",
                )}
              >
                {isBookmarked ? (
                  <span className="flex items-center gap-x-2 text-sm">
                    <FaBookmark className="size-4 text-red-500" />
                    Remove Bookmark
                  </span>
                ) : (
                  <span className="flex items-center gap-x-2 text-sm">
                    <FaRegBookmark className="size-4" />
                    Bookmark Event
                  </span>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}

        {hasActiveSubscription && !isArtist && !isUserOrg && (
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/support">Error: Contact support </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {isAdmin && (
          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Admin</DropdownMenuLabel>

            {reviewMode &&
              openCallState === "submitted" &&
              eventState === "submitted" && (
                <DropdownMenuItem
                  className="flex items-center gap-x-2 text-sm"
                  onClick={() =>
                    approveEvent({ eventId: eventId as Id<"events"> })
                  }
                >
                  <CircleCheck className="size-4" />
                  Approve Event
                </DropdownMenuItem>
              )}
            {reviewMode && appLink && (
              <DropdownMenuItem>
                <Link
                  href={appLink}
                  target={appLink.includes("mailto:") ? "_self" : "_blank"}
                  className="flex items-center gap-x-2"
                >
                  <ArrowRightCircle className="size-4" />
                  Preview Link
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem>
              <Link
                href={`/dashboard/admin/event?_id=${eventId}&sidebar=false`}
                target="_blank"
              >
                <span className="flex items-center gap-x-2 text-sm">
                  <Pencil className="size-4" />
                  Edit Event
                </span>
              </Link>
            </DropdownMenuItem>
            {postOptions && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                  <Globe className="size-4" /> Socials
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className={cn("p-2", nonAdminPublicView && "hidden")}
                  >
                    <SocialDropdownMenus
                      socialsEvent={event}
                      openCallState={openCallState === "published"}
                      postStatus={postStatus}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                <Ellipsis className="size-4" /> More
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className={cn("p-2")}>
                  <>
                    {openCallId && (
                      <DropdownMenuItem>
                        <ConvexDashboardLink
                          table="openCalls"
                          id={openCallId}
                          className="flex items-center gap-x-2 text-sm"
                        >
                          <ArrowRightCircleIcon className="size-4" />
                          Go to Convex
                        </ConvexDashboardLink>
                      </DropdownMenuItem>
                    )}
                    {eventId && (
                      <DropdownMenuItem>
                        <CopyableItem
                          copyContent={eventId}
                          className="gap-x-2"
                          defaultIcon={<FaRegCopy className="size-4" />}
                        >
                          Copy Event ID
                        </CopyableItem>
                      </DropdownMenuItem>
                    )}
                    {openCallId && (
                      <DropdownMenuItem>
                        <CopyableItem
                          copyContent={openCallId}
                          className="gap-x-2"
                          defaultIcon={<FaRegCopy className="size-4" />}
                        >
                          Copy Open Call ID
                        </CopyableItem>
                      </DropdownMenuItem>
                    )}
                    {mainOrgId && (
                      <DropdownMenuItem>
                        <CopyableItem
                          copyContent={mainOrgId}
                          className="gap-x-2"
                          defaultIcon={<FaRegCopy className="size-4" />}
                        >
                          Copy Org ID
                        </CopyableItem>
                      </DropdownMenuItem>
                    )}
                  </>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {reviewMode && mainOrgId && orgOwnerEmailData && orgOwnerEmail && (
              <DropdownMenuItem>
                <Link
                  href={`mailto:${orgOwnerEmail}?subject=${capitalize(eventName ?? "")} submission`}
                  className="flex items-center gap-x-2 px-4 py-2 text-sm hover:bg-salPinkLtHover"
                >
                  <Mail className="size-4" />
                  Contact Org
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}
        {!hasActiveSubscription && !isUserOrg && (
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/pricing">
                Become a member to bookmark, hide, or apply
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventContextMenu;
