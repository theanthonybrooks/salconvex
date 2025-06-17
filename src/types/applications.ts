export const artistStatusOptions = [
  { value: "applied", label: "Applied" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "roster", label: "Roster" },
  { value: "shortlisted", label: "Shortlisted" },
  // { value: "to next step", label: "To next step" },
  // { value: "considering", label: "Considering" },
] as const;

export type ArtistStatus = (typeof artistStatusOptions)[number]["value"];

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

export const positiveApplicationStatuses = [
  "external apply",
  "applied",
  "considering",
  "to next step",
  "accepted",
  "pending",
  "roster",
  "shortlisted",
];

export type ApplicationStatus = (typeof applicationStatusValues)[number] | null;

export type NonNullApplicationStatus = Exclude<ApplicationStatus, null>;

export const statusColorMap: Record<NonNullApplicationStatus, string> = {
  accepted: "text-green-600",
  rejected: "text-red-600",
  roster: "text-blue-600",
  shortlisted: "text-yellow-600",
  "to next step": "text-orange-600",
  considering: "text-purple-600",
  applied: "text-gray-600",
  "external apply": "text-gray-500",
  pending: "text-neutral-500",
};
export const statusBgColorMap: Record<NonNullApplicationStatus, string> = {
  accepted: "bg-green-100",
  rejected: "bg-red-100",
  roster: "bg-sky-100",
  shortlisted: "bg-yellow-100",
  "to next step": "bg-orange-100",
  considering: "bg-purple-100",
  applied: "bg-gray-100",
  "external apply": "bg-gray-100",
  pending: "bg-neutral-100",
};
