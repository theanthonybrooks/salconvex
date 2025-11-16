import { ApplicationStatus } from "@/types/applications";
import {
  EventCategory,
  EventData,
  SubmissionFormState as EventState,
} from "@/types/eventTypes";
import { OpenCallState, OpenCallStatus } from "@/types/openCallTypes";
import { User } from "@/types/user";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface ApproveBtnProps {
  user: User | null;
  orgId: Id<"organizations">;
  event: EventData;
  eventId: Id<"events">;
  eventState?: EventState;
  eventCategory: EventCategory;
  openCallId?: Id<"openCalls"> | null;
  openCallState?: OpenCallState;
  openCallStatus: OpenCallStatus;
  appLink?: string | null;
  appStatus: ApplicationStatus | null;
  isHidden: boolean;
  isUserOrg: boolean;
  className?: string;
}

export const ApproveBtn = ({
  user,
  event,
  eventState,
  openCallState,
  eventId,
  openCallId,
  orgId,
  openCallStatus,
  appStatus,
  appLink,
  eventCategory,
  isHidden,
  isUserOrg,
  className,
}: ApproveBtnProps) => {
  const router = useRouter();
  const eventDraft = eventState === "draft";
  const openCallDraft = openCallState === "draft";
  const bothDraft = eventDraft && openCallDraft;
  const eventSubmitted = eventState === "submitted";
  const openCallSubmitted = openCallState === "submitted";
  const bothSubmitted = eventSubmitted && openCallSubmitted;
  const approveEvent = useMutation(api.events.event.approveEvent);
  const approveOC = useMutation(api.openCalls.openCall.changeOCStatus);
  const isAdmin = user?.role?.includes("admin") || false;
  const isArtist = user?.accountType?.includes("artist");
  // const somethingSubmitted =
  //   eventSubmitted || openCallSubmitted || bothSubmitted;
  const eventPublished = eventState === "published";
  const bothPublished = eventPublished && openCallState === "published";
  const showContextMenu =
    (isAdmin && !isArtist) ||
    (isAdmin && openCallId && !bothPublished) ||
    (isAdmin && !openCallId) ||
    !eventPublished ||
    !isAdmin;

  const handleCopy = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
  };

  return (
    <div className={cn("flex w-full flex-col items-center gap-y-2", className)}>
      <p className="text-sm">
        {isAdmin ? "Admin Only Actions" : "Organization Actions"}
      </p>
      <div className={cn("flex w-full items-center justify-center")}>
        {isAdmin && (
          <Button
            variant={
              showContextMenu
                ? "salWithShadowHiddenLeft"
                : "salWithShadowHidden"
            }
            onClick={() => {
              if (bothSubmitted) {
                approveOC({
                  openCallId: openCallId as Id<"openCalls">,
                  newStatus: "published",
                  target: "both",
                });
                return;
              }
              if (eventSubmitted && !openCallSubmitted) {
                approveEvent({ eventId: eventId as Id<"events"> });
                return;
              }
              if (openCallSubmitted && !eventSubmitted) {
                approveOC({
                  openCallId: openCallId as Id<"openCalls">,
                  newStatus: "published",
                });
                return;
              }
              if (eventPublished) {
                const dbPath = `/dashboard/admin/event?_id=${eventId}`;
                handleCopy(eventId);
                if (isArtist) {
                  window.open(
                    `${process.env.NEXT_PUBLIC_CONVEX_DASHBOARD_URL}data?table=events`,
                    "_blank",
                    "noopener, noreferrer",
                  );
                } else {
                  window.open(dbPath, "_blank", "noopener, noreferrer");
                }
              }
            }}
            className={cn("w-full")}
          >
            {bothSubmitted
              ? "Approve Both"
              : eventSubmitted
                ? "Approve Event"
                : openCallSubmitted
                  ? "Approve Open Call"
                  : !isArtist
                    ? "Edit Listing"
                    : "Go to Convex"}
          </Button>
        )}
        {isUserOrg && !isAdmin && (
          <Button
            variant={
              showContextMenu
                ? "salWithShadowHiddenLeft"
                : "salWithShadowHidden"
            }
            onClick={() => {
              // if (!openCallId && bothPublished && appLink) {
              //   window.location.href = appLink;
              // } else {
              router.push(`/dashboard/organizer/update-event?_id=${eventId}`);
              // }
            }}
            className={cn("w-full")}
          >
            {bothDraft || openCallDraft
              ? "Finish Open Call"
              : eventDraft
                ? "Finish Event"
                : bothSubmitted || eventSubmitted
                  ? `Update ${getEventCategoryLabel(eventCategory, true)}`
                  : openCallSubmitted
                    ? "Update Open Call"
                    : bothPublished
                      ? `Edit ${getEventCategoryLabel(eventCategory, true)}`
                      : `Edit ${getEventCategoryLabel(eventCategory, true)}`}
          </Button>
        )}
        {showContextMenu && (
          <EventContextMenu
            isUserOrg={isUserOrg}
            mainOrgId={orgId}
            event={event}
            eventId={eventId}
            openCallId={openCallId ?? null}
            appLink={appLink}
            appStatus={appStatus}
            eventState={eventState}
            openCallState={openCallState ?? null}
            openCallStatus={openCallStatus}
            isHidden={isHidden}
            eventCategory={eventCategory}
            buttonTrigger={true}
            align="end"
            reviewMode={true}
            type="admin"
            postStatus={event.posted}
            postOptions={isAdmin && !isArtist}
          />
        )}
      </div>
    </div>
  );
};
