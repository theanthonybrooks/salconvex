import type { EventCategory, EventData } from "@/types/eventTypes";
import type {
  CallType,
  OpenCallState,
  OpenCallStatus,
} from "@/types/openCallTypes";
import type { User } from "@/types/user";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  LoaderCircle,
} from "lucide-react";

import type { ApplicationStatus } from "~/convex/schema";
import { ApplyRedirectDialog } from "@/components/ui/apply-redirect-dialog";
import { Button } from "@/components/ui/button";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { AnalyticsSrcType, UserPrefsType } from "~/convex/schema";
import { useMutation } from "convex/react";

interface ApplyButtonShortProps {
  src: AnalyticsSrcType;
  eventId: Id<"events">;
  slug: string;
  edition: number;
  appStatus: ApplicationStatus | null;
  openCall: OpenCallStatus;
  publicView?: boolean;
  appFee: number;
  className?: string;
  user: User | null;
  activeSub: boolean;
  isUserOrg: boolean;
}

export const ApplyButtonShort = ({
  eventId,
  slug,
  edition,
  appStatus,
  openCall,
  publicView,
  appFee,
  className,
  user,
  activeSub,
  isUserOrg,
  src,
}: ApplyButtonShortProps) => {
  const updateEventAnalytics = useMutation(
    api.analytics.eventAnalytics.markEventAnalytics,
  );
  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");
  const hasValidSub = activeSub && isArtist;
  const currentUrl = window.location.href;
  const router = useRouter();
  const href =
    publicView && !openCall
      ? `/thelist/event/${slug}/${edition}`
      : publicView && openCall === "active"
        ? "/pricing?type=artist"
        : !publicView && openCall
          ? `/thelist/event/${slug}/${edition}/call${openCall === "active" ? "" : "?tab=event"}`
          : `/thelist/event/${slug}/${edition}`;

  const buttonText =
    openCall === "coming-soon"
      ? "Coming Soon!"
      : appStatus && !publicView && hasValidSub
        ? "Applied"
        : "Read More";
  function runAnalytics(action: "bookmark" | "view" | "apply") {
    if (isAdmin || isUserOrg) return;

    updateEventAnalytics({
      eventId,
      plan: user?.plan ?? 0,
      action,
      src,
      userType: user?.accountType,
      hasSub: activeSub,
    });
  }
  return (
    <>
      {/* //removing the target attribute for now as it's not really necessary, I think. The params are all in the url when you view something, so you should go back to that exact same page/filter combo */}

      <Button
        asChild
        onClick={() => {
          runAnalytics("view");
          window.history.pushState({}, "", currentUrl);
          // sessionStorage.setItem("previousSalPage", window.location.pathname);
          router.push(href);
        }}
        variant="salWithShadowHidden"
        size="lg"
        className={cn(
          "w-full min-w-[100px] cursor-pointer bg-white",
          className,
          appStatus !== null &&
            !publicView &&
            "border-foreground/50 bg-background text-foreground/50",
        )}
      >
        <span className="flex items-center gap-x-1">
          {buttonText}
          {appFee > 0 && (
            <CircleDollarSignIcon
              className={cn(
                "size-6 text-red-600",
                appStatus !== null && "text-foreground/50",
              )}
            />
          )}
        </span>
      </Button>
    </>
  );
};

interface ApplyButtonProps {
  id: Id<"events">;
  event: EventData;
  openCallId: Id<"openCalls"> | null;
  openCallState: OpenCallState | null;
  mainOrgId: Id<"organizations">;
  isUserOrg: boolean;

  slug: string;
  appUrl?: string | null;
  appLinkformat?: string;
  edition: number;
  finalButton?: boolean;
  appStatus: ApplicationStatus | null;
  // setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  isBookmarked: boolean;
  setIsBookmarked?: React.Dispatch<React.SetStateAction<boolean>>;
  isHidden: boolean;
  // setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  eventCategory: EventCategory;
  appFee: number;
  isPreview?: boolean;
  publicView?: boolean;
  openCall: OpenCallStatus;
  className?: string;
  detailCard?: boolean;
  publicPreview?: boolean;
  orgPreview?: boolean;
  userPref?: UserPrefsType | null;
  user?: User | null;
  activeSub: boolean;
  callType?: CallType;
  fontSize?: string;
  src: AnalyticsSrcType;
}

