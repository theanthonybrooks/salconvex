"use client";

import { validOCVals } from "@/types/openCall";
import { OrgEventData } from "@/types/organizer";
import { useRouter } from "next/navigation";

interface OrgEventActionsProps {
  event: OrgEventData;
}

export const OrgEventActions = ({ event }: OrgEventActionsProps) => {
  const router = useRouter();
  const hasOpenCall = validOCVals.includes(event.hasOpenCall ?? "");
  console.log(event.state, event.openCallState);
  return (
    <p
      onClick={() => {
        router.push(
          `/thelist/event/${event.slug}/${event.dates.edition}${hasOpenCall ? "/call" : ""}`,
        );
      }}
      className="cursor-pointer underline-offset-2 hover:underline active:scale-95"
    >
      {event.name}
    </p>
  );
};
