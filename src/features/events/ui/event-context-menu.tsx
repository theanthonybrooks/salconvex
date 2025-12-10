"use client";

import {
  EventCategory,
  EventData,
  SubmissionFormState as EventState,
  PostStatus,
} from "@/types/eventTypes";
import { OpenCallState, OpenCallStatus } from "@/types/openCallTypes";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

import { FaBookmark, FaRegBookmark, FaRegCopy } from "react-icons/fa6";
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

import type { ApplicationStatus } from "~/convex/schema";
import { Button } from "@/components/ui/button";
import { CopyableItem } from "@/components/ui/copyable-item";
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
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { SocialDropdownMenus } from "@/features/events/components/social-dropdown-menus";
import { ConvexDashboardLink } from "@/features/events/ui/convex-dashboard-link";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { capitalizeWords } from "@/helpers/stylingFns";
import { capitalize, cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { AnalyticsSrcType } from "~/convex/schema";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useMutation, usePreloadedQuery } from "convex/react";

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
  src?: AnalyticsSrcType;
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
  src,
}: EventContextMenuProps) => {
  // const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useDevice();
  const eventPage = pathname?.includes("/event");
  const isLargeScreen = useMediaQuery("(min-width: 1535px)");

  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  // const userPref = userData?.userPref ?? null;
  // const fontSize = userPref?.fontSize === "large" ? "text-base" : "sm:text-sm";
  // const isCreator = user?.role?.includes("creator");
  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");

  const hasActiveSubscription = subData?.hasActiveSubscription || isAdmin;
  const hasValidSub = hasActiveSubscription && isArtist;

  const updateEventAnalytics = useMutation(
    api.analytics.eventAnalytics.markEventAnalytics,
  );
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);

  const approveEvent = useMutation(api.events.event.approveEvent);
  const { toggleListAction } = useToggleListAction(eventId as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const hasApplied = appStatus !== null;
  // const { slug, dates } = event;
  const srcType = src ?? (appLink ? "ocPage" : "theList");

  const onHide = async () => {
    toggleListAction({ hidden: !isHidden });
    await updateUserLastActive({ email: user?.email ?? "" });
    if (isHidden || isAdmin || isUserOrg) return;
    await updateEventAnalytics({
      eventId,
      plan: user?.plan ?? 0,
      action: "hide",
      src: srcType,
      userType: user?.accountType,
      hasSub: hasActiveSubscription,
    });
  };
  const onBookmark = async () => {
    toggleListAction({ bookmarked: !isBookmarked || false });
    await updateUserLastActive({ email: user?.email ?? "" });
    if (isBookmarked || isAdmin || isUserOrg) return;
    await updateEventAnalytics({
      eventId,
      plan: user?.plan ?? 0,
      action: "bookmark",
      src: srcType,
      userType: user?.accountType,
      hasSub: hasActiveSubscription,
    });
  };
  const onApply = async () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;
    toggleAppActions({
      openCallId: openCallId as Id<"openCalls">,
      manualApplied: appStatus === "applied" ? false : true,
    });
    await updateUserLastActive({ email: user?.email ?? "" });
    if (appStatus === "applied" || isAdmin || isUserOrg) return;
    await updateEventAnalytics({
      eventId,
      plan: user?.plan ?? 0,
      action: "apply",
      src: srcType,
      userType: user?.accountType,
      hasSub: hasActiveSubscription,
    });
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
      <TooltipSimple
        content="More options"
        side="top"
        align="start"
        sideOffset={3}
        delayDuration={0}
      >
        <DropdownMenuTrigger asChild>
          {buttonTrigger ? (
            <Button
              variant="salWithShadowHiddenRight"
              className={cn(
                "h-14 w-fit px-3",

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
        className="z-[21] w-max min-w-44 sm:text-sm"
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
                : `Edit ${getEventCategoryLabel(eventCategory, true)}`}
            </DropdownMenuItem> */}
            {appLink && (
              <Link
                href={appLink}
                target={appLink.includes("mailto:") ? "_self" : "_blank"}
              >
                <DropdownMenuItem>
                  <ArrowRightCircle className="size-4" />
                  Preview Link
                </DropdownMenuItem>
              </Link>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                data-side={
                  (buttonTrigger && !eventPage && !isLargeScreen) ||
                  (buttonTrigger && eventPage && isMobile)
                    ? "left"
                    : "right"
                }
              >
                <Ellipsis className="size-4" /> More
              </DropdownMenuSubTrigger>

              <DropdownMenuPortal>
                <DropdownMenuSubContent className={cn("p-2")}>
                  {eventId && (
                    <DropdownMenuItem>
                      <CopyableItem
                        copyContent={eventId}
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
          <>
            <DropdownMenuGroup>
              {hasValidSub && isUserOrg && (
                <>
                  <DropdownMenuLabel>Artist</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              {/* Artist section: */}

              <DropdownMenuItem onClick={onHide}>
                {isHidden ? (
                  <>
                    <EyeOff className="size-4" />
                    Unhide{" "}
                    {openCallId !== "" && openCallStatus === "active"
                      ? "Open Call"
                      : capitalizeWords(getEventCategoryLabel(eventCategory))}
                  </>
                ) : (
                  <>
                    <Eye className="size-4" />
                    Hide{" "}
                    {openCallId !== "" && openCallStatus === "active"
                      ? "Open Call"
                      : capitalizeWords(getEventCategoryLabel(eventCategory))}
                  </>
                )}
              </DropdownMenuItem>

              {openCallStatus === "active" &&
                (openCallState === "published" ||
                  openCallState === "archived") && (
                  <DropdownMenuItem
                    onClick={onApply}
                    className={cn(
                      // "cursor-pointer rounded px-4 py-2 sm:text-sm hover:bg-salPinkLtHover",
                      nonAdminPublicView && "hidden",
                      appStatus
                        ? "text-black/80 hover:text-emerald-700"
                        : "text-emerald-700 hover:text-black/80",
                    )}
                  >
                    {appStatus ? (
                      <>
                        <CircleX className="size-4" />
                        Mark as Not Applied
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4" />
                        Mark as Applied
                      </>
                    )}
                  </DropdownMenuItem>
                )}
              {hasApplied && isBookmarked !== undefined && (
                <DropdownMenuItem
                  onClick={onBookmark}
                  className={cn(
                    // "cursor-pointer rounded px-4 py-2 sm:text-sm hover:bg-salPinkLtHover",
                    nonAdminPublicView && "hidden",
                  )}
                >
                  {isBookmarked ? (
                    <>
                      <FaBookmark className="size-4 text-red-500" />
                      Remove Bookmark
                    </>
                  ) : (
                    <>
                      <FaRegBookmark className="size-4" />
                      Bookmark Event
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            {isAdmin && <DropdownMenuSeparator />}
          </>
        )}

        {hasActiveSubscription && !isArtist && !isUserOrg && !isAdmin && (
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/support">Error: Contact support </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {isAdmin && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Admin</DropdownMenuLabel>

            {reviewMode &&
              openCallState === "submitted" &&
              eventState === "submitted" && (
                <DropdownMenuItem
                  onClick={() =>
                    approveEvent({ eventId: eventId as Id<"events"> })
                  }
                >
                  <CircleCheck className="size-4" />
                  Approve Event
                </DropdownMenuItem>
              )}
            {reviewMode && appLink && (
              <Link
                href={appLink}
                target={appLink.includes("mailto:") ? "_self" : "_blank"}
              >
                <DropdownMenuItem>
                  <ArrowRightCircle className="size-4" />
                  Preview Link
                </DropdownMenuItem>
              </Link>
            )}

            {/* {eventId && ( */}
            <Link
              href={`/dashboard/admin/event?_id=${eventId}&sidebar=false`}
              target="_blank"
            >
              <DropdownMenuItem>
                <Pencil className="size-4" />
                Edit Event
                <p
                  className={cn("sr-only")}
                >{`/dashboard/admin/event?_id=${String(eventId)}&sidebar=false`}</p>
              </DropdownMenuItem>
            </Link>
            {/* )} */}
            {postOptions && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  data-side={
                    (buttonTrigger && !eventPage && !isLargeScreen) ||
                    (buttonTrigger && eventPage && isMobile)
                      ? "left"
                      : "right"
                  }
                >
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
              <DropdownMenuSubTrigger
                data-side={
                  (buttonTrigger && !eventPage && !isLargeScreen) ||
                  (buttonTrigger && eventPage && isMobile)
                    ? "left"
                    : "right"
                }
              >
                <Ellipsis className="size-4" /> More
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className={cn("p-2")}>
                  <>
                    {openCallId && (
                      <ConvexDashboardLink table="openCalls" id={openCallId}>
                        <DropdownMenuItem>
                          <ArrowRightCircleIcon className="hidden size-4 sm:block" />
                          Go to Convex
                        </DropdownMenuItem>
                      </ConvexDashboardLink>
                    )}
                    {eventId && (
                      <DropdownMenuItem>
                        <CopyableItem
                          copyContent={eventId}
                          defaultIcon={
                            <FaRegCopy className="hidden size-4 sm:block" />
                          }
                        >
                          Event ID
                        </CopyableItem>
                      </DropdownMenuItem>
                    )}
                    {openCallId && (
                      <DropdownMenuItem>
                        <CopyableItem
                          copyContent={openCallId}
                          defaultIcon={
                            <FaRegCopy className="hidden size-4 sm:block" />
                          }
                        >
                          Open Call ID
                        </CopyableItem>
                      </DropdownMenuItem>
                    )}
                    {mainOrgId && (
                      <DropdownMenuItem>
                        <CopyableItem
                          copyContent={mainOrgId}
                          defaultIcon={
                            <FaRegCopy className="hidden size-4 sm:block" />
                          }
                        >
                          Org ID
                        </CopyableItem>
                      </DropdownMenuItem>
                    )}
                  </>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {reviewMode && mainOrgId && orgOwnerEmailData && orgOwnerEmail && (
              <Link
                href={`mailto:${orgOwnerEmail}?subject=${capitalize(eventName ?? "")} submission`}
              >
                <DropdownMenuItem>
                  <Mail className="size-4" />
                  Contact Org
                </DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuGroup>
        )}
        {!hasActiveSubscription && !isUserOrg && (
          <DropdownMenuGroup>
            <Link href="/pricing">
              <DropdownMenuItem>
                Become a member to bookmark, hide, or apply
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventContextMenu;
