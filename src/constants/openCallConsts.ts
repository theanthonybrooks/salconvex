import { CallType } from "@/types/openCallTypes";
import { CallFormatType } from "~/convex/schema";

export const CALL_TYPE_LABELS: Record<Exclude<CallType, null>, string> = {
  Fixed: "Fixed Deadline",
  Rolling: "Rolling Open Call",
  Email: "Application via Email",
  Invite: "Invite-Only",
  Unknown: "Unknown Deadline",
  False: "False",
};

export const callFormat_option_values = [
  { label: "RFP", value: "RFP", full: "Request for Proposals" },
  { label: "RFQ", value: "RFQ", full: "Request for Qualifications" },
  { label: "RFA", value: "RFA", full: "Request for Artworks" },
];
export const callFormatValues = [
  ...callFormat_option_values.map((s) => s.value),
] as unknown as readonly [CallFormatType];

export const callTypeValues = [
  "Fixed",
  "Rolling",
  "Email",
  "Invite",
  "Unknown",
  "False",
] as const;

export const validOCVals = ["Fixed", "Rolling", "Email"];
export const openCallStates = [
  "draft",
  "editing",
  "submitted",
  "pending",
  "published",
  "archived",
  "initial",
] as const;

export const publicStateValues = ["published", "archived"];

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

export const openCallCategoryFields = [
  { label: "Artist Stipend", value: "artistStipend" },
  { label: "Design Fee", value: "designFee" },
  { label: "Accommodation", value: "accommodation" },
  { label: "Food", value: "food" },
  { label: "Travel Costs", value: "travelCosts" },
  { label: "Materials", value: "materials" },
  { label: "Equipment", value: "equipment" },
] as const;

export const openCallLinkFormatOptions = [
  { value: "https://", label: "https://" },
  { value: "mailto:", label: "mailto:" },
] as const;

export const openCallStatusValues = ["active", "ended", "coming-soon"] as const;
