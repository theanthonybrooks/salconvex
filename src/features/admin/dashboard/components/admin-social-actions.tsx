import { CheckCircle, Clock, X } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import type { PostStatusType } from "~/convex/schema";
import { DateTimePickerField } from "@/components/ui/date-picker/day-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";

type AdminSocialActionsBaseProps = {
  eventId: Id<"events">;
};

type AdminSocialUpdateProps = AdminSocialActionsBaseProps & {
  status?: PostStatusType;
};

type AdminSocialPlannedDateProps = AdminSocialActionsBaseProps & {
  plannedDate?: number;
};

type AdminSocialNotesProps = AdminSocialActionsBaseProps & {
  notes?: string;
};

export const AdminSocialUpdate = ({
  eventId,
  status,
}: AdminSocialUpdateProps) => {
  const updateEventPostStatus = useMutation(
    api.events.socials.updateEventPostStatus,
  );
  return (
    <SelectSimple
      options={[
        {
          label: "Planned",
          value: "toPost",
          icon: Clock,
        },
        {
          label: "Posted",
          value: "posted",
          icon: CheckCircle,
        },
        {
          label: "Not Planned",
          value: "-",
          icon: X,
        },
      ]}
      className={cn(
        status === "toPost"
          ? "border-yellow-700 bg-yellow-100 text-yellow-700"
          : status === "posted"
            ? "border-green-700 bg-green-100 text-green-700"
            : "",
      )}
      onChangeAction={(val) => {
        updateEventPostStatus({
          eventId,
          posted:
            val === "posted" ? "posted" : val === "toPost" ? "toPost" : null,
        });
      }}
      value={status ?? ""}
      placeholder="Select Status"
    />
  );
};

export const AdminSocialTimePicker = ({
  eventId,
  plannedDate,
}: AdminSocialPlannedDateProps) => {
  const updatePlannedDate = useMutation(
    api.events.socials.updateSocialPostPlannedDate,
  );
  const now = new Date().getTime();

  const handleDateSelect = (d: number | undefined) => {
    try {
      updatePlannedDate({
        eventId,
        plannedDate: d,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DateTimePickerField
      value={plannedDate}
      onChange={(date) => {
        handleDateSelect(date);
      }}
      label="Select Date"
      minDate={now}
      withTime={false}
      inputClassName="border-transparent hover:border-foreground/40"
    />
  );
};

export const AdminSocialNotes = ({ eventId, notes }: AdminSocialNotesProps) => {
  const updateEventNotes = useMutation(api.events.socials.updateEventNotes);
  const handleChange = async (value: string) => {
    await updateEventNotes({
      eventId,
      notes: value,
    });
  };

  return (
    <RichTextEditor
      value={notes ?? ""}
      onChange={handleChange}
      inputPreview
      placeholder="More details..."
      formInputPreviewClassName=" min-h-5 max-h-10"
    />
  );
};
