import {
  openCallCategoryFields,
  openCallStatusValues,
} from "@/constants/openCallConsts";

import type { EventBaseProps } from "@/types/eventTypes";
import type { FunctionReturnType } from "convex/server";

import type { api } from "~/convex/_generated/api";

import { Doc, Id } from "~/convex/_generated/dataModel";
import {
  CallFormatType,
  EligibilityTypeType,
  LinkFormatType,
  OpenCallStateType,
  OpenCallTypeType,
  RateUnitType,
} from "~/convex/schema";

type OpenCallDataResult = FunctionReturnType<
  typeof api.events.event.getEventWithOCDetails
>;
export type OpenCallData = NonNullable<OpenCallDataResult>;

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

// export interface OpenCallData {
//   event: EnrichedEventData;
//   openCall: OpenCall;
//   organizer: Organizer;
//   application?: OpenCallApplication | null;
// }

export type OpenCallCardProps = EventBaseProps & {
  data: OpenCallData;
};
