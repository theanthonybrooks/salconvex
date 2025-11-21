import { Check, X } from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

export interface ArtistActionProps {
  artistId: Id<"artists">;
}
export interface ArtistFeatureProps extends ArtistActionProps {
  feature: boolean | string;
}

export const ArtistFeatureSelect = ({
  artistId,
  feature,
}: ArtistFeatureProps) => {
  const updateArtistFeature = useMutation(
    api.artists.artistActions.updateArtistFeature,
  );
  return (
    <SelectSimple
      options={[
        { value: "true", label: <Check className="size-4" /> },
        { value: "false", label: <X className="size-4" /> },
        { value: "none", label: "-" },
      ]}
      value={feature === true ? "true" : feature === false ? "false" : "none"}
      onChangeAction={(value) => {
        updateArtistFeature({
          artistId,
          feature: value === "true" ? true : value === "false" ? false : null,
        });
      }}
      placeholder="Select..."
      key={artistId}
      className={cn(feature === false && "bg-red-100")}
    />
  );
};

export const ArtistAdminNotesInput = ({
  notes,
  artist,
}: {
  artist: Id<"artists">;
  notes: string;
}) => {
  const updateArtistNote = useMutation(
    api.artists.artistActions.updateArtistNotes,
  );
  const handleChange = async (value: string) => {
    await updateArtistNote({
      artistId: artist,
      notes: value,
    });
  };

  return (
    <RichTextEditor
      value={notes}
      onChange={handleChange}
      inputPreview
      placeholder="More details..."
      formInputPreviewClassName="line-clamp-1 min-h-5 max-h-5 "
      inputPreviewContainerClassName="bg-inherit"
    />
  );
};
