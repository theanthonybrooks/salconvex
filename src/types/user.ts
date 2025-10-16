import { Doc, Id } from "~/convex/_generated/dataModel";
import { UserType } from "~/convex/schema";

export const cookiePrefTypes = ["all", "required"] as const;

export type CookiePref = (typeof cookiePrefTypes)[number];

export const userPrefValues = [
  { label: "Auto Apply", value: "autoApply", type: "boolean" },
  { label: "Currency", value: "currency", type: "string" },
  { label: "Timezone", value: "timezone", type: "string" },
  // { label: "Language", value: "language", type: "string" },
  { label: "Theme", value: "theme", type: "string" },
  { label: "Font Size", value: "fontSize", type: "string" },
  { label: "Cookies", value: "cookiePrefs", type: "string" },
] as const;

export const accountTypeOptions = [
  { value: "artist", label: "Artist" },
  { value: "organizer", label: "Organizer" },
];

export const userRoleOptions = [
  { value: "user", label: "User" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "designer", label: "Designer" },
  { value: "partner", label: "Partner" },
  { value: "creator", label: "Creator" },
];

type UserPrefEntry = (typeof userPrefValues)[number];

export type UserPref = {
  [K in UserPrefEntry as K["value"]]?: K["type"] extends "boolean"
    ? boolean
    : K["type"] extends "string"
      ? string
      : never;
};

export type UserPrefType = (typeof userPrefValues)[number]["value"];

export type User = UserType;

export type UserData = {
  userId: Id<"users">;
  user: Doc<"users">;
  userPref: Doc<"userPreferences">;
} | null;

export type UserAccountData = {
  subscription?: Doc<"userSubscriptions">;
  userOrgs: Id<"organizations">[];
};
