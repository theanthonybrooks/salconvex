"use client";

import { Event } from "@/features/events/components/events-data-table/columns";
import { cn } from "@/lib/utils";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

interface Props {
  event: Event;
  dashboard?: boolean;
}

export function DataTableEventName({ event, dashboard }: Props) {
  const [editMode, setEditMode] = useState(false);
  const eventName = event.name;
  const eventEdition = event.dates.edition;
  const eventId = event._id;
  const [localValue, setLocalValue] = useState(eventName);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateName = useMutation(api.events.event.updateEventName);

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { isError, error: errorMessage } = useQueryWithStatus(
    api.events.event.checkEventNameExists,
    editMode && localValue.trim().length >= 3
      ? {
          name: localValue,
          organizationId: event.mainOrgId,
          eventId: event._id,
          edition: eventEdition,
        }
      : "skip",
  );

  useEffect(() => {
    setLocalValue(event.name);
  }, [event.name]);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editMode]);

  const handleBlur = async () => {
    setEditMode(false);
    // if (isError && errorMessage) {
    //   toast.error(errorMessage.message ?? "Failed to update name.");
    //   setLocalValue(eventName);
    //   return;
    // }

    if (isError && errorMessage) {
      // Extract just the message part from the ConvexError
      let cleanMessage = "Failed to update name.";

      if (errorMessage instanceof ConvexError && errorMessage.data) {
        cleanMessage =
          typeof errorMessage.data === "string"
            ? errorMessage.data
            : (errorMessage.data as { message?: string })?.message ||
              cleanMessage;
      } else if (typeof errorMessage.message === "string") {
        const match = errorMessage.message.match(
          /Uncaught ConvexError: (.*?)(?:\. Called by client|$)/,
        );
        cleanMessage = match ? match[1] : errorMessage.message;
      }

      toast.error(cleanMessage);
      setLocalValue(eventName);
      return;
    }
    if (localValue.trim() !== event.name.trim()) {
      try {
        await updateName({ eventId, name: localValue.trim() });
        toast.success("Event name updated.");
      } catch (error) {
        setLocalValue(event.name);
        if (error instanceof ConvexError) {
          toast.error(error.data ?? "Failed to update name.");
        } else {
          toast.error("Unexpected error.");
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setLocalValue(event.name);
      setEditMode(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-[60px] justify-center truncate font-medium",
        editMode ? "w-full" : "cursor-pointer",
      )}
      onClick={() => !editMode && setEditMode(true)}
    >
      {editMode && dashboard ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-md border px-2 text-base sm:text-sm",
            isError && "border border-red-600 bg-red-200 ring-2 ring-red-600",
          )}
        />
      ) : (
        <span className="select-none truncate">{event.name || "-"}</span>
      )}
    </div>
  );
}
