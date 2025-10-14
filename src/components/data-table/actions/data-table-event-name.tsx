"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Event } from "@/features/events/components/events-data-table/columns";
import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { EventCategory } from "@/types/event";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState } from "react";
import { BiRename } from "react-icons/bi";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

interface EventNameProps {
  event: Event;
  dashboard?: boolean;
}

export function DataTableEventName({ event, dashboard }: EventNameProps) {
  const edition = event.dates.edition;
  const slug = event.slug;
  const hasOpenCall = !!event.openCallId;

  return (
    <div
      className={cn(
        "flex min-w-[60px] cursor-pointer justify-center truncate font-medium",
      )}
      // onClick={() => !editMode && setEditMode(true)}
      onClick={() => {
        if (!dashboard) return;
        const linkPath = `/thelist/event/${slug}/${edition}${hasOpenCall ? "/call" : ""}`;
        window.open(linkPath, "_blank");
      }}
    >
      <span className="select-none truncate">{event.name || "-"}</span>
    </div>
  );
}

export function RenameEventDialog({ event }: EventNameProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(event.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateName = useMutation(api.events.event.updateEventName);

  useEffect(() => setName(event.name), [event.name]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === event.name) {
      setOpen(false);
      return;
    }
    try {
      await updateName({ eventId: event._id, name: trimmed });
      toast.success("Event name updated.");
      setOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data ?? "Failed to update name.");
      } else {
        toast.error("Unexpected error.");
      }
    }
  };

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <BiRename className="size-4" />
        Rename {getEventCategoryLabelAbbr(event.category as EventCategory)}
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename{" "}
              {getEventCategoryLabelAbbr(event.category as EventCategory)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
