import { CallType, OpenCallStatus } from "@/types/openCallTypes";

export function getOpenCallStatus(
  start: Date | null | undefined,
  end: Date | null | undefined,
  ocType: CallType,
): OpenCallStatus | null {
  const now = new Date();

  if (ocType === "Fixed") {
    if (start && end) {
      if (now < start) return "coming-soon";
      if (now > end) return "ended";
      return "active";
    }

    if (!start && end) {
      return now > end ? "ended" : "active";
    }
  }

  if (ocType === "Rolling") return "active";

  if (ocType === "Email" && end) {
    return now > end ? "ended" : "active";
  }

  return null;
}
