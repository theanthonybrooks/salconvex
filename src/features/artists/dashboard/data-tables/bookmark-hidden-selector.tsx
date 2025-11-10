import { SelectSimple } from "@/components/ui/select";

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
      value={initialValue}
      onChangeAction={(val) => {
        handleChange(val === "yes", bookmarked ? "bookmarked" : "hidden");
      }}
      placeholder="-"
      options={[
        { value: "yes", label: yesValue },
        { value: "no", label: noValue },
      ]}
    />
  );
};
