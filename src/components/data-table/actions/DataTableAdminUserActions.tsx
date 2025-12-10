import type { IconType } from "react-icons";

import { FaUserSlash } from "react-icons/fa6";
import { TestTube, X } from "lucide-react";

import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

export interface UserActionProps {
  userId: Id<"users">;
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

type NewsletterActionProps = {
  subscriberId: Id<"newsletter">;
};

export const DeleteNewsletterSubscription = ({
  subscriberId,
}: NewsletterActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteSubscription = useMutation(
    api.newsletter.subscriber.deleteSubscription,
  );
  return (
    <DropdownMenuItem
      onClick={() => {
        confirm({
          label: "Delete Newsletter Subscription",
          description:
            "Are you sure you want to remove this user's newsletter subscription?",
          onConfirm: () => {
            deleteSubscription({
              subscriberId,
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

export const MakeSubscriberTester = ({
  subscriberId,
  tester = false,
}: NewsletterActionProps & { tester?: boolean }) => {
  const confirm = useConfirmAction().confirm;
  const updateUser = useMutation(
    api.newsletter.subscriber.updateNewsletterUserAdmin,
  );
  const Icon: IconType = tester ? X : TestTube;
  return (
    <DropdownMenuItem
      onClick={() => {
        confirm({
          label: `${tester ? "Remove" : "Make"} Subscriber Tester`,
          description: tester
            ? "Are you sure you want to remove this user from the tester list?"
            : "Are you sure you want to make this user a tester? They will receive test emails.",
          onConfirm: () => {
            updateUser({
              subscriberId,
              tester: !tester,
            });
          },
        });
      }}
      className="flex items-center gap-x-2"
    >
      <Icon className="size-4" />
      {tester ? "Remove Tester" : "Make Tester"}
    </DropdownMenuItem>
  );
};
