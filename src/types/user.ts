import { Doc, Id } from "~/convex/_generated/dataModel";

export const userPrefValues = [
  { label: "Auto Apply", value: "autoApply", type: "boolean" },
  { label: "Currency", value: "currency", type: "string" },
  { label: "Timezone", value: "timezone", type: "string" },
  // { label: "Language", value: "language", type: "string" },
  { label: "Theme", value: "theme", type: "string" },
  { label: "Font Size", value: "fontSize", type: "string" },
] as const;

type UserPrefEntry = (typeof userPrefValues)[number];

export type UserPref = {
  [K in UserPrefEntry as K["value"]]?: K["type"] extends "boolean"
    ? boolean
    : K["type"] extends "string"
      ? string
      : never;
};

export type UserPrefType = (typeof userPrefValues)[number]["value"];

export interface User {
  createdAt: number;
  email: string;
  emailVerificationTime?: number;
  // password: string;
  firstName: string;
  lastName?: string;
  name?: string;
  accountType: string[];
  organizationName?: string;
  source?: string;
  emailVerified?: boolean;
  image?: string;
  userId: string;
  role: string[];
  subscription?: string;
  tokenIdentifier: string;
}

export type UserData = {
  userId: Id<"users">;
  user: Doc<"users">;
  userPref: Doc<"userPreferences">;
} | null;
