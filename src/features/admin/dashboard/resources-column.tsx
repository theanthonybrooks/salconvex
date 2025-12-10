"use client";

import type { FunctionReturnType } from "convex/server";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";

import { Check, Pencil } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import {
  DeleteEventBtn,
  DuplicateEventBtn,
} from "@/features/admin/dashboard/components/admin-resource-actions";
import { OnlineEventDialog } from "@/features/resources/components/online-event-dialog";
import {
  GoToOnlineEvent,
  OnlineEventStatusBtn,
} from "@/features/resources/components/online-event-table-actions";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";

export const resourcesColumnLabels: Record<string, string> = {
  name: "Name",
  state: "Status",
  img: "Image",
  startDate: "Start Date",
  endDate: "End Date",
  price: "Price",
  regDeadline: "Deadline",
  capacity: "Capacity",
  location: "Location",
  updatedAt: "Last Updated",
  createdAt: "Created At",
  terms: "Terms",
  requirements: "Requirements",
};

type ResourceResults = FunctionReturnType<
  typeof api.userAddOns.onlineEvents.getAllOnlineEvents
>;
type ResourceResult = NonNullable<ResourceResults>["events"][number];

export const resourceColumns: ColumnDef<ResourceResult>[] = [
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
      const { name, slug } = row.original;
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
            month: "numeric",
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
            month: "numeric",
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
            month: "numeric",
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

    maxSize: 120,
    minSize: 120,
    enableResizing: false,
    cell: ({ row }) => {
      const event = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;
      // console.log(table.options)

      return (
        <>
          <div
            className={cn("flex justify-center gap-0.5")}
            onClick={(e) => e.stopPropagation()}
          >
            <OnlineEventDialog eventId={event._id}>
              <Button
                variant="outline"
                className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
              >
                <span className="sr-only">Edit</span>
                <Pencil className="size-4" />
              </Button>
            </OnlineEventDialog>
            <DuplicateEventBtn eventId={event._id} />
            <DeleteEventBtn eventId={event._id} />
          </div>
        </>
      );
    },
  },
];
