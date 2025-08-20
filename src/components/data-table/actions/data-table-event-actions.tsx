import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventCategory, SubmissionFormState } from "@/types/event";

import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import {
  Eye,
  LucideFolderCheck,
  LucideFolderClock,
  LucideFolderInput,
} from "lucide-react";
import { useState } from "react";
import { FaRegCopy, FaRegTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";

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
  category: EventCategory;
}

export const GoToEvent = ({
  slug,
  edition,
  hasOpenCall,
  category,
}: ToEventActionProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        window.location.href = `/thelist/event/${slug}/${edition}${hasOpenCall ? "/call" : ""}`;
      }}
      className="flex items-center gap-x-1"
    >
      <Eye className="size-4" />
      View {getEventCategoryLabelAbbr(category)}
    </DropdownMenuItem>
  );
};

export const DuplicateEvent = ({ eventId }: EventActionProps) => {
  const duplicateEvent = useMutation(api.events.event.duplicateEvent);
  const handleDuplicate = async () => {
    try {
      await duplicateEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event duplicated!");
    } catch (error) {
      console.error("Failed to duplicate event:", error);
      toast.error("Failed to duplicate event");
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleDuplicate}
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

  const handleDelete = async () => {
    try {
      await deleteEvent({ eventId: eventId as Id<"events">, isAdmin });
      toast.success("Event deleted!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };
  return (
    <DropdownMenuItem
      onClick={() => {
        confirm({
          label: isAdmin ? "Delete Event & Open Calls" : "Delete Event",
          description: isAdmin
            ? "Are you sure you want to delete this event? This will also delete any associated open calls."
            : "Are you sure you want to delete this event? You can only delete drafts and any published events will be archived.",
          onConfirm: handleDelete,
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
  const handleArchive = async () => {
    try {
      await archiveEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event archived!");
    } catch (error) {
      console.error("Failed to archive event:", error);
      toast.error("Failed to archive event");
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleArchive}
      className="flex items-center gap-x-1"
    >
      <LucideFolderClock className="size-4" />
      Archive
    </DropdownMenuItem>
  );
};

export const ReactivateEvent = ({ eventId, state }: SubmittedActionProps) => {
  const activateEvent = useMutation(api.events.event.reactivateEvent);
  const handleReactivate = async () => {
    try {
      await activateEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event reactivated!");
    } catch (error) {
      console.error("Failed to reactivate event:", error);
      toast.error("Failed to reactivate event");
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleReactivate}
      className="flex items-center gap-x-1"
    >
      <LucideFolderInput className="size-4" />
      {state === "archived" ? "Activate" : "Change to Submitted"}
    </DropdownMenuItem>
  );
};

export const ApproveEvent = ({ eventId }: EventActionProps) => {
  const approveEvent = useMutation(api.events.event.approveEvent);
  const handleApprove = async () => {
    try {
      await approveEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event approved!");
    } catch (error) {
      console.error("Failed to approve event:", error);
      toast.error("Failed to approve event");
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleApprove}
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
    toast.success("Event ID copied!");
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
