import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SubmissionFormState } from "@/types/event";

import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export interface EventActionProps {
  eventId: string;
}
interface DeleteEventActionProps extends EventActionProps {
  isAdmin: boolean | undefined;
}

interface SubmittedActionProps extends EventActionProps {
  state: SubmissionFormState;
}

export const DeleteEvent = ({ eventId, isAdmin }: DeleteEventActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteEvent = useMutation(api.events.event.deleteEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        confirm({
          label: isAdmin ? "Delete Event & Open Calls" : "Delete Event",
          description: isAdmin
            ? "Are you sure you want to delete this event? This will also delete any associated open calls."
            : "Are you sure you want to delete this event? You can only delete drafts and any published events will be archived.",
          onConfirm: () => {
            deleteEvent({ eventId: eventId as Id<"events">, isAdmin });
          },
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
};

export const ArchiveEvent = ({ eventId }: EventActionProps) => {
  const archiveEvent = useMutation(api.events.event.archiveEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        archiveEvent({ eventId: eventId as Id<"events"> });
      }}
    >
      Archive
    </DropdownMenuItem>
  );
};

export const ReactivateEvent = ({ eventId, state }: SubmittedActionProps) => {
  const activateEvent = useMutation(api.events.event.reactivateEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        activateEvent({ eventId: eventId as Id<"events"> });
      }}
    >
      {state === "archived" ? "Activate" : "Change to Submitted"}
    </DropdownMenuItem>
  );
};

export const ApproveEvent = ({ eventId }: EventActionProps) => {
  const approveEvent = useMutation(api.events.event.approveEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        approveEvent({ eventId: eventId as Id<"events"> });
      }}
    >
      Approve
    </DropdownMenuItem>
  );
};
