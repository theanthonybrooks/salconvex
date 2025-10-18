import { ConfirmDialog } from "@/components/ui/confirmation-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";
import { ArtistStatus, artistStatusOptions } from "@/types/applications";
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
  const [value, setValue] = useState<ArtistStatus | "remove">(appStatus);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateApplicationStatus = useMutation(
    api.artists.applications.updateApplicationStatus,
  );

  const handleChange = (value: ArtistStatus | "remove") => {
    updateApplicationStatus({
      applicationId,
      status: value ?? "applied",
    });
  };

  const handleValueChange = (newValue: ArtistStatus | "remove") => {
    if (newValue === "remove") {
      setShowConfirm(true);
    } else {
      setValue(newValue);
      handleChange(newValue);
    }
  };

  const confirmRemoval = () => {
    setValue("remove");
    handleChange("remove");
    setShowConfirm(false);
  };

  const cancelRemoval = () => {
    setShowConfirm(false);
  };

  // const statusColor = statusBgColorMap[appStatus as NonNullApplicationStatus];
  // const textColor = statusColorMap[appStatus as NonNullApplicationStatus];

  return (
    <>
      <Select
        value={value}
        onValueChange={handleValueChange}
        key={applicationId}
      >
        <SelectTrigger
          className={cn(
            "mx-auto w-fit min-w-40 font-medium",
            // statusColor,
            // textColor,
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
          <SelectSeparator />
          <SelectItem
            value="remove"
            className="bg-red-50 text-center text-red-700"
          >
            I didn&apos;t apply
          </SelectItem>
        </SelectContent>
      </Select>

      {/* TODO: Add that it will delete the entire application later */}
      {showConfirm && (
        <ConfirmDialog
          label="Remove application?"
          description='This will remove the application from your dashboard. You can always re-apply (or manually mark it as "applied") later.'
          onConfirm={confirmRemoval}
          onCancel={cancelRemoval}
        />
      )}
    </>
  );
};
