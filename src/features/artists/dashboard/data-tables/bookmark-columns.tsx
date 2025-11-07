"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Link } from "@/components/ui/custom-link";
import { ListActionSelector } from "@/features/artists/dashboard/data-tables/bookmark-hidden-selector";
import {
  BookmarkListActionSelector,
  BookmarkNotesInput,
} from "@/features/artists/dashboard/data-tables/bookmark-list-actions";
import { cn } from "@/helpers/utilsFns";

import { Id } from "~/convex/_generated/dataModel";

export const bookmarkColumnLabels: Record<string, string> = {
  name: "Event Name",
  edition: "Edition",
  deadline: "Deadline",
  eventStart: "Event Start",
  eventEnd: "Event End",
  prodStart: "Production Start",
  prodEnd: "Production End",
  bookmarkStatus: "Status",
  eventIntent: "Intent",
  bookmarkNote: "Notes",
};

interface BookmarkColumnsProps {
  _id: Id<"events">;
  name: string;
  deadline: string;
  isPast: boolean;
  timeZone: string;
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
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 40,
    cell: ({ row }) => {
      return (
        <div className="text-center text-sm text-muted-foreground">
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
    enableMultiSort: true,
    enableResizing: false,
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
    enableMultiSort: true,
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
      <span className="block text-center text-sm">
        {row.getValue("edition")}
      </span>
    ),
  },
  {
    accessorKey: "deadline",
    id: "deadline",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const { deadline: value, timeZone } = row.original;
      const now = new Date();
      const deadlineDate = new Date(value);
      const isValid = !isNaN(deadlineDate.getTime());

      if (!isValid) {
        return (
          <span className="block text-center text-sm text-foreground/50">
            -
          </span>
        );
      }
      // Difference in milliseconds
      const diffMs = deadlineDate.getTime() - now.getTime();

      const isLessThan24Hours =
        diffMs > 0 && diffMs < 24 * 60 * 60 * 1000 && now < deadlineDate;

      const isPast = row.original.isPast as boolean;
      return (
        <span
          className={cn(
            "block text-center text-sm",
            isLessThan24Hours && "text-red-500",
            isPast && "text-foreground/50 line-through",
          )}
        >
          {formatInTimeZone(value, timeZone, "yyyy-MM-dd")}
        </span>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const now = new Date().getTime();

      const aVal = rowA.getValue(columnId) as string | undefined;
      const bVal = rowB.getValue(columnId) as string | undefined;

      const aTime = aVal ? new Date(aVal).getTime() : NaN;
      const bTime = bVal ? new Date(bVal).getTime() : NaN;

      const aValid = !isNaN(aTime);
      const bValid = !isNaN(bTime);

      // helper to categorize: upcoming (0), none (1), past (2)
      const cat = (time: number, valid: boolean) => {
        if (!valid) return 1;
        if (time >= now) return 0;
        return 2;
      };

      const aCat = cat(aTime, aValid);
      const bCat = cat(bTime, bValid);

      // first by category (upcoming → none → past)
      if (aCat !== bCat) return aCat - bCat;

      // within category, order by soonest/upcoming ascending,
      // but for past ones, most recent first (descending)
      if (aCat === 0) return aTime - bTime; // upcoming soonest first
      if (aCat === 2) return bTime - aTime; // past most recent first

      return 0;
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "eventStart",
    id: "eventStart",
    minSize: 120,
    maxSize: 120,
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
    id: "eventEnd",
    minSize: 120,
    maxSize: 120,
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
    id: "prodStart",
    minSize: 150,
    maxSize: 150,
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
    id: "prodEnd",
    minSize: 150,
    maxSize: 150,
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
    id: "bookmarkStatus",
    minSize: 180,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { bookmarkStatus: value } = row.original;
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
    id: "eventIntent",
    minSize: 180,
    maxSize: 200,
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      if (!value && filterValue.includes("-")) return true;
      return filterValue.includes(value);
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intent" />
    ),
    cell: ({ row }) => {
      const {
        eventIntent: value,
        applicationStatus: appStatus,
        isPast,
      } = row.original;
      return (
        <BookmarkListActionSelector
          key={row.original._id}
          eventId={row.original._id}
          initialValue={value}
          appStatus={appStatus}
          isPast={isPast}
        />
      );
    },
    enableMultiSort: true,
    sortUndefined: "last",
  },
  {
    accessorKey: "bookmarkNote",
    id: "bookmarkNote",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const { _id: bookmark } = row.original;
      // return <span className="text-sm">{value ? "Yes" : "No"}</span>;
      return (
        <BookmarkNotesInput
          notes={row.getValue("bookmarkNote")}
          bookmark={bookmark}
        />
      );
    },
  },
];
