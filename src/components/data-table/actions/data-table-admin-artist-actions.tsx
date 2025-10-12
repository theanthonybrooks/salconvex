import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

import { SelectSimple } from "@/components/ui/select";
import { Check, X } from "lucide-react";

export interface ArtistActionProps {
  artistId: Id<"artists">;
}
export interface ArtistFeatureProps extends ArtistActionProps {
  feature: boolean;
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
      ]}
      value={feature === true ? "true" : "false"}
      onChangeAction={(value) => {
        updateArtistFeature({
          artistId,
          feature: value === "true",
        });
      }}
      placeholder="Select..."
      key={artistId}
    />
  );
};
