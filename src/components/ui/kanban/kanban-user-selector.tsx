import type { Dispatch, SetStateAction } from "react";

import { Fragment } from "react";

import { CheckIcon } from "lucide-react";

import type { Doc } from "~/convex/_generated/dataModel";
import { AvatarSimple } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";

interface UserSelectorProps {
  currentUserIds: Id<"users">[] | null;
  cardId?: Id<"todoKanban">;
  setCurrentUsers?: Dispatch<SetStateAction<Id<"users">[] | null>>;
  mode: "add" | "edit" | "view";
}

export const KanbanUserSelector = ({
  setCurrentUsers,
  currentUserIds,

  cardId,
  mode,
}: UserSelectorProps) => {
  const staffUsers = useQuery(api.admin.getStaffUsers, {}) || [];

  const updateAssignedUser = useMutation(api.kanban.cards.updateAssignedUser);
  const assignedUsers = staffUsers.filter((u) =>
    currentUserIds?.includes(u.userId as Id<"users">),
  );

  const handleUserToggle = async (staff: Doc<"users">) => {
    const id = staff.userId as Id<"users">;

    if (setCurrentUsers) {
      setCurrentUsers((prev) => {
        if (!prev) return [id];
        return prev.includes(id)
          ? prev.filter((u) => u !== id)
          : [...prev, id].slice(0, 2);
      });
    } else if (cardId) {
      const isSelected = currentUserIds?.includes(id);

      let newUsers: Id<"users">[] = [];
      if (!isSelected) {
        newUsers = [...(currentUserIds ?? []), id].slice(0, 2);
      } else {
        newUsers = (currentUserIds ?? []).filter((u) => u !== id);
      }

      await updateAssignedUser({
        id: cardId,
        userId: newUsers[0],
        secondaryUserId: newUsers[1],
        isAdmin: true,
      });
    }
  };

  return (
    <div className="flex items-center gap-3 pr-8 text-sm">
      <div className="hidden flex-col items-end gap-1 sm:flex">
        Assign{mode === "add" || assignedUsers.length === 0 ? " to" : "ed to"}:
        {/* <span className="font-semibold">{currentUserName}</span> */}
        <div className="flex flex-wrap gap-1 font-semibold">
          {assignedUsers.length > 0
            ? assignedUsers.map((u, i) => (
                <Fragment key={u._id}>
                  {" "}
                  <span key={u.userId}>{u.firstName}</span>
                  {assignedUsers.length > 1 && i === 0 && " & "}
                </Fragment>
              ))
            : "Unassigned"}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-colors hover:border-foreground/20">
            <div className="flex -space-x-2">
              {assignedUsers.length > 0 ? (
                assignedUsers.map((u) => (
                  <AvatarSimple
                    key={u._id}
                    src={u.image}
                    alt={u.firstName}
                    user={u}
                    className="size-8 border-2 border-foreground"
                  />
                ))
              ) : (
                <AvatarSimple className="size-8 opacity-60" />
              )}
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="max-h-80 w-56 overflow-y-auto"
        >
          {staffUsers.length > 0 ? (
            staffUsers.map((staff) => {
              const isSelected = currentUserIds?.includes(
                staff.userId as Id<"users">,
              );

              return (
                <DropdownMenuItem
                  key={staff._id}
                  onClick={() => handleUserToggle(staff)}
                  className="flex cursor-pointer items-center gap-2 px-2 py-2"
                >
                  <AvatarSimple
                    src={staff.image}
                    alt={`${staff.firstName} ${staff.lastName}`}
                    user={staff}
                    className="size-7"
                  />
                  <span className="truncate">
                    {staff.firstName} {staff.lastName}
                  </span>
                  {isSelected && (
                    <CheckIcon className="size-4 text-emerald-600" />
                  )}
                </DropdownMenuItem>
              );
            })
          ) : (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No staff found
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
