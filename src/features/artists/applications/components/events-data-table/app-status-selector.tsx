import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArtistStatus,
  artistStatusOptions,
  NonNullApplicationStatus,
  statusBgColorMap,
  statusColorMap,
} from "@/types/applications";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface AppStatusSelectorProps {
  applicationId: Id<"applications">;
  appStatus: ArtistStatus;
}

export const AppStatusSelector = ({
  applicationId,
  appStatus,
}: AppStatusSelectorProps) => {
  const [value, setValue] = useState<ArtistStatus>(appStatus);

  const updateApplicationStatus = useMutation(
    api.artists.applications.updateApplicationStatus,
  );

  const handleChange = (value: ArtistStatus) => {
    updateApplicationStatus({
      applicationId,
      status: value ?? "applied",
    });
  };

  const statusColor = statusBgColorMap[appStatus as NonNullApplicationStatus];
  const textColor = statusColorMap[appStatus as NonNullApplicationStatus];

  return (
    <Select
      value={value}
      onValueChange={(newValue: ArtistStatus) => {
        setValue(newValue);
        handleChange(newValue);
      }}
    >
      <SelectTrigger
        className={cn(
          "mx-auto w-fit min-w-40 font-medium",
          statusColor,
          textColor,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {artistStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