export const ApplyButton = ({
  id,
  event,
  openCallId,
  openCallState,
  mainOrgId,
  isUserOrg,

  slug,
  appUrl,
  appLinkformat,
  user,
  userPref,
  activeSub,
  //isExternalApply, //todo: think about this. Could just use appUrl if it exists to gather the same assumption and user outcome.

  appStatus,
  // setManualApplied,
  isBookmarked,
  setIsBookmarked,
  // setIsHidden,
  isHidden,
  eventCategory,
  appFee,
  openCall,
  publicView,
  orgPreview,
  isPreview = false,
  className,
  detailCard,
  edition,
  finalButton,
  publicPreview,
  callType,
  fontSize = "text-sm",
  src,
}: ApplyButtonProps) => {
  const autoApply = userPref?.autoApply ?? true;
  const updateEventAnalytics = useMutation(
    api.analytics.eventAnalytics.markEventAnalytics,
  );
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const isEmail = callType === "Email" || appLinkformat === "mailto:";
  const noSub = !activeSub && (publicPreview || publicView || finalButton);

  const isArtist = user?.accountType?.includes("artist");
  const hasValidSub = activeSub && isArtist;

  const isAdmin = user?.role?.includes("admin") || false;
  const nonArtistAdmin = isAdmin && !isArtist;
  // console.log("noSub: ", noSub);
  const { toggleListAction } = useToggleListAction(id as Id<"events">);
  const [pending, setPending] = useState<"load" | "apply" | "bookmark" | false>(
    false,
  );
  const finalAppUrl = appUrl?.trim() ? appUrl : "/thelist";

  const showContextMenu = !(
    ((isUserOrg && !isAdmin) || nonArtistAdmin) &&
    finalButton
  );

  function runAnalytics(
    action: "bookmark" | "view" | "apply",
    src: AnalyticsSrcType,
  ) {
    if (isAdmin || isUserOrg) return;

    updateEventAnalytics({
      eventId: id,
      plan: user?.plan ?? 0,
      action,
      src,
      userType: user?.accountType,
      hasSub: activeSub,
    });
  }

  const onBookmark = async () => {
    if (orgPreview) return;
    if (setIsBookmarked) setIsBookmarked(!isBookmarked);
    try {
      setPending("bookmark");
      await toggleListAction({ bookmarked: !isBookmarked });
    } catch (error) {
      console.error("Error updating bookmark:", error);
    } finally {
      setTimeout(() => setPending(false), 1000);
    }

    try {
      await updateUserLastActive({ email: user?.email ?? "" });
    } catch (error) {
      console.error("Error updating last active:", error);
    } finally {
      if (isBookmarked) return;
      runAnalytics("bookmark", finalButton ? "ocPage" : "theList");
    }
  };
  const router = useRouter();

  const currentUrl = window.location.href;
  const href =
    detailCard && appUrl
      ? appUrl
      : publicView && !openCall
        ? `/thelist/event/${slug}/${edition}`
        : publicView && openCall === "active"
          ? "/pricing?type=artist"
          : !publicView && openCall
            ? `/thelist/event/${slug}/${edition}/call${openCallState === "published" ? "" : "?tab=event"}`
            : `/thelist/event/${slug}/${edition}`;
  const buttonText =
    openCall === "active"
      ? appStatus !== null && hasValidSub
        ? appStatus.slice(0, 1).toUpperCase() + appStatus.slice(1).toLowerCase()
        : isPreview
          ? "Read More"
          : orgPreview
            ? "Test Apply"
            : isEmail
              ? "Send Email"
              : nonArtistAdmin
                ? `Edit ${getEventCategoryLabel(eventCategory, true)}`
                : "Apply"
      : openCall === "ended"
        ? appStatus !== null && hasValidSub
          ? appStatus.slice(0, 1).toUpperCase() +
            appStatus.slice(1).toLowerCase()
          : orgPreview || nonArtistAdmin
            ? `Edit ${getEventCategoryLabel(eventCategory, true)}`
            : "Read More"
        : orgPreview || nonArtistAdmin
          ? `Edit ${getEventCategoryLabel(eventCategory, true)}`
          : "Read More";
  const hasApplied = appStatus !== null && hasValidSub;

  return (
    <div
      className={cn(
        "col-span-full mt-4 flex h-14 max-w-[80dvw] items-center justify-center sm:h-11 sm:max-w-75 lg:mt-0",
        !detailCard && "lg:w-[250px]",
        detailCard && "lg:mt-2 lg:w-full",
        className,
      )}
    >
      {!finalButton && (
        <Button
          onClick={() => {
            setPending("load");
            runAnalytics("view", src ?? "theList");
            window.history.pushState({}, "", currentUrl);
            router.push(href);
            setTimeout(() => setPending(false), 2000);
          }}
          // disabled={pending}
          variant="salWithShadowHiddenLeft"
          size="lg"
          className={cn(
            "relative z-[1] w-full cursor-pointer xl:max-w-[150px]",
            hasApplied &&
              "border-foreground/50 bg-background text-foreground/50 hover:shadow-llga",
            pending && "pointer-events-none",
          )}
        >
          <span className={cn("flex items-center gap-x-1", fontSize)}>
            {pending === "load" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <>
                {buttonText}
                {appFee > 0 && !publicView && (
                  <CircleDollarSignIcon
                    className={cn(
                      "size-6 text-red-600",
                      appStatus !== null && "text-foreground/50",
                    )}
                  />
                )}
              </>
            )}
          </span>
        </Button>
      )}
      {finalButton && (
        <ApplyRedirectDialog
          userProps={{
            user,
            appStatus,
            autoApply,
            isUserOrg,
          }}
          buttonProps={{
            publicView,
            orgPreview,
            disabled: Boolean(
              (openCall !== "active" && !isAdmin && !orgPreview) ||
              (noSub && !isAdmin && !orgPreview),
            ),
            buttonText,
          }}
          openCallProps={{
            eventId: id,
            openCallId,
            appFee,
            openCallStatus: openCall,
            format: isEmail ? "mailto" : "https",
            finalAppUrl,
          }}
        />
      )}

      {!orgPreview && !hasApplied && !nonArtistAdmin && (
        <TooltipSimple
          content={isBookmarked ? "Remove Bookmark" : "Bookmark"}
          side="top"
        >
          <Button
            disabled={!hasValidSub && !isAdmin}
            variant={
              showContextMenu
                ? "salWithShadowHiddenVert"
                : "salWithShadowHiddenRight"
            }
            className={cn(
              "h-14 w-fit px-4 sm:px-3 [&_svg]:size-6",
              pending ? "pointer-events-none" : "",
            )}
            onClick={onBookmark}
          >
            {isBookmarked && hasValidSub ? (
              <FaBookmark className="size-7 text-red-500" />
            ) : (
              <FaRegBookmark className="size-7" />
            )}
          </Button>
        </TooltipSimple>
      )}
      {!orgPreview && hasApplied && isArtist && (
        <Button
          variant="salWithoutShadow"
          size="lg"
          className={cn(
            "pointer-events-none relative z-[2] h-14 w-fit rounded-none border-x border-foreground/50 bg-background px-4 text-foreground/50 hover:bg-background sm:h-11 sm:px-3 [&_svg]:size-6",
          )}
        >
          <CheckCircleIcon className="text-emerald-600 sm:size-5" />
        </Button>
      )}

      {showContextMenu && (
        <EventContextMenu
          event={event}
          eventId={id}
          isUserOrg={isUserOrg && !finalButton}
          mainOrgId={mainOrgId}
          openCallId={openCallId}
          openCallState={openCallState}
          // onHide={onHide}
          isHidden={isHidden}
          // setIsHidden={setIsHidden}
          publicView={publicView || noSub}
          appLink={appUrl}
          appStatus={appStatus}
          eventCategory={eventCategory}
          openCallStatus={openCall}
          // setManualApplied={setManualApplied}
          buttonTrigger={true}
          align="end"
          isBookmarked={isBookmarked}
          orgPreview={orgPreview}
          postStatus={event.posted}
          postOptions={isAdmin}
        />
      )}
    </div>
  );
};
