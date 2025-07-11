import { ArtistFull } from "@/types/artist";
import { EventData } from "@/types/event";
import { Id } from "~/convex/_generated/dataModel";

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

export type Organizer = {
  _id: Id<"organizations">;
  ownerId: string;
  name: string;
  slug: string;
  events: string[];

  logo: string;
  logoStorageId: Id<"_storage"> | undefined;
  location: {
    full?: string;
    locale?: string;
    city?: string;
    state?: string;
    stateAbbr?: string;
    region?: string;
    country: string;
    countryAbbr: string;
    continent?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    currency?: {
      code: string;
      name: string;
      symbol: string;
      format?: string;
    };
    demonym?: string;
    timezone?: string;
    timezoneOffset?: number;
  };
  about?: string;
  contact: {
    organizer?: string;
    primaryContact: PrimaryContact;
  };
  links: {
    website?: string;
    instagram?: string;
    facebook?: string;
    threads?: string;
    email?: string;
    vk?: string;
    phone?: string;
    address?: string;
    linkAggregate?: string;
    youTube?: string;
    other?: string;
  };
  hadFreeCall: boolean;
  updatedAt?: number;
  lastUpdatedBy?: string;
};

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
