import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TooltipSimple } from "@/components/ui/tooltip";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";
import { EventCategory, SubmissionFormState } from "@/types/eventTypes";
import { OpenCallState } from "@/types/openCallTypes";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  DollarSign,
  LucidePencil,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FaRegCopy, FaRegFloppyDisk } from "react-icons/fa6";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
interface EventActionProps {
  eventId: string;
}
interface DataTableAdminProps extends EventActionProps {
  userRole?: "user" | "admin";
}

interface OrgDuplicateOCActionProps {
  openCallId: string;
}
interface OrgDuplicateEventActionProps extends EventActionProps {
  category: EventCategory;
}

interface DataTableAdminStateProps extends DataTableAdminProps {
  state: SubmissionFormState | OpenCallState;
  clickThrough?: boolean;
}

export const DataTableAdminOrgActions = ({
  eventId,
  userRole,
}: DataTableAdminProps) => {
  const router = useRouter();
  const isAdmin = userRole === "admin";

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          if (isAdmin) {
            router.push(`/dashboard/admin/event?_id=${eventId}`);
          } else {
            router.push(`/dashboard/organizer/update-event?_id=${eventId}`);
          }
        }}
        className="flex items-center gap-x-2"
      >
        <LucidePencil className="size-4" /> Edit
      </DropdownMenuItem>
    </>
  );
};

export const DataTableAdminOrgStateActions = ({
  eventId,
  userRole,
  state,
  clickThrough = false,
}: DataTableAdminStateProps) => {
  const router = useRouter();
  const isAdmin = userRole === "admin";
  const editTrigger = state === "draft" || state === "pending";
  // const updateTrigger = state === "submitted" || state === "published";

  return (
    <TooltipSimple
      content={`Click to ${editTrigger ? "Edit" : "Update"}`}
      side="top"
      disabled={!state || !clickThrough}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (clickThrough) {
            if (isAdmin) {
              router.push(`/dashboard/admin/event?_id=${eventId}`);
            } else {
              router.push(`/dashboard/organizer/update-event?_id=${eventId}`);
            }
          }
        }}
        className={cn(
          "flex w-max min-w-30 items-center justify-center gap-1 rounded p-2 px-4",
          state && "border",
          state === "draft" && "bg-orange-200",
          state === "pending" && "bg-red-100",
          state === "submitted" && "bg-blue-200",
          state === "published" && "bg-green-200",
          state && clickThrough && "hover:scale-105 active:scale-95",
        )}
      >
        {state ? (
          state === "draft" ? (
            <FaRegFloppyDisk className="size-4 shrink-0" />
          ) : state === "editing" ? (
            <Pencil className="size-4 shrink-0" />
          ) : state === "submitted" ? (
            <Circle className="size-4 shrink-0" />
          ) : state === "pending" ? (
            <DollarSign className="size-4 shrink-0" />
          ) : state === "published" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : state === "initial" ? (
            <CircleDashed className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )
        ) : null}
        <span className="capitalize">
          {state === "pending"
            ? "Unpaid"
            : state === "initial"
              ? "Started"
              : state || "-"}
        </span>
      </div>
    </TooltipSimple>
  );
};

export const OrgDuplicateOC = ({ openCallId }: OrgDuplicateOCActionProps) => {
  const duplicateOC = useMutation(api.openCalls.openCall.duplicateOC);
  const router = useRouter();

  const handleOpenCallDuplicate = async () => {
    let newEventId = null;
    try {
      const result = await duplicateOC({
        openCallId: openCallId as Id<"openCalls">,
      });
      toast.success("Open call duplicated successfully!", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
      newEventId = result?.event;
    } catch (error) {
      if (error instanceof ConvexError) {
        // console.error(error.data);
        toast.error(error.data ?? "Failed to duplicate open call");
        return;
      }
      console.error("Failed to duplicate open call:", error);
    } finally {
      router.push(`/dashboard/organizer/update-event?_id=${newEventId}`);
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleOpenCallDuplicate}
      className="flex items-center gap-x-1"
    >
      <FaRegCopy className="size-4" />
      Duplicate Open Call
    </DropdownMenuItem>
  );
};

export const OrgDuplicateEvent = ({
  eventId,
  category,
}: OrgDuplicateEventActionProps) => {
  const duplicateEvent = useMutation(api.events.event.duplicateEvent);
  const router = useRouter();

  const handleEventDuplicate = async () => {
    let newEventId = null;
    try {
      const result = await duplicateEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event duplicated successfully!", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
      newEventId = result?.event;
    } catch (error) {
      if (error instanceof ConvexError) {
        // console.error(error.data);
        toast.error(error.data ?? "Failed to duplicate event");
        return;
      }
      console.error("Failed to duplicate event:", error);
    } finally {
      router.push(`/dashboard/organizer/update-event?_id=${newEventId}`);
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleEventDuplicate}
      className="flex items-center gap-x-1"
    >
      <FaRegCopy className="size-4" />
      Duplicate {getEventCategoryLabel(category, true)}
    </DropdownMenuItem>
  );
};
