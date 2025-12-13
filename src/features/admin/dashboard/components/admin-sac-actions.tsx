"use client";

import { Check, X } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";

type AdminSacBaseProps = {
  sacId: Id<"sacData">;
};

export const SacCheckedSelector = ({
  sacId,
  checked,
}: AdminSacBaseProps & {
  checked: boolean;
}) => {
  const checkedClassName: Record<string, string> = {
    true: "text-green-700",
    false: "text-red-700 ",
  };
  const updatedChecked = useMutation(api.sac.sacData.checkSacData);

  const handleUpdateSupportTicketStatus = async (value: boolean) => {
    try {
      await updatedChecked({
        salSacId: sacId,
        checked: value,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        showToast("error", error.data);
      } else {
        console.error("Failed to update ticket status:", error);
      }
    }
  };

  return (
    <SelectSimple
      iconOnly
      options={[
        { value: "true", label: "Yes", icon: Check },
        { value: "false", label: "No", icon: X },
      ]}
      className={cn(checkedClassName[String(checked)], "border-transparent")}
      value={String(checked)}
      onChangeAction={async (value) => {
        try {
          await handleUpdateSupportTicketStatus(value === "true");
        } catch (error) {
          if (error instanceof ConvexError) {
            showToast("error", error.data);
          } else {
            console.error("Failed to update checked state:", error);
          }
        }
      }}
      placeholder="Select one"
    />
  );
};
