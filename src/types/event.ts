import { ApplicationStatus } from "@/types/applications";
import { ArtistFull } from "@/types/artist";
import { CallType, OpenCall, OpenCallStatus } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { Doc, Id } from "~/convex/_generated/dataModel";

export const freeEvents = ["gjm", "pup"];
export const paidEvents = ["mur", "saf", "mus", "oth"];

export const noEventCategories = ["residency", "gfund", "roster"];

export const prodOnlyCategories = ["project"];

export const eventTypeOptions = [
  {
    value: "gjm",
    label: "Graffiti Jam",
    abbr: "Graffiti Jam",
    // icon: Paintbrush,
  },
  {
    value: "mur",
    label: "Mural Project",
    abbr: "Mural Project",
    // icon: Paintbrush,
  },
  {
    value: "saf",
    label: "Street Art Festival",
    abbr: "Street Art Fest",
    // icon: Paintbrush,
  },
  {
    value: "pup",
    label: "Paste Up/Sticker",
    abbr: "Paste Up",
    // icon: Paintbrush,
  },
  {
    value: "mus",
    label: "At music festival",
    abbr: "Music Fest",
    // icon: Paintbrush,
  },
  {
    value: "oth",
    label: "Other",
    abbr: "Other",
    // icon: Paintbrush
  },
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
  { value: "roster", label: "Artist Roster", abbr: "Roster" },
] as const;

export const eventCategoryValues = eventCategoryOptions.map(
  (o) => o.value,
) as readonly [...(typeof eventCategoryOptions)[number]["value"][]];

export type EventCategory = (typeof eventCategoryValues)[number];

export const eventStates = [
  "draft",
  "editing",
  "submitted",
  "published",
  "archived",
] as const;
export type SubmissionFormState = (typeof eventStates)[number];

export const approvedStates = ["published", "archived"];

export const prodFormatValues = [
  "sameAsEvent",
  "setDates",
  "monthRange",
  "yearRange",
  "seasonRange",
  "noProd",
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

export const PostStatusOptionValues = [
  { value: "posted", label: "Posted" },
  { value: "toPost", label: "To Post" },
  { value: "all", label: "All" },
] as const;
export const PostStatusValues = PostStatusOptionValues.map(
  (o) => o.value,
) as readonly [...(typeof PostStatusOptionValues)[number]["value"][]];

export type PostStatusOptions = (typeof PostStatusValues)[number];
export type PostStatus = Exclude<PostStatusOptions, "all">;

export interface EventData {
  _id: Id<"events">;
  adminNote?: string;
  organizerId: string[];
  mainOrgId: Id<"organizations">;
  isUserOrg: boolean;

  name: string;
  slug: string;
  logo: string;
  // type?: [EventType] | [EventType, EventType];
  type?: EventType[];
  // eventType?: string[];
  category: EventCategory;
  hasOpenCall: CallType;
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
    full?: string;
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
  blurb?: string;
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
    phoneExt?: string;
    address?: string;
    linkAggregate?: string;
    youTube?: string;
    other?: string;
  };
  otherInfo?: string;
  timeLine?: string;
  state: SubmissionFormState;
  active?: boolean;
  lastEditedAt?: number;
  posted?: PostStatus;
  postedAt?: number;
  postedBy?: string;
  approvedAt?: number;
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

export type PublicEventPreviewData = EventData & {
  openCall: OpenCall | null;
  openCallStatus: OpenCallStatus | null;
  hasActiveOpenCall: boolean;
  orgName: string | null;
  eventId: Id<"events">;
  slug: string;
  tabs: {
    opencall: OpenCall | null;
  };
};

export type ArtistEventMetadata = {
  bookmarked: Id<"events">[];
  hidden: Id<"events">[];
  applied: Id<"events">[];
  artistNationality: string[];
  applicationData: Record<
    Id<"openCalls">,
    {
      status: ApplicationStatus | null;
      manualApplied: boolean;
    }
  >;
};

export type MergedEventPreviewData = PublicEventPreviewData & {
  bookmarked: boolean;
  hidden: boolean;
  applied: boolean;
  manualApplied: boolean;
  status: ApplicationStatus | null;
  artistNationality: string[];
  isUserOrg: boolean;
};

export type CombinedEventPreviewCardData = EventData & {
  tabs: { opencall: OpenCall | null };
  hasActiveOpenCall: boolean;
  appFee?: number;
  openCallStatus: OpenCallStatus | null;
  adminNoteOC?: string | null;
  eventId: string;
  slug: string;

  // User-specific metadata (nullable when unauthenticated)
  isUserOrg: boolean;
  artistNationality: string[];
  bookmarked: boolean;
  hidden: boolean;
  manualApplied?: boolean;
  status: ApplicationStatus | null;
};
