import { ArtistFull } from "@/types/artist";
import { OpenCall } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { Doc, Id } from "~/convex/_generated/dataModel";

export const eventTypeOptions = [
  { value: "gjm", label: "Graffiti Jam" },
  { value: "mur", label: "Mural Festival" },
  { value: "saf", label: "Street Art Festival" },
  { value: "pup", label: "Paste Up/Sticker" },
  { value: "mus", label: "At music festival" },
  { value: "oth", label: "Other" },
] as const;

// export const eventTypeValues = [
//   "gjm",
//   "mur",
//   "pup",
//   "saf",
//   "mus",
//   "oth",
// ] as const;

export const eventTypeValues = eventTypeOptions.map(
  (o) => o.value,
) as readonly [...(typeof eventTypeOptions)[number]["value"][]];
export type EventType = (typeof eventTypeValues)[number];

// export const eventCategoryValues = [
//   "event",
//   "project",
//   "residency",
//   "gfund",
//   "roster",
// ] as const;
// export type EventCategory = (typeof eventCategoryValues)[number];

export const eventCategoryOptions = [
  { value: "event", label: "Event", abbr: "Event" },
  { value: "project", label: "Mural Project", abbr: "Project" },
  { value: "residency", label: "Residency", abbr: "Residency" },
  { value: "gfund", label: "Grant/Funding", abbr: "Grant/Fund" },
  { value: "roster", label: "Roster", abbr: "Roster" },
  
] as const;

export const eventCategoryValues = eventCategoryOptions.map(
  (o) => o.value,
) as readonly [...(typeof eventCategoryOptions)[number]["value"][]];

export type EventCategory = (typeof eventCategoryValues)[number];

export const eventStates = [
  "draft",
  "submitted",
  "published",
  "archived",
] as const;
export type SubmissionFormState = (typeof eventStates)[number];

export const prodFormatValues = [
  "sameAsEvent",
  "setDates",
  "monthRange",
  "yearRange",
  "seasonRange",
] as const;
export type ProdFormat = (typeof prodFormatValues)[number];
export const eventFormatValues = [
  "noEvent",
  "setDates",
  "monthRange",
  "yearRange",
  "seasonRange",
  "ongoing",
] as const;
export type EventFormat = (typeof eventFormatValues)[number];

export interface EventData {
  _id: Id<"events">;
  adminNote?: string;
  organizerId: string[];
  mainOrgId: string;

  name: string;
  slug: string;
  logo: string;
  type?: [EventType] | [EventType, EventType];
  // eventType?: string[];
  category: EventCategory;
  dates: {
    edition: number;
    eventDates: { start: string; end: string }[];
    prodDates?: { start: string; end: string }[];
    eventFormat?: EventFormat;
    prodFormat?: ProdFormat;

    // eventFormat?:
    //   | "noEvent"
    //   | "setDates"
    //   | "monthRange"
    //   | "yearRange"
    //   | "seasonRange"
    //   | "ongoing";
    // prodFormat?: "setDates" | "monthRange" | "yearRange" | "seasonRange";
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
  links?: {
    sameAsOrganizer?: boolean;
    website?: string;
    instagram?: string;
    facebook?: string;
    threads?: string;
    email?: string;
    vk?: string;
    phone?: string;
    address?: string;
    linkAggregate?: string;
    other?: string;
  };
  otherInfo?: string;
  state: SubmissionFormState;
  active?: boolean;
  lastEditedAt?: number;
}

export interface EventCardDetailProps {
  data: { event: EventData; openCall: OpenCall; organizer: Organizer };
  artist?: ArtistFull | null;
}

export interface EventCardProps {
  data: { event: EventData; organizer: Organizer };
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
}

export interface EnrichedEvent extends Doc<"events"> {
  openCallStatus?: string | null;
  openCallId?: Id<"openCalls"> | null;
}
