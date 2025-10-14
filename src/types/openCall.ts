import { ArtistFull } from "@/types/artist";
import { EventData } from "@/types/event";
import { Organizer } from "@/types/organizer";
import { UserPref } from "@/types/user";
import { Doc, Id } from "~/convex/_generated/dataModel";

export const callFormatValues = ["RFP", "RFQ", "RFA"] as const;
export const callFormatMap: Record<string, string> = {
  RFP: "Request for Proposals",
  RFQ: "Request for Qualifications",
  RFA: "Request for Artworks",
};

export type CallFormat = (typeof callFormatValues)[number];

export const validOCVals = ["Fixed", "Rolling", "Email"];
export const invalidOCVals = ["Invite", "Unknown", "False"];

export const hasOCDates = ["Fixed"];

export const openCallStates = [
  "draft",
  "editing",
  "submitted",
  "pending",
  "published",
  "archived",
  "initial",
] as const;
export type OpenCallState = (typeof openCallStates)[number];

export const publicStateValues = ["published", "archived"];

export const callTypeValues = [
  "Fixed",
  "Rolling",
  "Email",
  "Invite",
  "Unknown",
  "False",
] as const;

export type CallType = (typeof callTypeValues)[number];

export const callFormat_option_values = [
  { label: "RFP", value: "RFP" },
  { label: "RFQ", value: "RFQ" },
  { label: "RFA", value: "RFA" },
];

export const callType_option_values = [
  { label: "Fixed Dates", value: "Fixed" },
  { label: "Rolling Call", value: "Rolling" },
  { label: "Email", value: "Email" },
  { label: "Invite Only", value: "Invite" },
];

export const eligibilityOptionValues = [
  {
    full: "International Artists (All)",
    label: "International",
    value: "International",
  },
  { full: "National Artists", label: "National", value: "National" },
  {
    full: "Regional/Local Artists",
    label: "Regional/Local",
    value: "Regional/Local",
  },
  { full: "Other (specify below - Required)", label: "Other", value: "Other" },
  { full: "Unknown", label: "Unknown", value: "Unknown" },
] as const;

export type EligibilityType = (typeof eligibilityOptionValues)[number]["value"];

export const openCallCategoryFields = [
  { label: "Artist Stipend", value: "artistStipend" },
  { label: "Design Fee", value: "designFee" },
  { label: "Accommodation", value: "accommodation" },
  { label: "Food", value: "food" },
  { label: "Travel Costs", value: "travelCosts" },
  { label: "Materials", value: "materials" },
  { label: "Equipment", value: "equipment" },
] as const;

export type OpenCallCategoryKey =
  (typeof openCallCategoryFields)[number]["value"];

export const openCallStatusValues = ["active", "ended", "coming-soon"] as const;

export type OpenCallStatus = (typeof openCallStatusValues)[number] | null;

export const RateUnitValues = ["ft²", "m²", ""] as const;

export type RateUnit = (typeof RateUnitValues)[number];

export const openCallLinkFormatOptions = [
  { value: "https://", label: "https://" },
  { value: "mailto:", label: "mailto:" },
] as const;

export type OpenCallLinkFormat =
  (typeof openCallLinkFormatOptions)[number]["value"];

export type openCallFileType = {
  id?: Id<"openCallFiles">;
  title: string;
  href: string;
  archived?: boolean;
};

export interface OpenCall {
  _id: Id<"openCalls">;
  _creationTime: number;
  adminNoteOC?: string;

  eventId: string;
  organizerId: string[];
  mainOrgId: string;

  basicInfo: {
    appFee: number;
    callFormat: CallFormat;
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
      [K in OpenCallCategoryKey]?: number | boolean;
    };
  };
  selectionCriteria?: string;
  requirements: {
    requirements: string;
    more?: string;
    destination?: string;
    links?: {
      title: string;
      href: string;
    }[];
    otherInfo?: string;
    applicationLink?: string;
    applicationLinkFormat?: OpenCallLinkFormat;
    applicationLinkSubject?: string;
  };
  documents?: openCallFileType[];
  state?: OpenCallState;
  paid?: boolean;
  paidAt?: number;
  publicPreview?: boolean;
  approvedAt?: number;
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

export interface OpenCallData {
  event: EventData;
  openCall: OpenCall;
  organizer: Organizer;
  application?: OpenCallApplication | null;
}

export interface OpenCallCardProps {
  data: OpenCallData;
  userPref: UserPref | null;
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
}
