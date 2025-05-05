import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface DeleteEventProps {
  eventId: string;
}

export const DeleteEvent = ({ eventId }: DeleteEventProps) => {
  const deleteEvent = useMutation(api.events.event.deleteEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        deleteEvent({ eventId: eventId as Id<"events"> });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
};

export const ArchiveEvent = ({ eventId }: DeleteEventProps) => {
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

export const ReactivateEvent = ({ eventId }: DeleteEventProps) => {
  const activateEvent = useMutation(api.events.event.reactivateEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        activateEvent({ eventId: eventId as Id<"events"> });
      }}
    >
      Activate
    </DropdownMenuItem>
  );
};

export const ApproveEvent = ({ eventId }: DeleteEventProps) => {
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
