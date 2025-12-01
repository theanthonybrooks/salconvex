"use client";

import { eventTypeOptions } from "@/constants/eventConsts";
import { onlineEventCategories } from "@/constants/resourcesConsts";

import type { DataTableFacetedFilterOption } from "@/components/data-table/DataTableFacetedFilter";
import type { PageTypes, TableTypes } from "@/types/tanstack-table";

import { BsRobot } from "react-icons/bs";
import { FaMoneyBill } from "react-icons/fa6";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Banana,
  Calendar,
  CalendarHeart,
  CheckCircle,
  CircleCheck,
  Clock,
  DollarSign,
  Ghost,
  House,
  List,
  LucideBaby,
  LucideBadge,
  LucideBadgeAlert,
  LucideBadgeCheck,
  LucideBadgeX,
  LucideCircleCheck,
  LucideCircleDashed,
  LucideCircleDollarSign,
  Mail,
  Paintbrush,
  Paintbrush2,
  PaintBucket,
  Pencil,
  Scroll,
  User,
  User2,
  Users,
  X,
} from "lucide-react";

import { EventStateType } from "~/convex/schema";

// interface DataTableRowActionsProps<TData> {
//   row: Row<TData>;
// }
const startYear = 2025;
const endYear = new Date().getFullYear() + 1;

const editionOptions = Array.from(
  { length: endYear - startYear + 1 },
  (_, i) => {
    const year = startYear + i;
    return { value: String(year), label: String(year) };
  },
);

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const bookmarkIntents = [
  {
    value: "planned",
    label: "Planned",
    icon: Calendar,
  },
  {
    value: "missed",
    label: "Missed",
    icon: Clock,
  },
  {
    value: "nextYear",
    label: "Next Year",
    icon: CalendarHeart,
  },
  {
    value: "contact",
    label: "Contact",
    icon: Mail,
  },
  // {
  //   value: "rejected",
  //   label: "Rejected",
  //   icon: CircleX,
  // },
  {
    value: "applied",
    label: "Applied",
    icon: CircleCheck,
  },
  {
    value: "-",
    label: "None",
    icon: X,
    // disabled: true,
  },
];

export const appStatusOptions = [
  {
    value: "applied",
    label: "Applied",
    icon: LucideBadge,
  },
  {
    value: "accepted",
    label: "Accepted",
    icon: LucideBadgeCheck,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: LucideBadgeAlert,
  },
  {
    value: "roster",
    label: "Roster",
    icon: LucideBadgeCheck,
  },
  {
    value: "shortlisted",
    label: "Shortlisted",
    icon: LucideBadgeCheck,
  },
];

export const appStatusOptionValues = appStatusOptions.map((opt) => opt.value);

export const eventStates = [
  {
    value: "draft",
    label: "Draft",
    icon: Pencil,
  },
  { value: "editing", label: "Editing", icon: Pencil },
  {
    value: "submitted",
    label: "Submitted",
    icon: Clock,
  },
  { value: "pending", label: "Pending", icon: DollarSign },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle,
  },
  {
    value: "archived",
    label: "Archived",
    icon: Scroll,
  },
];
export const eventStates2 = [
  {
    value: "draft",
    label: "Draft",
    icon: Pencil,
  },
  { value: "editing", label: "Editing", icon: Pencil },
  {
    value: "submitted",
    label: "Submitted",
    icon: Clock,
  },
  { value: "pending", label: "Pending", icon: DollarSign },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle,
  },
  {
    value: "archived",
    label: "Archived",
    icon: Scroll,
  },
] as const;

export const eventStateValues = [
  ...eventStates.map((s) => s.value),
] as unknown as readonly [EventStateType];

export const openCallStates = [
  {
    value: "draft",
    label: "Draft",
    icon: Pencil,
  },
  {
    value: "submitted",
    label: "Submitted",
    icon: Clock,
  },
  { value: "pending", label: "Pending", icon: DollarSign },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle,
  },
  {
    value: "archived",
    label: "Archived",
    icon: Scroll,
  },
];

export const eventCategories = [
  {
    value: "event",
    label: "Event",
    icon: Calendar,
  },
  {
    value: "project",
    label: "Project",
    icon: PaintBucket,
  },
  {
    value: "residency",
    label: "Residency",
    icon: House,
  },
  {
    value: "gfund",
    label: "Grant/Fund",
    icon: FaMoneyBill,
  },
  {
    value: "roster",
    label: "Roster",
    icon: List,
  },
];

export const eventTypes = [
  {
    value: "Graffiti Jam",
    label: "Graffiti Jam",
    icon: Paintbrush2,
  },
  {},
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
];

