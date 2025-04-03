import { ArtistFull } from "@/types/artist";
import { OpenCall } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { Id } from "~/convex/_generated/dataModel";

export type EventType = "gjm" | "mur" | "pup" | "saf" | "mus" | "oth";
export type EventCategory =
  | "event"
  | "project"
  | "residency"
  | "gfund"
  | "roster";

export type SubmissionFormState =
  | "draft"
  | "submitted"
  | "published"
  | "archived";

export interface EventData {
  _id: Id<"events">;
  adminNote?: string;
  organizerId: string[];
  mainOrgId: string;
  openCallId: string[]; //list the open call id's that are associated with this event

  name: string;
  slug: string;
  logo: string;
  eventType?: [EventType] | [EventType, EventType];
  // eventType?: string[];
  eventCategory: EventCategory;
  dates: {
    edition: number;
    eventStart?: string;
    eventEnd?: string;
    ongoing: boolean;
  };

  location: {
    sameAsOrganizer?: boolean;
    locale?: string;
    city?: string;
    state?: string;
    stateAbbr?: string;
    region?: string;
    country: string;
    countryAbbr?: string;
    continent?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  about?: string;
  links: {
    type: string;
    title: string;
    href: string;
    handle?: string;
  }[];
  otherInfo?: string[];
  state: SubmissionFormState;
}

export interface EventCardDetailProps {
  data: { event: EventData; openCall: OpenCall; organizer: Organizer };
  artist?: ArtistFull | null;
}
