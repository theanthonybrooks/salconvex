import { useState } from "react";

import { LoaderCircle, X } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPrimaryAction,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";

type OrgDeleteProps = {
  orgId: Id<"organizations">;
  hasEvents: boolean;
  resetSelection: () => void;
};

export const OrgDelete = ({
  orgId,
  hasEvents,
  resetSelection,
}: OrgDeleteProps) => {
  const [pending, setPending] = useState(false);
  const deleteOrganization = useMutation(
    api.organizer.organizations.deleteOrganization,
  );
  const handleDelete = async () => {
    setPending(true);
    try {
      await deleteOrganization({ orgId });
      resetSelection();
    } catch (error) {
      console.error("Failed to delete organization:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={hasEvents} variant="salWithShadowHidden" size="lg">
          Delete Organization
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
        <AlertDialogCancel
          iconOnly
          className="absolute right-2 top-2 hidden hover:text-red-600 sm:block"
        >
          <X size={30} />
        </AlertDialogCancel>

        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-2xl">
            Delete Organization
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            <span>Are you sure you want to delete this organization?</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className={cn("items-center sm:justify-end")}>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogPrimaryAction
            variant="salWithShadowHidden"
            onClick={handleDelete}
            className="flex w-full items-center gap-x-1 sm:w-40"
          >
            Delete {pending && <LoaderCircle className="size-4 animate-spin" />}
          </AlertDialogPrimaryAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
