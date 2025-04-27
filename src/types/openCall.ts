import { ArtistFull } from "@/types/artist";
import { EventData, SubmissionFormState } from "@/types/event";
import { Organizer } from "@/types/organizer";
import { Doc, Id } from "~/convex/_generated/dataModel";

export const callTypeValues = [
  "Fixed",
  "Rolling",
  "Email",
  "Invite",
  "Unknown",
] as const;

export type CallType = (typeof callTypeValues)[number] | null;

export const eligibilityTypeValues = [
  "International",
  "National",
  "Regional/Local",
  "Other",
] as const;

export type EligibilityType = (typeof eligibilityTypeValues)[number] | null;

export const applicationStatusValues = [
  "external apply",
  "applied",
  "considering",
  "to next step",
  "accepted",
  "rejected",
  "pending",
  "roster",
  "shortlisted",
];

export type ApplicationStatus = (typeof applicationStatusValues)[number] | null;

export const openCallStatusValues = ["active", "ended", "coming-soon"] as const;

export type OpenCallStatus = (typeof openCallStatusValues)[number] | null;

export const RateUnitValues = ["ft²", "m²"] as const;

export type RateUnit = (typeof RateUnitValues)[number];

export interface OpenCall {
  _id: Id<"openCalls">;
  _creationTime: number;
  adminNoteOC?: string;

  eventId: string;
  organizerId: string[];
  mainOrgId: string;

  basicInfo: {
    appFee: number;
    callFormat: "RFP" | "RFQ";
    callType: CallType;
    dates: {
      ocStart: string | null; //null for rolling, email, etc or just open calls without dates. Set to null if the call is rolling. Requires type of "Rolling" and will otherwise be invalid/ignored.
      ocEnd: string | null;
      timezone: string; //TODO: Ensure that the accurate timezone is passed when the events are submitted. Get this from the event location?
    };
  };
  eligibility: {
    type: EligibilityType;
    whom: string[];
    details?: string;
  };
  compensation: {
    budget: {
      min: number;
      max?: number;
      rate: number;
      unit: RateUnit;
      currency: string;
      allInclusive: boolean;
      moreInfo?: string;
    };
    categories: {
      designFee?: string;
      accommodation?: string;
      food?: string;
      travelCosts?: string;
      materials?: string;
      equipment?: string;
      other?: string;
    };
  };
  requirements: {
    requirements: string[];
    more: string[];
    destination: string;
    documents?: {
      title: string;
      href: string;
    }[];
    links?: {
      title: string;
      href: string;
    }[];
    otherInfo?: string[];
    applicationLink?: string;
  };
  state: SubmissionFormState;
}

// export interface OpenCallApplication {
//   _id: Id<"applications">;
//   openCallId: string;
//   artistId: string;
//   applicationStatus: ApplicationStatus;
//   manualApplied?: boolean;
//   _creationTime: number;
// }

export type OpenCallApplication = Doc<"applications">;

export interface OpenCallCardProps {
  data: {
    event: EventData;
    openCall: OpenCall;
    organizer: Organizer;
    application?: OpenCallApplication | null;
  };
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
}
