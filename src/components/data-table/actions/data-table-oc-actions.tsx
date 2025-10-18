import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { OpenCallState } from "@/types/openCallTypes";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { LucideFolderCheck, LucideFolderInput } from "lucide-react";
import { FaCheckDouble, FaRegCopy, FaRegTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface OCActionProps {
  openCallId: string;
}

interface SubmittedOCProps extends OCActionProps {
  state: OpenCallState;
}

interface DeleteOCActionProps extends OCActionProps {
  isAdmin: boolean | undefined;
  dashboardView?: boolean;
}

export const DuplicateOC = ({ openCallId }: OCActionProps) => {
  const duplicateOC = useMutation(api.openCalls.openCall.duplicateOC);

  const handleOpenCallDuplicate = async () => {
    try {
      await duplicateOC({ openCallId: openCallId as Id<"openCalls"> });
      toast.success("Open call duplicated successfully!", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        // console.error(error.data);
        toast.error(error.data ?? "Failed to duplicate open call");
        return;
      }
      console.error("Failed to duplicate open call:", error);
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleOpenCallDuplicate}
      className="flex items-center gap-x-1"
    >
      <FaRegCopy className="size-4" />
      Duplicate
    </DropdownMenuItem>
  );
};

export const DeleteOC = ({
  openCallId,
  isAdmin,
  dashboardView = true,
}: DeleteOCActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteOC = useMutation(api.openCalls.openCall.deleteOC);
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        if (dashboardView) {
          confirm({
            label: "Delete Open Call",
            description: "Are you sure you want to delete this open call?",
            onConfirm: () => {
              deleteOC({ openCallId: openCallId as Id<"openCalls">, isAdmin });
            },
          });
        } else {
          deleteOC({ openCallId: openCallId as Id<"openCalls">, isAdmin });
        }
      }}
      className="flex items-center gap-x-1"
    >
      <FaRegTrashCan className="size-4" />
      Delete
    </DropdownMenuItem>
  );
};

export const ReactivateOC = ({ openCallId, state }: SubmittedOCProps) => {
  const activateOC = useMutation(api.openCalls.openCall.changeOCStatus);
  return (
    <DropdownMenuItem
      onClick={() => {
        activateOC({
          openCallId: openCallId as Id<"openCalls">,
          newStatus: "submitted",
        });
      }}
      className="flex items-center gap-x-1"
    >
      <LucideFolderInput className="size-4" />
      {state === "archived" ? "Activate" : "Change to Submitted"}
    </DropdownMenuItem>
  );
};

export const ApproveOC = ({ openCallId }: OCActionProps) => {
  const approveOC = useMutation(api.openCalls.openCall.changeOCStatus);
  return (
    <DropdownMenuItem
      onClick={() => {
        approveOC({
          openCallId: openCallId as Id<"openCalls">,
          newStatus: "published",
        });
      }}
      className="flex items-center gap-x-1"
    >
      <LucideFolderCheck className="size-4" />
      Approve
    </DropdownMenuItem>
  );
};
export const ApproveBoth = ({ openCallId }: OCActionProps) => {
  const approveOC = useMutation(api.openCalls.openCall.changeOCStatus);
  return (
    <DropdownMenuItem
      onClick={() => {
        approveOC({
          openCallId: openCallId as Id<"openCalls">,
          newStatus: "published",
          target: "both",
        });
      }}
      className="flex items-center gap-x-1"
    >
      <FaCheckDouble className="size-4" />
      Approve Both
    </DropdownMenuItem>
  );
};
