import { ApplicationStatus } from "@/types/applications";
import { Id } from "~/convex/_generated/dataModel";

export interface ArtistResidency {
  full?: string;
  locale?: string;
  city?: string;
  region?: string;
  state?: string;
  stateAbbr?: string;
  country: string;
  countryAbbr: string;
  continent?: string;

  timezone?: string;
  timezoneOffset?: number;
  location?: number[];
  currency?: {
    code: string;
    name: string;
    symbol: string;
    format?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Artist {
  // _id: Id<"artists">;
  artistId: Id<"users">;
  artistName: string;
  artistNationality?: string[];
  artistResidency?: ArtistResidency;
  documents: {
    cv?: string;
    resume?: string;
    artistStatement?: string;
    images?: string[];
  };
  contact: {
    website?: string;
    instagram?: string;
    facebook?: string;
    threads?: string;
    vk?: string;
    phone?: string;
    youTube?: string;
    linkedIn?: string;
  };
  canFeature?: boolean;
}

export interface ArtistFull extends Artist {
  applications: Applications[];
  listActions: ListActions[];
}

export interface Applications {
  artistId: Id<"users">;
  openCallId: string;
  applicationStatus: ApplicationStatus;
  manualApplied?: boolean;
}

export interface ListActions {
  eventId: string;
  hidden: boolean;
  bookmarked: boolean;
}

export type SubPage =
  | "accepted"
  | "rejected"
  | "pending"
  | "submitted"
  | "bookmarks"
  | "hidden";
