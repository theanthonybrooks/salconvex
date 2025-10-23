import { EventData, PostStatus } from "@/types/eventTypes";
import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";
import { X } from "lucide-react";
import { MdPhoto } from "react-icons/md";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

type SocialsEvent = {
  _id: EventData["_id"];
  slug: EventData["slug"];
  dates: {
    edition: EventData["dates"]["edition"];
  };
};

interface SocialDropdownMenusProps {
  socialsEvent: SocialsEvent;
  openCallState: boolean;
  postStatus?: PostStatus;
}

export const SocialDropdownMenus = ({
  socialsEvent,
  openCallState,
  postStatus,
}: SocialDropdownMenusProps) => {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const updateEventPostStatus = useMutation(
    api.events.event.updateEventPostStatus,
  );
  const { dates, slug, _id: eventId } = socialsEvent;
  const edition = dates.edition;
  const handlePostEvent = async (postStatus: PostStatus | null) => {
    if (!user) return;
    try {
      await updateEventPostStatus({
        eventId,
        posted: postStatus,
      });
    } catch (error) {
      console.error("Error updating event post status:", error);
    }
  };
  return (
    <>
      {!postStatus ? (
        <DropdownMenuItem
          className="flex items-center gap-x-2 text-sm"
          onClick={() => {
            handlePostEvent("toPost");
            if (!openCallState) return;
            window.open(
              `/thelist/event/${slug}/${edition}/call/social`,
              "_blank",
              "noopener,noreferrer",
            );
          }}
        >
          <MdPhoto className="size-4" />
          Make Post
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="flex items-center gap-x-2 text-sm"
          onClick={() => handlePostEvent(null)}
        >
          <X className="size-4" />
          Cancel Post
        </DropdownMenuItem>
      )}

      {postStatus && (
        <DropdownMenuItem
          className="flex items-center gap-x-2 text-sm"
          onClick={() => {
            window.open(
              `/thelist/event/${slug}/${edition}/call/social`,
              "_blank",
              "noopener,noreferrer",
            );
          }}
        >
          <MdPhoto className="size-4" />
          View Socials
        </DropdownMenuItem>
      )}
    </>
  );
};
