"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/features/artists/applications/data-table/data-table-column-header";
import { getEventCategoryLabelAbbr, getEventTypeLabel } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { EventType, SubmissionFormState } from "@/types/event";
import { CheckCircle2, Circle } from "lucide-react";
import { FaRegFloppyDisk } from "react-icons/fa6";
import { Id } from "~/convex/_generated/dataModel";

export const columnLabels: Record<string, string> = {
  name: "Name",
  dates_edition: "Edition",
  state: "State",
  lastEditedAt: "Last Edited",
  category: "Category",
  type: "Event Type",
};

export type Event = {
  _id: Id<"events">;
  name: string;
  dates: {
    edition: number;
  };
  state: SubmissionFormState;
  category: string;
  type: EventType[];
  lastEditedAt?: number;
};

export const columns: ColumnDef<Event>[] = [
  {
    id: "select",
    size: 30,
    minSize: 30,
    maxSize: 30,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={() => table.toggleAllRowsSelected(false)}
        aria-label="Deselect all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    size: 120,
    minSize: 120,
    maxSize: 300,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20ch] truncate pl-1 font-medium sm:max-w-[500px] sm:pl-0">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "dates.edition",
    size: 60,
    minSize: 60,
    maxSize: 60,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center space-x-2">
          <span className="max-w-[60px] truncate font-medium">
            {row.getValue("dates_edition")}
          </span>
        </div>
      );
    },
  },

  //TODO: Make optional column
  //   {
  //     accessorKey: "type",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Type" />
  //     ),
  //     cell: ({ row }) => {
  //       return (
  //         <div className="flex space-x-2">
  //           <span className="max-w-[500px] truncate font-medium">
  //             {row.getValue("eventType")}
  //           </span>
  //         </div>
  //       );
  //     },
  //   },

  {
    accessorKey: "state",
    size: 130,
    minSize: 130,
    maxSize: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),

    cell: ({ row }) => {
      const state = row.getValue("state") as SubmissionFormState;
      return (
        <div className="flex justify-center">
          <div
            className={cn(
              "flex w-max items-center justify-center gap-1 rounded border p-2 px-4",
              state === "draft" && "bg-orange-200",
              state === "submitted" && "bg-blue-200",
              state === "published" && "bg-green-200",
            )}
          >
            {state === "draft" ? (
              <FaRegFloppyDisk className="size-4 shrink-0" />
            ) : state === "submitted" ? (
              <Circle className="size-4 shrink-0" />
            ) : state === "published" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0" />
            )}
            <span className="capitalize">{state}</span>
          </div>
        </div>
      );
    },
  },

  //   {
  //     accessorKey: "priority",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Priority" />
  //     ),
  //     cell: ({ row }) => {
  //       const priority = priorities.find(
  //         (priority) => priority.value === row.getValue("priority"),
  //       );

  //       if (!priority) {
  //         return null;
  //       }

  //       return (
  //         <div className="flex items-center">
  //           {priority.icon && (
  //             <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //           )}
  //           <span>{priority.label}</span>
  //         </div>
  //       );
  //     },
  //     filterFn: (row, id, value) => {
  //       return value.includes(row.getValue(id));
  //     },
  //   },
  {
    accessorKey: "lastEditedAt",
    size: 180,
    minSize: 180,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Edited" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="flex justify-center space-x-2">
          <span className="max-w-[175px] truncate font-medium capitalize">
            {!isNaN(new Date(value).getTime())
              ? new Date(value).toLocaleString()
              : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    size: 80,
    minSize: 80,
    maxSize: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center space-x-2">
          <span className="min-w-20 max-w-[500px] truncate font-medium capitalize">
            {getEventCategoryLabelAbbr(row.getValue("category"))}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    size: 120,
    minSize: 120,
    maxSize: 240,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Type" />
    ),
    cell: ({ row }) => {
      const types = row.getValue("type") as EventType[];

      return (
        <div className="flex justify-center space-x-2">
          <span className="min-w-20 max-w-[500px] truncate font-medium capitalize">
            {Array.isArray(types) && types.length > 0
              ? types.map((type) => getEventTypeLabel(type)).join(", ")
              : "-"}
          </span>
        </div>
      );
    },
  },
  // {
  //   id: "actions",
  //   size: 32,
  //   maxSize: 32,
  //   minSize: 32,
  //   enableResizing: false,
  //   cell: ({ row }) => {
  //     const payment = row.original;

  //     return (
  //       <div className="hidden justify-end md:flex">
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button
  //               variant="outline"
  //               className="ml-auto size-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70"
  //             >
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="size-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem
  //               onClick={() => navigator.clipboard.writeText(payment._id)}
  //             >
  //               Copy Event ID
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>Duplicate</DropdownMenuItem>
  //             {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       </div>
  //     );
  //   },
  // },
];
