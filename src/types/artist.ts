import { ApplicationStatus } from "@/types/openCall";
import { Id } from "~/convex/_generated/dataModel";

export interface Artist {
  // _id: Id<"artists">;
  artistId: Id<"users">;
  artistName: string;
  artistNationality?: string[];
  artistResidency?: {
    full?: string;
    city?: string;
    state?: string;
    stateAbbr?: string;
    region?: string;
    country: string;
    countryAbbr: string;
    timezone?: string;
    timezoneOffset?: number;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
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
