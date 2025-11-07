import { Check, X } from "lucide-react";

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
        { value: "none", label: "-" },
        { value: "true", label: <Check className="size-4" /> },
        { value: "false", label: <X className="size-4" /> },
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
