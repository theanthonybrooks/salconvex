import { CallType } from "@/types/openCall";

export const CALL_TYPE_LABELS: Record<Exclude<CallType, null>, string> = {
  Fixed: "Fixed Deadline",
  Rolling: "Rolling Open Call",
  Email: "Application via Email",
  Invite: "Invite-Only",
  Unknown: "Unknown Deadline",
  False: "False",
};
