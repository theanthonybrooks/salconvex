import { useState } from "react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

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
  const isBookmarked = bookmarked ?? false;
  const isHidden = hidden ?? false;
  const initialValue = isBookmarked || isHidden ? "yes" : "no";
  const [value, setValue] = useState<"yes" | "no">(initialValue);

  const updateListAction = useMutation(
    api.artists.artistActions.artistListActions,
  );

  const handleChange = (value: boolean, type: "bookmarked" | "hidden") => {
    updateListAction({
      eventId,
      [type]: value,
    });
  };
  const yesValue = isBookmarked ? "Bookmarked" : "Hidden";
  const noValue = isBookmarked ? "Remove" : "Unhide";

  return (
    <Select
      value={value}
      onValueChange={(newValue: "yes" | "no") => {
        setValue(newValue);
        handleChange(
          newValue === "yes",
          isBookmarked ? "bookmarked" : "hidden",
        );
      }}
    >
      <SelectTrigger className={cn("mx-auto w-fit min-w-40 font-medium")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="yes">{yesValue}</SelectItem>
        <SelectItem value="no">{noValue}</SelectItem>
      </SelectContent>
    </Select>
  );
};
