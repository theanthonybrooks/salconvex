import { Button } from "@/components/ui/button";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/applications";
import {
  EventCategory,
  SubmissionFormState as EventState,
} from "@/types/event";
import {
  SubmissionFormState as OpenCallState,
  OpenCallStatus,
} from "@/types/openCall";
import { User } from "@/types/user";
import { useMutation } from "convex/react";
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
  appStatus: ApplicationStatus | null;
  isHidden: boolean;
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
  eventCategory,
  isHidden,
}: ApproveBtnProps) => {
  const eventSubmitted = eventState === "submitted";
  const openCallSubmitted = openCallState === "submitted";
  const bothSubmitted = eventSubmitted && openCallSubmitted;
  const approveEvent = useMutation(api.events.event.approveEvent);
  const approveOC = useMutation(api.openCalls.openCall.changeOCStatus);
  const somethingSubmitted =
    eventSubmitted || openCallSubmitted || bothSubmitted;

  return (
    somethingSubmitted && (
      <div className="flex flex-col items-center gap-y-2">
        <p className="text-sm">Admin Only Actions</p>
        <div className="flex w-full items-center justify-center">
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
            }}
            className={cn("w-full rounded-r-none border-r")}
          >
            Approve Both
          </Button>

          <EventContextMenu
            user={user}
            mainOrgId={orgId}
            eventId={eventId}
            openCallId={openCallId ?? ""}
            appStatus={appStatus}
            openCallStatus={openCallStatus}
            isHidden={isHidden}
            eventCategory={eventCategory}
            buttonTrigger={true}
            align="end"
            reviewMode={true}
          />
        </div>
      </div>
    )
  );
};
