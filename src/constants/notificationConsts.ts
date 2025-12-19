import type { NotificationType } from "~/convex/schema";

const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  "newEvent",
  "newOpenCall",
  "newResource",
  "account",
  "newSubmission",
  "newTaskAssignment",
  "newSac",
  "newOERegistration",
  "newOECancellation",
  "newSupport",
  "supportUpdated",
  "newSocial",
  "socialUpdated",
  "campaignCreated",
  "campaignCompleted",
  "campaignFailed",
  "audienceSubscribed",
  "audienceUnsubscribed",
  "newMessage",
  "newFollow",
  "newResponse",
  "newApplication",
];

export function randomNotificationType(): NotificationType {
  const i = Math.floor(Math.random() * ALL_NOTIFICATION_TYPES.length);
  return ALL_NOTIFICATION_TYPES[i]!;
}
