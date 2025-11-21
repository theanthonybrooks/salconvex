import { bookmarkIntents } from "@/constants/data-table-constants";

import {
  ApplicationStatus,
  positiveApplicationStatuses,
} from "@/types/applications";

import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface BookmarkListActionSelectorProps {
  eventId: Id<"events">;
  initialValue?: string;
  appStatus?: ApplicationStatus;
  isPast?: boolean;
}

export const BookmarkListActionSelector = ({
  eventId,
  initialValue: value,
  appStatus,
  isPast,
}: BookmarkListActionSelectorProps) => {
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

  const options = [
    ...bookmarkIntents.filter(
      (opt) => opt.value !== "-" && !(isPast && opt.value === "planned"),
    ),
    ...(value && !bookmarkIntents.some((opt) => opt.value === value)
      ? [
          {
            value,
            label: value,
            disabled: true,
          },
        ]
      : []),
  ];

  return (
    <SelectSimple
      hasReset
      placeholder="-"
      disabled={disabledValue}
      value={value ?? ""}
      onChangeAction={handleChange}
      options={options}
    />
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
      placeholder="More details..."
      formInputPreviewClassName="line-clamp-1 min-h-5 max-h-20"
    />
  );
};
