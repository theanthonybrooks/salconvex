"use client";

import { MultiSelect } from "@/components/multi-select";
import { accountTypeOptions, userRoleOptions } from "@/types/user";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { AccountType, UserRole } from "~/convex/schema";

interface AdminUserActionsProps {
  userId: Id<"users">;
}

interface UserRoleProps extends AdminUserActionsProps {
  role: UserRole;
}

interface UserAccountTypeProps extends AdminUserActionsProps {
  accountType: AccountType;
}

export const ChangeUserRole = ({ userId, role }: UserRoleProps) => {
  const updateUser = useMutation(api.users.updateUser);
  return (
    <MultiSelect
      options={userRoleOptions}
      defaultValue={role ?? []}
      onValueChange={(value) => {
        updateUser({
          role: value as UserRole,
          targetOtherUser: true,
          otherUserId: userId,
        });
      }}
      variant="ghost"
      className="min-w-8"
      maxCount={1}
      showArrow={false}
      compact
      condensed
      selectAll={false}
      hasSearch={false}
      fallbackValue={["user"]}
    />
  );
};

export const ChangeUserAccountType = ({
  userId,
  accountType,
}: UserAccountTypeProps) => {
  const updateUser = useMutation(api.users.updateUser);
  return (
    <MultiSelect
      options={accountTypeOptions}
      defaultValue={accountType ?? []}
      onValueChange={(value) => {
        updateUser({
          accountType: value as AccountType,
          targetOtherUser: true,
          otherUserId: userId,
        });
      }}
      variant="ghost"
      className="min-w-8"
      maxCount={1}
      showArrow={false}
      compact
      condensed
      selectAll={false}
      hasSearch={false}
      fallbackValue={["artist"]}
    />
  );
};
