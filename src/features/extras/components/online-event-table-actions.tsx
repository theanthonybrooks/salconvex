"use client";

import { toast } from "react-toastify";

import type { Id } from "~/convex/_generated/dataModel";
import type { OnlineEventStateType } from "~/convex/schema";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
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

  return (
    <SelectSimple
      options={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ]}
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
