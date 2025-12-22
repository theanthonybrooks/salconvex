import type { FunctionReturnType } from "convex/server";
import { ArtistFull } from "@/types/artist";
import { OpenCall, OpenCallStatus } from "@/types/openCallTypes";

import type { api } from "~/convex/_generated/api";
import type { ApplicationStatus } from "~/convex/schema";

import { Doc, Id } from "~/convex/_generated/dataModel";
import {
  EventCategoryType,
  EventFormatType,
  EventLookupOrgBase,
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
export type EventLocation = EventData["location"];

export type EnrichedEventData = EventData & {
  isUserOrg: boolean;
  hasActiveOpenCall?: boolean;
};

type EventEditionDataResult = FunctionReturnType<
  typeof api.events.event.getEventWithDetails
>;
export type EventEditionResult = NonNullable<EventEditionDataResult>;

type EventDataResult = FunctionReturnType<
  typeof api.events.event.getEventBySlug
>;

export type EventBaseResult = NonNullable<EventDataResult>;

// export type EventCardDetailProps = {
//   data: { event: EnrichedEventData; openCall: OpenCall; organizer: Organizer };
//   artist?: ArtistFull | null;
// };

export type EventCardProps = {
  data: EventEditionResult;
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
};

export type EnrichedEvent = EventData & {
  openCallStatus?: OpenCallStatus | null;
  openCallId?: Id<"openCalls"> | null;
};

export type ArtistListDataBase = {
  artistNationality: string[];
  bookmarked: boolean;
  hidden: boolean;
  manualApplied: boolean;
  status: ApplicationStatus | null;
  applied: boolean;
};

export type PublicEventPreviewData = EnrichedEventData & {
  tabs: {
    openCall: OpenCall | null;
  };
  hasActiveOpenCall: boolean;
  openCallStatus: OpenCallStatus | null;
  orgData: EventLookupOrgBase | null;
  eventId: Id<"events">;
  slug: string;
};

export type MergedEventPreviewData = PublicEventPreviewData &
  ArtistListDataBase;
