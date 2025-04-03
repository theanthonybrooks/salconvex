import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export function useArtistApplicationActions() {
  const appActions = useMutation(
    api.artists.artistActions.artistApplicationActions,
  );

  const toggleAppActions = async (options: {
    openCallId: Id<"openCalls">;
    manualApplied?: boolean;
  }) => {
    try {
      await appActions(options);
    } catch (error) {
      console.error("Error toggling application action:", error);
    }
  };

  return {
    toggleAppActions,
  };
}
