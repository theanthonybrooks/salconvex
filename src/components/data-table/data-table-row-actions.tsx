"use client";

import {
  Banana,
  Calendar,
  Clock,
  House,
  List,
  PaintBucket,
  Pencil,
  Scroll,
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
    icon: Pencil,
  },
  {
    value: "1b. yearly-original",
    label: "Yearly-Original",
    icon: Clock,
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
    icon: Pencil,
  },
  {
    value: "3b. yearly-fatcap",
    label: "Yearly-Fatcap",
    icon: Clock,
  },
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
