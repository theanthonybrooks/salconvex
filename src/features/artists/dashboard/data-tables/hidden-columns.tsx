"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Link } from "@/components/ui/custom-link";
import { ListActionSelector } from "@/features/artists/dashboard/data-tables/bookmark-hidden-selector";
import { getEventCategoryLabelAbbr, getEventTypeLabel } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { EventCategory, EventType } from "@/types/event";
import { ColumnDef } from "@tanstack/react-table";
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
    id: "rowNumber",
    header: "#",
    size: 30,
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination?.pageIndex ?? 0;
      const pageSize =
        table.getState().pagination?.pageSize ??
        table.getRowModel().rows.length;
      return (
        <div className="text-center text-sm text-muted-foreground">
          {pageIndex * pageSize + row.index + 1}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    id: "name",
    minSize: 200,
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
    minSize: 100,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="min-w-20 max-w-[500px] truncate text-center font-medium capitalize">
            {getEventCategoryLabelAbbr(row.getValue("category"))}
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
    minSize: 150,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const types = row.getValue("type") as EventType[];

      return (
        <div className="flex flex-col items-center gap-1">
          <span className="min-w-20 max-w-[500px] truncate font-medium capitalize">
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
    minSize: 160,
    maxSize: 160,
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
