import { useState } from "react";
import {
  ApplicationStatus,
  positiveApplicationStatuses,
} from "@/types/applications";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

interface BookmarkListActionSelectorProps {
  eventId: Id<"events">;
  initialValue?: string;
  appStatus?: ApplicationStatus;
  isPast?: boolean;
}

export const BookmarkListActionSelector = ({
  eventId,
  initialValue,
  appStatus,
  isPast,
}: BookmarkListActionSelectorProps) => {
  const [value, setValue] = useState(initialValue);

  const updateListAction = useMutation(api.artists.listActions.updateBookmark);
  const disabledValue =
    (typeof appStatus === "string" &&
      !positiveApplicationStatuses.includes(appStatus ?? "")) ||
    positiveApplicationStatuses.includes(appStatus ?? "");

  const handleChange = (intent: string) => {
    updateListAction({
      eventId,
      intent,
    });
  };

  return (
    <Select
      disabled={disabledValue}
      value={value}
      onValueChange={(newValue) => {
        setValue(newValue);
        handleChange(newValue);
      }}
    >
      <SelectTrigger
        className={cn("mx-auto w-fit min-w-40 font-medium capitalize")}
      >
        <SelectValue placeholder={"Select..."} />
      </SelectTrigger>
      <SelectContent>
        {!["planned", "missed", "nextYear", "contact", "-"].includes(
          initialValue ?? "",
        ) &&
          initialValue && (
            <SelectItem
              value={initialValue}
              className="capitalize text-foreground/30"
              disabled
            >
              {initialValue}
            </SelectItem>
          )}

        {!isPast && <SelectItem value="planned">Planned</SelectItem>}
        <SelectItem value="nextYear">Next Year</SelectItem>
        <SelectItem value="contact">Contact</SelectItem>
        <SelectItem value="missed">Missed</SelectItem>
        <SelectItem value="-">-</SelectItem>
      </SelectContent>
    </Select>
  );
};

interface AppNotesInputProps {
  notes: string;
  bookmark: Id<"events">;
}

export const BookmarkNotesInput = ({ notes, bookmark }: AppNotesInputProps) => {
  const updateBookmarkNotes = useMutation(
    api.artists.listActions.updateBookmark,
  );
  const handleChange = async (value: string) => {
    await updateBookmarkNotes({
      eventId: bookmark,
      notes: value,
    });
  };

  return (
    <RichTextEditor
      value={notes}
      onChange={handleChange}
      inputPreview
      // placeholder="(optional)"
      formInputPreviewClassName="line-clamp-1 min-h-5 max-h-20"
    />
  );
};
