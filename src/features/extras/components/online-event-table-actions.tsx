"use client";

import {
  onlineEventCategories,
  registrationStatusOptions,
} from "@/constants/extrasConsts";

import { toast } from "react-toastify";

import type { Id } from "~/convex/_generated/dataModel";
import type { OnlineEventStateType, UserAddOnStatus } from "~/convex/schema";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { PopoverSimple } from "@/components/ui/popover";
import { SelectSimple } from "@/components/ui/select";

import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";

type OnlineEventBaseProps = {
  eventId: Id<"onlineEvents">;
};

type OnlineEventStateProps = OnlineEventBaseProps & {
  state: OnlineEventStateType;
};

type OnlineEventLinkProps = {
  slug: string;
  children?: React.ReactNode;
};
export const OnlineEventStatusBtn = ({
  eventId,
  state,
}: OnlineEventStateProps) => {
  const updateEventState = useMutation(
    api.userAddOns.onlineEvents.updateOnlineEventState,
  );

  const mappedOptions = onlineEventCategories.map((opt) =>
    opt.value === "archived" ? { ...opt, disabled: true } : opt,
  );

  return (
    <SelectSimple
      options={[...mappedOptions]}
      value={state}
      onChangeAction={async (value) => {
        try {
          await updateEventState({
            eventId,
            state: value as OnlineEventStateType,
          });
        } catch (error) {
          if (error instanceof ConvexError) {
            toast.dismiss();
            toast.error(error.data);
          } else {
            console.error("Failed to update event state:", error);
          }
        }
      }}
      placeholder="Select status"
    />
  );
};

export const GoToOnlineEvent = ({ slug, children }: OnlineEventLinkProps) => {
  return (
    <Link variant="standard" href={`/extras/${slug}`}>
      <Button variant="ghost">{children}</Button>
    </Link>
  );
};

export const UpdateRegistrationStatus = ({
  status,
  registrationId,
}: {
  status: UserAddOnStatus;
  registrationId: Id<"userAddOns">;
}) => {
  const updateRegistration = useMutation(
    api.userAddOns.onlineEvents.updateRegistrationAdmin,
  );

  const handleUpdateRegistration = async (
    registrationId: Id<"userAddOns">,
    status: UserAddOnStatus,
  ) => {
    try {
      await updateRegistration({
        registrationId,
        status,
        type: "status",
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.dismiss();
        toast.error(error.data);
      } else {
        console.error("Failed to update registration status:", error);
      }
    }
  };
  return (
    <SelectSimple
      options={registrationStatusOptions}
      value={status ?? ""}
      hasReset
      onChangeAction={(value) =>
        handleUpdateRegistration(registrationId, value as UserAddOnStatus)
      }
      placeholder="Select status"
    />
  );
};

export const UpdateOrder = ({
  registrationId,
  order,
  takenOrders,
  capacity,
}: {
  registrationId: Id<"userAddOns">;
  order?: number;
  takenOrders: number[];
  capacity: number;
}) => {
  const updateRegistration = useMutation(
    api.userAddOns.onlineEvents.updateRegistrationAdmin,
  );

  const handleUpdateRegistration = async (
    registrationId: Id<"userAddOns">,
    order: number | undefined,
  ) => {
    try {
      await updateRegistration({
        registrationId,
        order,
        type: "order",
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.dismiss();
        toast.error(error.data);
      } else {
        console.error("Failed to update registration order:", error);
      }
    }
  };
  const options = Array.from({ length: capacity }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}`,
  }));

  const availableOptions = options.filter(
    (opt) =>
      !takenOrders.includes(Number(opt.value)) || Number(opt.value) === order,
  );

  const nullOption = { value: "-", label: "-" };

  return (
    <SelectSimple
      options={[nullOption, ...availableOptions]}
      value={String(order) ?? ""}
      onChangeAction={(value) => {
        const outputValue = Number(value);

        handleUpdateRegistration(registrationId, outputValue);
      }}
      placeholder="-"
      contentClassName="w-16"
    />
  );
};

export const ViewNotes = ({ notes }: { notes?: string }) => {
  if (!notes) return <p>-</p>;
  return (
    <PopoverSimple
      content={notes}
      align="start"
      sideOffset={8}
      className="w-auto max-w-sm"
    >
      <p className="truncate">{notes}</p>
    </PopoverSimple>
  );
};
