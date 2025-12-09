"use client";

import { ticketStatusOptions } from "@/constants/supportConsts";

import { Trash } from "lucide-react";

import type { Doc, Id } from "~/convex/_generated/dataModel";
import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SelectSimple } from "@/components/ui/select";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";

type AdminSupportActionBaseProps = {
  ticketId: Id<"support">;
};

type TicketStatus = Pick<Doc<"support">, "status">;

type AdminSupportStatusProps = AdminSupportActionBaseProps & {
  status: string;
};

export const SupportTicketStatusSelector = ({
  ticketId,
  status,
}: AdminSupportStatusProps) => {
  const statusClassName: Record<string, string> = {
    open: "text-yellow-800 border-yellow-800 bg-yellow-100",
    pending: "text-blue-700 bg-blue-100 border-blue-700",
    resolved: "text-green-700 bg-green-100 border-green-700",
    closed: "text-red-700 bg-red-100 border-red-700",
  };
  const updateSupportTicketStatus = useMutation(
    api.support.tickets.updateSupportTicket,
  );
  const handleUpdateSupportTicketStatus = async (
    value: Exclude<TicketStatus["status"], "pending">,
  ) => {
    try {
      await updateSupportTicketStatus({
        supportId: ticketId,
        status: value,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        showToast("error", error.data);
      } else {
        console.error("Failed to update ticket status:", error);
      }
    }
  };

  const availableStatuses = ticketStatusOptions.filter(
    (option) => option.value !== "pending",
  );

  return (
    <SelectSimple
      options={[...availableStatuses]}
      className={statusClassName[status]}
      value={status}
      onChangeAction={async (value) => {
        try {
          await handleUpdateSupportTicketStatus(
            value as Exclude<TicketStatus["status"], "pending">,
          );
        } catch (error) {
          if (error instanceof ConvexError) {
            showToast("error", error.data);
          } else {
            console.error("Failed to update ticket status:", error);
          }
        }
      }}
      placeholder="Select status"
    />
  );
};

export const DeleteSupportTicketBtn = ({
  ticketId,
}: AdminSupportActionBaseProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteSupportTicket = useMutation(
    api.support.tickets.deleteSupportTicket,
  );
  const handleDeleteSupportTicket = async () => {
    try {
      await deleteSupportTicket({ ticketId });
    } catch (error) {
      if (error instanceof ConvexError) {
        showToast("error", error.data);
      } else {
        console.error("Failed to delete ticket:", error);
      }
    }
  };
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        confirm({
          label: "Delete Support Ticket",
          description:
            "Are you sure you want to delete this ticket? You should probably create a table to archive it instead.",
          onConfirm: handleDeleteSupportTicket,
        });
      }}
    >
      <Trash className="size-4" />
      Delete
    </DropdownMenuItem>
  );
};
