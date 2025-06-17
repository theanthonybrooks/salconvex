"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import { ListActionSelector } from "@/features/artists/dashboard/data-tables/bookmark-hidden-selector";
import {
  BookmarkListActionSelector,
  BookmarkNotesInput,
} from "@/features/artists/dashboard/data-tables/bookmark-list-actions";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/applications";
import { ColumnDef } from "@tanstack/react-table";
import { Id } from "~/convex/_generated/dataModel";

interface BookmarkColumnsProps {
  _id: Id<"events">;
  name: string;
  edition: number;
  eventStart: string;
  eventEnd: string;
  prodStart: string;
  prodEnd: string;
  bookmarkStatus: boolean;
  slug: string;
  bookmarkNote: string;
  eventIntent: string;
  applicationStatus: string | null;
}

export const bookmarkColumns: ColumnDef<BookmarkColumnsProps>[] = [
  {
    id: "select",
    size: 30,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Name" />
    ),
    cell: ({ row }) => {
      const event = row.original;
      const eventSlug = event?.slug;

      return (
        <div className={cn("truncate font-medium")}>
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row }) => (
      <span className="block text-sm">{row.getValue("edition")}</span>
    ),
  },
  {
    accessorKey: "eventStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Start" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">
        {row.getValue("eventStart")}
      </span>
    ),
  },
  {
    accessorKey: "eventEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event End" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">
        {row.getValue("eventEnd")}
      </span>
    ),
  },
  {
    accessorKey: "prodStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production Start" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">
        {row.getValue("prodStart")}
      </span>
    ),
  },
  {
    accessorKey: "prodEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production End" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">
        {row.getValue("prodEnd")}
      </span>
    ),
  },
  {
    accessorKey: "bookmarkStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("bookmarkStatus") as boolean;
      // return <span className="text-sm">{value ? "Yes" : "No"}</span>;
      return (
        <ListActionSelector
          key={row.original._id}
          eventId={row.original._id}
          bookmarked={value}
        />
      );
    },
  },
  {
    accessorKey: "eventIntent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intent" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("eventIntent") as string;
      const appStatus = row.original.applicationStatus as ApplicationStatus;

      return (
        <BookmarkListActionSelector
          key={row.original._id}
          eventId={row.original._id}
          initialValue={value}
          appStatus={appStatus}
        />
      );
    },
  },
  {
    accessorKey: "bookmarkNote",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const bookmark = row.original;
      // return <span className="text-sm">{value ? "Yes" : "No"}</span>;
      return (
        <BookmarkNotesInput
          notes={row.getValue("bookmarkNote")}
          bookmark={bookmark._id}
        />
      );
    },
  },
];
