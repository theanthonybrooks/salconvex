import { EventCategory, EventType } from "@/types/event"

export const EVENT_TYPE_LABELS: Record<Exclude<EventType, null>, string> = {
  gjm: "Graffiti Jam",
  mur: "Mural Festival",
  pup: "Paste Up/Sticker",
  saf: "Street Art Festival",
  mus: "At Music Festival",
  oth: "Other",
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  event: "Event",
  project: "Mural Project",
  residency: "Residency",
  gfund: "Grant/Funding",
  roster: "Roster",
}
