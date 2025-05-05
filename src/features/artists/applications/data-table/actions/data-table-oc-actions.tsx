import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface DeleteOCProps {
  openCallId: string;
}

export const DeleteOC = ({ openCallId }: DeleteOCProps) => {
  const deleteOC = useMutation(api.openCalls.openCall.deleteOC);
  return (
    <DropdownMenuItem
      onClick={() => {
        deleteOC({ openCallId: openCallId as Id<"openCalls"> });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
};

export const ArchiveOC = ({ openCallId }: DeleteOCProps) => {
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

export const ReactivateOC = ({ openCallId }: DeleteOCProps) => {
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
      Activate
    </DropdownMenuItem>
  );
};

export const ApproveOC = ({ openCallId }: DeleteOCProps) => {
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
