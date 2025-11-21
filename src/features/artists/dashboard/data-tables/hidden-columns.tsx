"use client";

import { EventCategory, EventType } from "@/types/eventTypes";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Link } from "@/components/ui/custom-link";
import { ListActionSelector } from "@/features/artists/dashboard/data-tables/bookmark-hidden-selector";
import { getEventCategoryLabel, getEventTypeLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";

import { Id } from "~/convex/_generated/dataModel";

export const hiddenColumnLabels: Record<string, string> = {
  name: "Event Name",
  edition: "Edition",
  category: "Category",
  type: "Type",
  hiddenStatus: "Status",
};

interface hiddenColumnsProps {
  _id: Id<"events">;
  name: string;
  edition: number;
  category: EventCategory;
  type: EventType[];
  hiddenStatus: boolean;
  slug: string;
}

export const hiddenColumns: ColumnDef<hiddenColumnsProps>[] = [
  {
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    minSize: 30,
    size: 30,
    maxSize: 40,
    cell: ({ row, table }) => {
      const totalRows = table.getCoreRowModel().rows.length;
      const descending = table.getState().sorting?.[0]?.desc ?? false;

      // console.log(row.index, totalRows, descending);

      const indexWithinPage = descending
        ? totalRows - row.index
        : row.index + 1;

      return (
        <div className="text-center text-sm text-muted-foreground">
          {indexWithinPage}
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
    id: "name",
    minSize: 150,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Name" />
    ),
    cell: ({ row }) => {
      const event = row.original;
      const eventSlug = event?.slug;

      return (
        <div className={cn("truncate text-center font-medium")}>
          <Link
            href={`/thelist/event/${eventSlug}/${row.getValue("edition")}/call`}
            target="_blank"
            className="max-w-[25ch] truncate"
          >
            {row.getValue("name")}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "edition",
    id: "edition",
    minSize: 80,
    maxSize: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row }) => (
      <span className="block w-full text-center text-sm">
        {row.getValue("edition")}
      </span>
    ),
  },
  {
    accessorKey: "category",
    id: "category",
    minSize: 80,
    maxSize: 90,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="min-w-20 max-w-50 truncate text-center font-medium capitalize">
            {getEventCategoryLabel(row.getValue("category"), true)}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "type",
    id: "type",
    minSize: 160,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const types = row.getValue("type") as EventType[];

      return (
        <div className="flex max-w-40 sm:max-w-full md:justify-center">
          <span className="truncate font-medium capitalize">
            {Array.isArray(types) && types.length > 0
              ? types.map((type) => getEventTypeLabel(type)).join(" | ")
              : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "hiddenStatus",
    id: "hiddenStatus",
    minSize: 90,
    maxSize: 90,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("hiddenStatus") as boolean;
      return (
        <ListActionSelector
          key={row.original._id}
          eventId={row.original._id}
          hidden={value}
        />
      );
    },
  },
];
