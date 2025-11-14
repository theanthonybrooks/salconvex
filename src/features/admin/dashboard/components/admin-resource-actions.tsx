"use client";

import { Copy, Trash } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";

type AdminResourceActionsProps = {
  eventId: Id<"onlineEvents">;
};

export const DuplicateEventBtn = ({ eventId }: AdminResourceActionsProps) => {
  const duplicateEvent = useMutation(
    api.userAddOns.onlineEvents.duplicateOnlineEvent,
  );

  const handleDuplicateEvent = async () => {
    try {
      await duplicateEvent({ eventId });
    } catch (error) {
      console.error("Failed to duplicate event:", error);
    }
  };
  return (
    <Button
      variant="outline"
      className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
      onClick={handleDuplicateEvent}
    >
      <span className="sr-only">Duplicate</span>
      <Copy className="size-4" />
    </Button>
  );
};
export const DeleteEventBtn = ({ eventId }: AdminResourceActionsProps) => {
  const deleteEvent = useMutation(
    api.userAddOns.onlineEvents.deleteOnlineEvent,
  );

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent({ eventId });
    } catch (error) {
      console.error("Failed to duplicate event:", error);
    }
  };
  return (
    <Button
      variant="outline"
      className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
      onClick={handleDeleteEvent}
    >
      <span className="sr-only">Delete</span>
      <Trash className="size-4" />
    </Button>
  );
};
