import { Button } from "@/components/ui/button";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/applications";
import {
  EventCategory,
  SubmissionFormState as EventState,
} from "@/types/event";
import { OpenCallState, OpenCallStatus } from "@/types/openCall";
import { User } from "@/types/user";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ApproveBtnProps {
  user: User | null;
  orgId: Id<"organizations">;
  eventId: string;
  eventState?: EventState;
  eventCategory: EventCategory;
  openCallId?: string;
  openCallState?: OpenCallState;
  openCallStatus: OpenCallStatus;
  appLink?: string;
  appStatus: ApplicationStatus | null;
  isHidden: boolean;
  isOwner: boolean;
}

export const ApproveBtn = ({
  user,
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
  isOwner,
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
  // const somethingSubmitted =
  //   eventSubmitted || openCallSubmitted || bothSubmitted;
  const eventPublished = eventState === "published";
  const bothPublished = eventPublished && openCallState === "published";

  const handleCopy = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
  };

  return (
    <div className="flex w-full flex-col items-center gap-y-2">
      <p className="text-sm">
        {isAdmin ? "Admin Only Actions" : "Organization Actions"}
      </p>
      <div className="flex w-full items-center justify-center">
        {isAdmin && (
          <Button
            variant="salWithShadowHiddenLeft"
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
                handleCopy(eventId);
                window.open(
                  `${process.env.NEXT_PUBLIC_CONVEX_DASHBOARD_URL}data?table=events`,
                  "_blank",
                  "noopener, noreferrer",
                );
              }
            }}
            className={cn("w-full rounded-r-none border-r")}
          >
            {bothSubmitted
              ? "Approve Both"
              : eventSubmitted
                ? "Approve Event"
                : openCallSubmitted
                  ? "Approve Open Call"
                  : "Go to Convex"}
          </Button>
        )}
        {isOwner && !isAdmin && (
          <Button
            variant="salWithShadowHiddenLeft"
            onClick={() => {
              if (!openCallId && bothPublished && appLink) {
                window.location.href = appLink;
              } else {
                router.push(`/dashboard/organizer/update-event?_id=${eventId}`);
              }
            }}
            className={cn("w-full rounded-r-none border-r")}
          >
            {bothDraft || openCallDraft
              ? "Finish Open Call"
              : eventDraft
                ? "Finish Event"
                : bothSubmitted || eventSubmitted
                  ? `Update ${getEventCategoryLabelAbbr(eventCategory)}`
                  : openCallSubmitted
                    ? "Update Open Call"
                    : bothPublished
                      ? "Test Link"
                      : `Update ${getEventCategoryLabelAbbr(eventCategory)}`}
          </Button>
        )}

        <EventContextMenu
          user={user}
          mainOrgId={orgId}
          eventId={eventId}
          openCallId={openCallId ?? ""}
          appLink={appLink}
          appStatus={appStatus}
          eventState={eventState}
          openCallState={openCallState}
          openCallStatus={openCallStatus}
          isHidden={isHidden}
          eventCategory={eventCategory}
          buttonTrigger={true}
          align="end"
          reviewMode={true}
        />
      </div>
    </div>
  );
};
