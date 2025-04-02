import { EventType } from "@/types/event";

export function assertValidEventType(
  eventType: string[],
): [EventType] | [EventType, EventType] {
  if (eventType.length === 1 || eventType.length === 2) {
    if (
      eventType.every((et) =>
        ["gjm", "mur", "pup", "saf", "mus", "oth"].includes(et),
      )
    ) {
      return eventType as [EventType] | [EventType, EventType];
    }
  }

  throw new Error(`Invalid eventType array: ${JSON.stringify(eventType)}`);
}
