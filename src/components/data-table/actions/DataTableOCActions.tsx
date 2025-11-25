import { OpenCallState } from "@/types/openCallTypes";

import { toast } from "react-toastify";

import { FaCheckDouble, FaRegCopy, FaRegTrashCan } from "react-icons/fa6";
import { LucideFolderCheck, LucideFolderInput } from "lucide-react";

import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";

interface OCActionProps {
  openCallId: string;
}

interface DuplicateOCProps extends OCActionProps {
  onDuplicate: () => void;
}

interface SubmittedOCProps extends OCActionProps {
  state: OpenCallState;
}

interface DeleteOCActionProps extends OCActionProps {
  isAdmin: boolean | undefined;
}

export const DuplicateOC = ({ openCallId, onDuplicate }: DuplicateOCProps) => {
  const duplicateOC = useMutation(api.openCalls.openCall.duplicateOC);

  const handleOpenCallDuplicate = async () => {
    try {
      await duplicateOC({ openCallId: openCallId as Id<"openCalls"> });
      onDuplicate();
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
    <DropdownMenuItem onClick={handleOpenCallDuplicate}>
      <FaRegCopy className="size-4" />
      Duplicate
    </DropdownMenuItem>
  );
};

export const DeleteOC = ({ openCallId, isAdmin }: DeleteOCActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteOC = useMutation(api.openCalls.openCall.deleteOC);
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();

        confirm({
          label: "Delete Open Call",
          description: "Are you sure you want to delete this open call?",
          onConfirm: () => {
            deleteOC({ openCallId: openCallId as Id<"openCalls">, isAdmin });
          },
        });
      }}
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
    >
      <LucideFolderInput className="size-4" />
      {state === "archived" ? "Activate" : "Change to Submitted"}
    </DropdownMenuItem>
  );
};
export const ArchiveOC = ({ openCallId }: OCActionProps) => {
  const archiveOC = useMutation(api.openCalls.openCall.changeOCStatus);
  return (
    <DropdownMenuItem
      onClick={() => {
        archiveOC({
          openCallId: openCallId as Id<"openCalls">,
          newStatus: "archived",
        });
      }}
    >
      <LucideFolderInput className="size-4" />
      Archive OC
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
    >
      <FaCheckDouble className="size-4" />
      Approve Both
    </DropdownMenuItem>
  );
};
