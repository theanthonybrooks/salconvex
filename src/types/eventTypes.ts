import { ApplicationStatus } from "@/types/applications";
import { ArtistFull } from "@/types/artist";
import { OpenCall, OpenCallStatus } from "@/types/openCallTypes";
import { Organizer } from "@/types/organizer";
import { Doc, Id } from "~/convex/_generated/dataModel";
import {
  EventCategoryType,
  EventFormatType,
  EventStateType,
  EventTypeType,
  PostStatusType,
  ProdFormatType,
} from "~/convex/schema";

export type EventType = EventTypeType;
export type EventCategory = EventCategoryType;
export type SubmissionFormState = EventStateType;
export type ProdFormat = ProdFormatType;
export type EventFormat = EventFormatType;
export type PostStatusOptions = PostStatusType | "all";
export type PostStatus = PostStatusType;

export type EventData = Doc<"events">;

export type EnrichedEventData = EventData & {
  isUserOrg: boolean;
};

export type EventCardDetailProps = {
  data: { event: EnrichedEventData; openCall: OpenCall; organizer: Organizer };
  artist?: ArtistFull | null;
};

export type EventCardProps = {
  data: { event: EnrichedEventData; organizer: Organizer };
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
};

export type EnrichedEvent = EventData & {
  openCallStatus?: OpenCallStatus | null;
  openCallId?: Id<"openCalls"> | null;
};

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
