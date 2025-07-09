"use client";

import {
  Banana,
  Calendar,
  CalendarHeart,
  CircleCheck,
  Clock,
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
  PaintBucket,
  Pencil,
  Scroll,
  User2,
  Users,
  X,
} from "lucide-react";

import { ArrowDown, ArrowRight, ArrowUp, CheckCircle } from "lucide-react";

import { FaMoneyBill } from "react-icons/fa6";

// interface DataTableRowActionsProps<TData> {
//   row: Row<TData>;
// }

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
  {
    value: "rejected",
    label: "Rejected",
    icon: Banana,
  },
  {
    value: "applied",
    label: "Applied",
    icon: CircleCheck,
  },
  {
    value: "-",
    label: "None",
    icon: X,
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

export const eventStates = [
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
    value: "4. none",
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

// export function DataTableRowActions<TData>({
//   row,
// }: DataTableRowActionsProps<TData>) {
//   const task = taskSchema.parse(row.original);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
//         >
//           <MoreHorizontal />
//           <span className="sr-only">Open menu</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-[160px]">
//         <DropdownMenuItem>Edit</DropdownMenuItem>
//         <DropdownMenuItem>Make a copy</DropdownMenuItem>
//         <DropdownMenuItem>Favorite</DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuSub>
//           <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
//           <DropdownMenuSubContent>
//             <DropdownMenuRadioGroup value={task.label}>
//               {labels.map((label) => (
//                 <DropdownMenuRadioItem key={label.value} value={label.value}>
//                   {label.label}
//                 </DropdownMenuRadioItem>
//               ))}
//             </DropdownMenuRadioGroup>
//           </DropdownMenuSubContent>
//         </DropdownMenuSub>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem>
//           Delete
//           <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
