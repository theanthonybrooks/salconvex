import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SubmissionFormState } from "@/types/event";
import { SubmissionFormState as OpenCallState } from "@/types/openCall";
import { CheckCircle2, Circle, DollarSign, LucidePencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaRegFloppyDisk } from "react-icons/fa6";
import { Id } from "~/convex/_generated/dataModel";

interface DataTableAdminProps {
  eventId: Id<"events">;
  userRole?: "user" | "admin";
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
          ) : state === "submitted" ? (
            <Circle className="size-4 shrink-0" />
          ) : state === "pending" ? (
            <DollarSign className="size-4 shrink-0" />
          ) : state === "published" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )
        ) : null}
        <span className="capitalize">
          {state === "pending" ? "Unpaid" : state || "-"}
        </span>
      </div>
    </TooltipSimple>
  );
};
