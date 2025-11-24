import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { Eye, EyeClosed } from "lucide-react";

import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface ListActionSelectorProps {
  eventId: Id<"events">;
  bookmarked?: boolean;
  hidden?: boolean;
}

export const ListActionSelector = ({
  eventId,
  bookmarked,
  hidden,
}: ListActionSelectorProps) => {
  const initialValue = bookmarked || hidden ? "yes" : "no";

  const updateListAction = useMutation(
    api.artists.artistActions.artistListActions,
  );

  const handleChange = (value: boolean, type: "bookmarked" | "hidden") => {
    updateListAction({
      eventId,
      [type]: value,
    });
  };
  const yesValue = bookmarked ? "Bookmarked" : "Hidden";
  const noValue = bookmarked ? "Remove" : "Unhide";

  return (
    <SelectSimple
      iconOnly
      value={initialValue}
      onChangeAction={(val) => {
        handleChange(val === "yes", bookmarked ? "bookmarked" : "hidden");
      }}
      placeholder="-"
      className={cn(
        "border-transparent",

        initialValue === "yes" && bookmarked ? "text-red-600" : undefined,
      )}
      options={[
        {
          value: "yes",
          label: yesValue,
          icon: hidden ? EyeClosed : FaBookmark,
          className: bookmarked
            ? "text-red-600 hover:text-red-600 pointer-events-none focus:text-red-600"
            : "pointer-events-none",
          iconSize: "size-5",
          // disabled: bookmarked,
        },
        {
          value: "no",
          label: noValue,
          icon: hidden ? Eye : FaRegBookmark,
          iconSize: "size-5",
        },
      ]}
    />
  );
};
