"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import slugify from "slugify";

import { Check, Pencil } from "lucide-react";

import type { OnlineEventStateType } from "~/convex/schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { OnlineEventDialog } from "@/features/extras/components/online-event-dialog";
import {
  GoToOnlineEvent,
  OnlineEventStatusBtn,
} from "@/features/extras/components/online-event-table-actions";
import { cn } from "@/helpers/utilsFns";

import { Id } from "~/convex/_generated/dataModel";

export const newsletterColumnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  active: "Active",
  type: "Type",
  frequency: "Frequency",
  userPlan: "Plan",
  timesAttempted: "Attempts",
  lastAttempt: "Last Attempt",
  createdAt: "Created",
};

// const getAllOnlineEvents: RegisteredQuery<"public", EmptyObject, Promise<{
//  [x]   _id: Id<"onlineEvents">;
//  [x]   _creationTime: number;
//  [x]   updatedAt?: number | undefined;
//  [x]   location?: string | undefined;
//  [x]   img?: string | undefined;
//  []   updatedBy?: Id<"users"> | undefined;
//  [x]   name: string;
//  [x]   organizer: Id<"users">;
//  []   slug: string;
//  [x]   requirements: string[];
//  [x]   description: string;
//  [x]   regDeadline: number;
//  [x]   startDate: number;
//  [x]   endDate: number;
//  [x]   price: number;
//  [x]   capacity: {
//  [x]       max: number;
//  [x]       current: number;
//  []   };
//  [x]   terms: string[];
// }[]>>

interface ExtraColumnsProps {
  _id: Id<"onlineEvents">;
  name: string;
  img?: string;
  description: string;
  startDate: number;
  endDate: number;
  regDeadline: number;
  price: number;
  capacity: {
    max: number;
    current: number;
  };
  organizer: Id<"users">;
  terms: string[];
  requirements: string[];
  location: string;
  updatedAt?: number;
  createdAt: number;
  state: OnlineEventStateType;
}

export const extraColumns: ColumnDef<ExtraColumnsProps>[] = [
  {
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 40,
    cell: ({ row }) => {
      return (
        <div
          className="text-center text-sm text-muted-foreground"
          onClick={() => {
            row.toggleSelected();
            console.log(row.original._id);
          }}
        >
          {row.index + 1}
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      void columnId;
      return rowA.index - rowB.index;
    },
    enableHiding: false,
  },
  {
    accessorKey: "name",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { name } = row.original;
      const slug = slugify(name, { lower: true, strict: true });
      return (
        <div className="truncate font-medium">
          <GoToOnlineEvent slug={slug}>{name}</GoToOnlineEvent>
        </div>
      );
    },
  },
  {
    accessorKey: "state",
    id: "state",
    minSize: 150,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { state } = row.original;
      return <OnlineEventStatusBtn eventId={row.original._id} state={state} />;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
    enableMultiSort: true,
    sortUndefined: "last",
  },
  {
    accessorKey: "img",
    minSize: 60,
    maxSize: 90,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const { img } = row.original;
      return (
        <div className="flex justify-center">
          {img && <Image src={img} alt="Event Image" width={100} height={50} />}
        </div>
      );
    },
  },

  {
    accessorKey: "startDate",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const { startDate } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize">
          {new Date(startDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      );
    },
  },

  {
    accessorKey: "endDate",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const { endDate } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize">
          {new Date(endDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "regDeadline",
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const { regDeadline } = row.original;
      // console.log(plan);
      return (
        <div>
          {new Date(regDeadline).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "price",
    minSize: 50,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const { price } = row.original;
      return (
        <div className="truncate text-center text-sm">
          {price ? `$${price.toLocaleString()}` : "-"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "capacity",
    minSize: 70,
    maxSize: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacity" />
    ),
    cell: ({ row }) => {
      const { capacity } = row.original;
      const fullCapacity = capacity.current === capacity.max;
      return (
        <div
          className={cn(
            "flex items-center justify-center gap-1 truncate text-center text-sm",
            fullCapacity && "font-bold text-green-700",
          )}
        >
          {capacity.current}/{capacity.max}
          {fullCapacity && <Check className="size-5" />}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "terms",
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Terms" />
    ),
    cell: ({ row }) => {
      const { terms } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {terms?.join(", ")}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "requirements",
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requirements" />
    ),
    cell: ({ row }) => {
      const { requirements } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {requirements?.join(", ")}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "location",
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const { location } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {location}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "updatedAt",
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      const { updatedAt } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "createdAt",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as number | undefined;
      return (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    },
  },

  {
    id: "actions",

    maxSize: 40,
    minSize: 40,
    enableResizing: false,
    cell: ({ row }) => {
      const event = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;
      // console.log(table.options)

      return (
        <div className={cn("flex justify-center")}>
          <OnlineEventDialog eventId={event._id}>
            <Button
              variant="outline"
              className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
            >
              <span className="sr-only">Edit</span>
              <Pencil className="size-4" />
            </Button>
          </OnlineEventDialog>
        </div>
      );
    },
  },
];