export const subscriptionOptions = [
  {
    value: "1a. monthly-original",
    label: "Monthly-Original",
    icon: LucideCircleCheck,
  },
  {
    value: "1b. yearly-original",
    label: "Yearly-Original",
    icon: LucideCircleCheck,
  },
  {
    value: "2a. monthly-banana",
    label: "Monthly-Banana",
    icon: Banana,
  },
  {
    value: "2b. yearly-banana",
    label: "Yearly-Banana",
    icon: Banana,
  },

  {
    value: "3a. monthly-fatcap",
    label: "Monthly-Fatcap",
    icon: LucideCircleDollarSign,
  },
  {
    value: "3b. yearly-fatcap",
    label: "Yearly-Fatcap",
    icon: LucideCircleDollarSign,
  },
  {
    value: "-",
    label: "No Subscription",
    icon: LucideCircleDashed,
  },
];

export const subscriptionStatusOptions = [
  {
    value: "active",
    label: "Active",
    icon: LucideBadgeCheck,
  },
  {
    value: "trialing",
    label: "Trialing",
    icon: LucideBaby,
  },
  {
    value: "past_due",
    label: "Past Due",
    icon: LucideBadgeAlert,
  },
  { value: "payment_failed", label: "Payment Failed", icon: BsRobot },
  {
    value: "canceled",
    label: "Canceled",
    icon: LucideBadgeX,
  },
  { value: "-", label: "None", icon: LucideBadge },
];

export const accountTypeOptions = [
  { value: "artist", label: "Artist", icon: Paintbrush },
  { value: "organizer", label: "Organizer", icon: User2 },
  { value: "both", label: "Both", icon: Users },
];

interface FilterConfig {
  columnId: string;
  pageType?: PageTypes;
  title: string;
  options: DataTableFacetedFilterOption[];
  showWhenMinimal?: boolean; // optional flag
}

type TableFilterConfig = Record<TableTypes, FilterConfig[]>;

export const TABLE_FILTERS: TableFilterConfig = {
  resources: [
    { columnId: "state", title: "Status", options: onlineEventCategories },
  ],
  userAddOns: [
    {
      columnId: "canceled",
      title: "Status",
      options: [
        { value: "true", label: "Canceled" },
        { value: "false", label: "Active" },
      ],
    },
  ],
  newsletter: [
    {
      columnId: "active",
      title: "Active",
      options: [
        { value: true, label: "Active" },
        { value: false, label: "Inactive" },
      ],
    },
    {
      columnId: "userPlan",
      title: "Plan",
      options: [
        { value: "0", label: "None" },
        { value: "1", label: "Original" },
        { value: "2", label: "Banana" },
        { value: "3", label: "Fat Cap" },
      ],
    },
    {
      columnId: "userType",
      title: "User Type",
      options: [
        { icon: User, value: "user", label: "User" },
        { icon: Ghost, value: "guest", label: "Guest" },
      ],
    },
  ],
  events: [
    { columnId: "state", title: "State", options: eventStates },
    {
      columnId: "openCallState",
      title: "Open Call",
      options: eventStates,
      pageType: "dashboard",
    },
    {
      columnId: "category",
      title: "Category",
      options: eventCategories,
      pageType: "dashboard",
    },
  ],
  openCalls: [
    { columnId: "state", title: "State", options: eventStates },
    { columnId: "openCallState", title: "Open Call", options: eventStates },
    { columnId: "category", title: "Category", options: eventCategories },
  ],
  orgEvents: [
    { columnId: "category", title: "Category", options: eventCategories },
    { columnId: "type", title: "Event Type", options: [...eventTypeOptions] },
    { columnId: "state", title: "State", options: eventStates },
    { columnId: "openCallState", title: "Open Call", options: openCallStates },
  ],
  artists: [
    {
      columnId: "feature",
      title: "Feature",
      options: [
        { value: true, label: "Feature" },
        { value: false, label: "Don't Feature" },
        { value: "none", label: "Unchecked" },
      ],
    },
    {
      columnId: "canFeature",
      title: "Can Feature",
      options: [
        { value: true, label: "Can Feature" },
        { value: false, label: "Can't Feature" },
      ],
    },
    {
      columnId: "instagram",
      title: "Insta",
      options: [
        { value: true, label: "Has Instagram" },
        { value: false, label: "No Instagram" },
      ],
    },
  ],
  users: [
    {
      columnId: "subscription",
      title: "Subscription",
      options: subscriptionOptions,
    },
    {
      columnId: "subStatus",
      title: "Status",
      options: subscriptionStatusOptions,
    },
    {
      columnId: "accountType",
      title: "Account Type",
      options: accountTypeOptions,
    },
  ],
  applications: [
    {
      columnId: "applicationStatus",
      title: "Status",
      options: appStatusOptions,
    },
    {
      columnId: "edition",
      title: "Edition",
      options: editionOptions,
    },
  ],
  bookmarks: [
    {
      columnId: "eventIntent",
      title: "Reason",
      options: bookmarkIntents,
    },
    {
      columnId: "edition",
      title: "Edition",
      options: editionOptions,
    },
  ],
  organizations: [],
  organizationStaff: [],
  socials: [],
  hidden: [
    {
      columnId: "edition",
      title: "Edition",
      options: editionOptions,
    },
  ],
};
