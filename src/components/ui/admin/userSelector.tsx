import { AvatarSimple } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/user";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { CheckIcon } from "lucide-react";
import { api } from "~/convex/_generated/api";

interface UserSelectorProps {
  type: "staff" | "user" | "organization" | "openCall"; //todo: use later when this is implemented elsewhere
  isAdmin: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  minimal?: boolean;
}

export const StaffUserSelector = ({
  type,
  isAdmin,
  currentUser,
  setCurrentUser,
  minimal,
}: UserSelectorProps) => {
  const { image: currentUserImage, name: currentUserName } = currentUser || {};

  const staffUsers = useQuery(
    api.admin.getStaffUsers,
    isAdmin && type === "staff" ? {} : "skip",
  );
  const staffUsersData = staffUsers ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:scale-105 active:scale-95">
          <AvatarSimple
            src={currentUserImage}
            alt={currentUserName}
            user={currentUser}
            className="size-8"
          />
          {!minimal && (
            <span className="text-sm font-medium">{currentUserName}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-h-80 w-56 overflow-y-auto"
      >
        {staffUsersData.length > 0 &&
          staffUsersData?.map((staff: User) => (
            <DropdownMenuItem
              key={staff.userId}
              onClick={() => {
                if (staff.userId !== currentUser?.userId) {
                  setCurrentUser(staff);
                } else {
                  setCurrentUser(null);
                }
              }}
              className="flex cursor-pointer items-center gap-2 p-2"
            >
              <>
                <AvatarSimple
                  src={staff.image}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  user={staff}
                  className="size-7"
                />
                <span className="truncate">
                  {staff.firstName} {staff.lastName}
                </span>
                {staff.userId === currentUser?.userId && (
                  <CheckIcon className="size-4 text-emerald-600" />
                )}
              </>
            </DropdownMenuItem>
          ))}
        {currentUser && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="w-full justify-center text-center text-muted-foreground"
              onClick={() => {
                setCurrentUser(null);
              }}
            >
              Clear Filter
            </DropdownMenuItem>
          </>
        )}

        {(!staffUsersData || staffUsersData.length === 0) && (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No staff found
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
