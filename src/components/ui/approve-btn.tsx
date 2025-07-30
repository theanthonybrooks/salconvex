import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubmissionFormState as EventState } from "@/types/event";
import { SubmissionFormState as OpenCallState } from "@/types/openCall";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ApproveBtnProps {
  eventState?: EventState;
  openCallState?: OpenCallState;
  eventId: string;
  openCallId?: string;
}

export const ApproveBtn = ({
  eventState,
  openCallState,
  eventId,
  openCallId,
}: ApproveBtnProps) => {
  const eventSubmitted = eventState === "submitted";
  const openCallSubmitted = openCallState === "submitted";
  const bothSubmitted = eventSubmitted && openCallSubmitted;
  const approveEvent = useMutation(api.events.event.approveEvent);
  const approveOC = useMutation(api.openCalls.openCall.changeOCStatus);
  const buttonClass = "w-full";
  return (
    <>
      {bothSubmitted && (
        <Button
          variant="salWithShadowHiddenBg"
          onClick={() =>
            approveOC({
              openCallId: openCallId as Id<"openCalls">,
              newStatus: "published",
              target: "both",
            })
          }
          className={cn(buttonClass)}
        >
          Approve Both
        </Button>
      )}
      {eventSubmitted && !openCallSubmitted && (
        <Button
          variant="salWithShadowHiddenBg"
          onClick={() => {
            approveEvent({ eventId: eventId as Id<"events"> });
          }}
          className={cn(buttonClass)}
        >
          Approve Event
        </Button>
      )}
      {openCallSubmitted && !eventSubmitted && (
        <Button
          variant="salWithShadowHiddenBg"
          onClick={() => {
            approveOC({
              openCallId: openCallId as Id<"openCalls">,
              newStatus: "published",
            });
          }}
          className={cn(buttonClass)}
        >
          Approve Open Call
        </Button>
      )}
    </>
  );
};
