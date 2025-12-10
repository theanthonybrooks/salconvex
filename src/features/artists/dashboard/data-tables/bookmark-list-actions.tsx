import { bookmarkIntents } from "@/constants/data-table-constants";

import { positiveApplicationStatuses } from "@/types/applications";

import { capitalize } from "lodash";

import type { ApplicationStatus } from "~/convex/schema";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface BookmarkListActionSelectorProps {
  eventId: Id<"events">;
  initialValue?: string;
  appStatus?: ApplicationStatus | null;
  openCallId: Id<"openCalls"> | null;
  isPast?: boolean;
}

export const BookmarkListActionSelector = ({
  eventId,
  initialValue: value,
  appStatus,
  openCallId,
  isPast,
}: BookmarkListActionSelectorProps) => {
  const updateListAction = useMutation(api.artists.listActions.updateBookmark);
  const { toggleAppActions } = useArtistApplicationActions();

  const disabledValue =
    (typeof appStatus === "string" &&
      !positiveApplicationStatuses.includes(appStatus ?? "")) ||
    positiveApplicationStatuses.includes(appStatus ?? "");

  const handleChange = (intent: string) => {
    updateListAction({
      eventId,
      intent,
    });
    if (intent === "applied" && openCallId) {
      toggleAppActions({
        openCallId,
        manualApplied: true,
      });
    }
  };

  const options = [
    ...bookmarkIntents.filter(
      (opt) =>
        opt.value !== "-" &&
        !(
          (isPast && opt.value === "planned") ||
          (!isPast && opt.value === "missed") ||
          (!openCallId && opt.value === "applied")
        ),
    ),
    ...(value && !bookmarkIntents.some((opt) => opt.value === value)
      ? [
          {
            value,
            label: capitalize(value),
            disabled: true,
          },
        ]
      : []),
  ];

  return (
    <SelectSimple
      hasReset
      placeholder="Select reason"
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
