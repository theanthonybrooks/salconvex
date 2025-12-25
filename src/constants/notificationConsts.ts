import type { IconType } from "react-icons";

import { FaMobileAlt } from "react-icons/fa";
import {
  Bell,
  Calendar,
  CalendarCheck,
  CircleAlert,
  CircleFadingPlus,
  InfoIcon,
  ListTodo,
  MailCheck,
  MailMinus,
  MailPlus,
  Mails,
  MailWarning,
  Megaphone,
  MessageSquareMore,
  PaintRoller,
  UserMinus,
  UserPlus,
} from "lucide-react";

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

export const notificationTypeIconMap: Record<NotificationType, IconType> = {
  newEvent: Calendar,
  newOpenCall: Megaphone,
  newResource: Bell,
  //
  account: InfoIcon,
  newSubmission: CircleFadingPlus,
  newTaskAssignment: ListTodo,
  newUser: UserPlus,
  newSac: PaintRoller,
  newSubscription: UserPlus,
  canceledSubscription: UserMinus,
  //
  newOERegistration: UserPlus,
  newOECancellation: UserMinus,
  //
  newSupport: CircleAlert,
  supportUpdated: CircleAlert,
  //
  newSocial: FaMobileAlt,
  socialUpdated: CalendarCheck,
  //
  campaignCreated: Mails,
  campaignCompleted: MailCheck,
  campaignFailed: MailWarning,
  audienceSubscribed: MailPlus,
  audienceUnsubscribed: MailMinus,
  //
  newMessage: MessageSquareMore,
  newFollow: Bell,
  newResponse: Bell,
  newApplication: Bell,
  general: Bell,
};
