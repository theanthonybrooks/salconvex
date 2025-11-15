import { EventCategory, SubmissionFormState } from "@/types/eventTypes";

import { useState } from "react";
import { toast } from "react-toastify";

import { FaRegCopy, FaRegTrashCan } from "react-icons/fa6";
import {
  Eye,
  Image as ImageIcon,
  LucideFolderCheck,
  LucideFolderClock,
  LucideFolderInput,
} from "lucide-react";

import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getEventCategoryLabel } from "@/helpers/eventFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

export interface EventActionProps {
  eventId: Id<"events">;
}

export interface DuplicateEventProps extends EventActionProps {
  onDuplicate: () => void;
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

interface BaseEventActionProps {
  slug: string;
  edition: number;
}

interface ToEventActionProps extends BaseEventActionProps {
  hasOpenCall: boolean;
  category: EventCategory;
  general?: boolean;
}

export const GoToEvent = ({
  slug,
  edition,
  hasOpenCall,
  category,
  general,
}: ToEventActionProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        const linkPath = `/thelist/event/${slug}/${edition}${hasOpenCall ? "/call" : ""}`;
        window.open(linkPath, "_blank");
      }}
      className="flex items-center gap-x-1"
    >
      <Eye className="size-4" />
      View{" "}
      {general
        ? "Listing"
        : hasOpenCall
          ? "Open Call"
          : getEventCategoryLabel(category, true)}
    </DropdownMenuItem>
  );
};

export const GoToSocialPost = ({ slug, edition }: BaseEventActionProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        const linkPath = `/thelist/event/${slug}/${edition}/call/social`;
        window.open(linkPath, "_blank");
      }}
      className="flex items-center gap-x-1"
    >
      <ImageIcon className="size-4" />
      View Socials
    </DropdownMenuItem>
  );
};

export const DuplicateEvent = ({
  eventId,
  onDuplicate,
}: DuplicateEventProps) => {
  const duplicateEvent = useMutation(api.events.event.duplicateEvent);
  const handleDuplicate = async () => {
    try {
      await duplicateEvent({ eventId: eventId as Id<"events"> });
      onDuplicate();
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
  console.log(eventId, isAdmin);
  const handleDelete = async () => {
    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };
  return (
    <DropdownMenuItem
      // onClick={() => {
      //   confirm({
      //     label: isAdmin ? "Delete Event & Open Calls" : "Delete Event",
      //     description: isAdmin
      //       ? "Are you sure you want to delete this event? This will also delete any associated open calls."
      //       : "Are you sure you want to delete this event? You can only delete drafts and any published events will be archived.",
      //     onConfirm: handleDelete,
      //   });
      // }}
      onSelect={(e) => {
        e.preventDefault(); // keeps dropdown open
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
      if (state === "published") {
        toast.success("Event changed to Submitted!");
      } else {
        toast.success("Event reactivated!");
      }
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
