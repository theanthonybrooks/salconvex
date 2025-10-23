import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

export function useToggleListAction(eventId: Id<"events">) {
  const listActions = useMutation(api.artists.artistActions.artistListActions);

  const toggleListAction = async (
    options: {
      bookmarked?: boolean;
      hidden?: boolean;
    } = {},
  ) => {
    try {
      await listActions({
        eventId,
        ...options,
      });
    } catch (error) {
      console.error("Error toggling list action:", error);
    }
  };

  return {
    toggleListAction,
  };
}
