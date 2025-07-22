"use client";

import { validOCVals } from "@/types/openCall";
import { OrgEventData } from "@/types/organizer";
import { useRouter } from "next/navigation";
import slugify from "slugify";

interface OrgEventActionsProps {
  event: OrgEventData;
  field: string;
}

export const OrgEventActions = ({ event, field }: OrgEventActionsProps) => {
  const router = useRouter();
  const hasOpenCall =
    validOCVals.includes(event.hasOpenCall ?? "") &&
    event.openCallState === "published";
  const orgName = field === "orgName";
  const eventName = field === "eventName";
  const orgSlug = slugify(event.organizationName, {
    lower: true,
    strict: true,
  });
  return (
    <p
      onClick={() => {
        if (eventName) {
          router.push(
            `/thelist/event/${event.slug}/${event.dates.edition}${hasOpenCall ? "/call" : ""}`,
          );
          return;
        } else if (orgName) {
          router.push(`/thelist/organizer/${orgSlug}`);
          return;
        }
      }}
      className="cursor-pointer underline-offset-2 hover:underline active:scale-95"
    >
      {eventName ? event.name : orgName ? event.organizationName : "-"}
    </p>
  );
};
