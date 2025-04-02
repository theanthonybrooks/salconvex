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
  applications: Applications[];
  listActions: ListActions[];
}

export interface Applications {
  openCallId: string;
  applicationId: string;
  applicationStatus: ApplicationStatus;
}

export interface ListActions {
  eventId: string;
  hidden: boolean;
  bookmarked: boolean;
}
