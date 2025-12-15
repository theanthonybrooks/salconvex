import { campaignStatusOptions } from "@/constants/newsletterConsts";

import { LoaderCircle, Mail } from "lucide-react";

import type { Doc, Id } from "~/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";

type campaignStatus = Doc<"newsletterCampaign">["status"];

type CampaignActionBaseProps = {
  campaignId: Id<"newsletterCampaign">;
  status: campaignStatus;
};

export const CampaignStatusSelector = ({
  campaignId,
  status,
}: CampaignActionBaseProps) => {
  const updateStatus = useMutation(
    api.newsletter.campaign.updateNewsletterCampaignStatus,
  );

  const handleUpdateStatus = async (value: string) => {
    try {
      await updateStatus({
        campaignId,
        status: value as campaignStatus,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to update status:", error);
      } else {
        console.error("Failed to update status:", error);
      }
    }
  };

  const statusClass: Record<campaignStatus, string> = {
    draft: "",
    scheduled: "text-yellow-800 border-yellow-800 bg-yellow-50",
    sending: "text-blue-800 border-blue-800 bg-blue-50",
    sent: "text-green-800 border-green-800 bg-green-100",
    cancelled: "text-red-800 border-red-800 bg-red-100",
  };
  return (
    <SelectSimple
      options={[...campaignStatusOptions]}
      value={status ?? ""}
      onChangeAction={(value) => {
        handleUpdateStatus(value);
      }}
      placeholder="Select status"
      className={cn("w-full border-gray-300 bg-card", statusClass[status])}
      contentClassName="sm:max-h-80 "
    />
  );
};

export const CampaignSendNowBtn = ({
  campaignId,
  status,
}: CampaignActionBaseProps) => {
  const sendNow = useMutation(api.newsletter.emails.startSendingCampaign);
  const handleSendNow = async () => {
    try {
      await sendNow({ campaignId });
      showToast("success", "Starting to send now!");
    } catch (error) {
      let msg = "An unexpected error occurred";
      if (error instanceof ConvexError) {
        const data = error.data as { message: string };
        msg = data.message;

        console.log(msg);

        showToast("error", msg);
      } else if (error instanceof Error) {
        console.error("Failed to send emails:", error);
        showToast("error", error.message || msg);
      } else {
        console.error("Failed to send emails:", error);
      }
    }
  };

  return (
    <Button
      onClick={handleSendNow}
      disabled={status !== "scheduled"}
      variant="outline"
      className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
    >
      {status === "sending" ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Mail className="size-4" />
      )}
    </Button>
  );
};
