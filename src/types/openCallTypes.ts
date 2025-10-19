import {
  openCallCategoryFields,
  openCallStatusValues,
} from "@/constants/openCallConsts";
import { ArtistFull } from "@/types/artist";
import { EnrichedEventData } from "@/types/eventTypes";
import { Organizer } from "@/types/organizer";
import { Doc, Id } from "~/convex/_generated/dataModel";
import {
  CallFormatType,
  EligibilityTypeType,
  LinkFormatType,
  OpenCallStateType,
  OpenCallTypeType,
  RateUnitType,
  UserPrefsType,
} from "~/convex/schema";

export type CallFormat = CallFormatType;
export type OpenCallState = OpenCallStateType;
export type CallType = OpenCallTypeType;
export type EligibilityType = EligibilityTypeType;
export type OpenCallCategoryKey =
  (typeof openCallCategoryFields)[number]["value"];
export type OpenCallStatus = (typeof openCallStatusValues)[number] | null;
export type RateUnit = RateUnitType;
export type OpenCallLinkFormat = LinkFormatType;
export type openCallFileType = {
  id?: Id<"openCallFiles">;
  title: string;
  href: string;
  archived?: boolean;
};

export type OpenCall = Doc<"openCalls">;
export type OpenCallApplication = Doc<"applications">;

export interface OpenCallData {
  event: EnrichedEventData;
  openCall: OpenCall;
  organizer: Organizer;
  application?: OpenCallApplication | null;
}

export interface OpenCallCardProps {
  data: OpenCallData;
  userPref: UserPrefsType | null;
  artist?: ArtistFull | null; //todo:make this required
  className?: string;
}
