import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

import { FaUserSlash } from "react-icons/fa6";

export interface UserActionProps {
  userId: string;
}

export const DeleteUser = ({ userId }: UserActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteUser = useMutation(api.users.deleteAccount);
  return (
    <DropdownMenuItem
      onClick={() => {
        confirm({
          label: "Delete User",
          description:
            "Are you sure you want to delete this user? Be sure that you've canceled any active subscriptions before doing this.",
          onConfirm: () => {
            deleteUser({
              userId: userId as Id<"users">,
              method: "deleteAccount",
            });
          },
        });
      }}
      className="flex items-center gap-x-2"
    >
      <FaUserSlash className="size-4" />
      Delete
    </DropdownMenuItem>
  );
};
