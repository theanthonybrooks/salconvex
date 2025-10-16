import { AvatarSimple } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/user";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface UserSelectorProps {
  type: "staff" | "user" | "organization" | "openCall"; //todo: use later when this is implemented elsewhere
  currentUser: User | null;
  isAdmin: boolean;
  cardId: Id<"todoKanban">;
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
  mode: "add" | "edit" | "view";
}

export const KanbanUserSelector = ({
  setCurrentUser,
  currentUser,
  isAdmin,
  cardId,
  mode,
}: UserSelectorProps) => {
  const { image: currentUserImage, name: currentUserName } = currentUser || {};
  const staffUsers = useQuery(api.admin.getStaffUsers, isAdmin ? {} : "skip");
  const staffUsersData = staffUsers ?? [];
  const updateAssignedUser = useMutation(api.kanban.cards.updateAssignedUser);

  return (
    <div className="flex items-center gap-3 pr-8 text-sm">
      Assign{mode === "add" ? "to" : "ed to"}:
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-colors hover:border-foreground/20 hover:bg-muted/20">
            <AvatarSimple
              src={currentUserImage}
              alt={currentUserName}
              user={currentUser}
              className="size-8"
            />
            <span className="font-semibold">{currentUserName}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="max-h-80 w-56 overflow-y-auto rounded-md border bg-card p-1 shadow-lg"
        >
          {staffUsersData.length > 0 &&
            staffUsersData?.map((staff: User) => (
              <DropdownMenuItem
                key={staff.userId}
                onClick={async () => {
                  if (setCurrentUser) {
                    setCurrentUser(staff);
                  }
                  if (cardId) {
                    await updateAssignedUser({
                      id: cardId,
                      userId: staff.userId as Id<"users">,
                      isAdmin,
                    });
                  }
                }}
                className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-muted"
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
              </DropdownMenuItem>
            ))}
          {staffUsersData.length > 0 && (
            <DropdownMenuItem
              className="w-full text-center text-muted-foreground"
              onClick={async () => {
                if (setCurrentUser) {
                  setCurrentUser(null);
                }
                await updateAssignedUser({
                  id: cardId,
                  userId: undefined,
                  isAdmin,
                });
              }}
            >
              Clear Filter
            </DropdownMenuItem>
          )}

          {(!staffUsersData || staffUsersData.length === 0) && (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No staff found
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
