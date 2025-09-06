import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface AppNotesInputProps {
  notes: string;
  application: Id<"applications">;
}

export const AppNotesInput = ({ notes, application }: AppNotesInputProps) => {
  const updateAppNotes = useMutation(
    api.artists.applications.updateApplicationNotes,
  );
  const handleChange = async (value: string) => {
    await updateAppNotes({
      applicationId: application,
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
