import { ApplicationStatus } from "@/types/applications";
import { Id } from "~/convex/_generated/dataModel";

export interface ArtistResidency {
  full?: string;
  city?: string;
  state?: string;
  stateAbbr?: string;
  region?: string;
  country: string;
  countryAbbr: string;
  timezone?: string;
  timezoneOffset?: number;
  location?: number[];
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
