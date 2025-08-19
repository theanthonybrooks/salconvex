import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SubmissionFormState } from "@/types/event";

import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

import {
  Eye,
  LucideFolderCheck,
  LucideFolderClock,
  LucideFolderInput,
} from "lucide-react";
import { useState } from "react";
import { FaRegCopy, FaRegTrashCan } from "react-icons/fa6";

export interface EventActionProps {
  eventId: string;
}

export interface CopyActionProps extends EventActionProps {
  displayText?: string;
}
interface DeleteEventActionProps extends EventActionProps {
  isAdmin: boolean | undefined;
}

interface SubmittedActionProps extends EventActionProps {
  state: SubmissionFormState;
}

interface ToEventActionProps {
  slug: string;
  edition: number;
  hasOpenCall: boolean;
}

export const GoToEvent = ({
  slug,
  edition,
  hasOpenCall,
}: ToEventActionProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        window.location.href = `/thelist/event/${slug}/${edition}${hasOpenCall ? "/call" : ""}`;
      }}
      className="flex items-center gap-x-1"
    >
      <Eye className="size-4" />
      View Event
    </DropdownMenuItem>
  );
};

export const DuplicateEvent = ({ eventId }: EventActionProps) => {
  const duplicateEvent = useMutation(api.events.event.duplicateEvent);
  return (
    <DropdownMenuItem
      onClick={() => {
        duplicateEvent({ eventId: eventId as Id<"events"> });
      }}
      className="flex items-center gap-x-1"
    >
      <FaRegCopy className="size-4" />
      Duplicate
    </DropdownMenuItem>
  );
};

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
      className="flex items-center gap-x-1"
    >
      <FaRegTrashCan className="size-4" />
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
      className="flex items-center gap-x-1"
    >
      <LucideFolderClock className="size-4" />
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
      className="flex items-center gap-x-1"
    >
      <LucideFolderInput className="size-4" />
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
      className="flex items-center gap-x-1"
    >
      <LucideFolderCheck className="size-4" />
      Approve
    </DropdownMenuItem>
  );
};

export const CopyEventId = ({ eventId, displayText }: CopyActionProps) => {
  const [copied, setCopied] = useState(false);
  const displayVal = displayText ?? eventId;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span
      className="max-w-[20ch] truncate font-medium capitalize"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : displayVal}
    </span>
  );
};
