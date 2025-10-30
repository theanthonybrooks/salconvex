import { ArtistFull } from "@/types/artist";
import { EventData } from "@/types/eventTypes";

import { Doc, Id } from "~/convex/_generated/dataModel";

export const primaryContacts = [
  "email",
  "phone",
  "website",
  "facebook",
  "instagram",
  "threads",
  "vk",
] as const;
export type PrimaryContact = (typeof primaryContacts)[number];

export type Organizer = Doc<"organizations">;

export type OrgEventData = EventData & {
  organizationName: string;
  mainOrgId: Id<"organizations">;
  openCallState: string | null;
  openCallId: Id<"openCalls"> | null;
};

export interface OrganizerCardProps {
  data: { events: EventData[] | null; organizer: Organizer };
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
}
