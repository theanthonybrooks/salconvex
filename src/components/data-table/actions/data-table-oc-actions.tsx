import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SubmissionFormState } from "@/types/event";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface OCActionProps {
  openCallId: string;
}

interface SubmittedOCProps extends OCActionProps {
  state: SubmissionFormState;
}

interface DeleteOCActionProps extends OCActionProps {
  isAdmin: boolean | undefined;
}

export const DuplicateOC = ({ openCallId }: OCActionProps) => {
  const duplicateOC = useMutation(api.openCalls.openCall.duplicateOC);
  return (
    <DropdownMenuItem
      onClick={() => {
        duplicateOC({ openCallId: openCallId as Id<"openCalls"> });
      }}
    >
      Duplicate
    </DropdownMenuItem>
  );
};

export const DeleteOC = ({ openCallId, isAdmin }: DeleteOCActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteOC = useMutation(api.openCalls.openCall.deleteOC);
  return (
    <DropdownMenuItem
      onClick={() => {
        confirm({
          label: "Delete Open Call",
          description: "Are you sure you want to delete this open call?",
          onConfirm: () => {
            deleteOC({ openCallId: openCallId as Id<"openCalls">, isAdmin });
          },
        });
      }}
    >
      Delete
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
      Archive
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
    >
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
      Approve Both
    </DropdownMenuItem>
  );
};
