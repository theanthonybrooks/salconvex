"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Link } from "@/components/ui/custom-link";
import { ListActionSelector } from "@/features/artists/dashboard/data-tables/bookmark-hidden-selector";
import {
  BookmarkListActionSelector,
  BookmarkNotesInput,
} from "@/features/artists/dashboard/data-tables/bookmark-list-actions";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/applications";
import { ColumnDef } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
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
  // {
  //   id: "select",
  //   size: 30,
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "name",
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
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("deadline") as string;
      const timeZone = row.original.timeZone;
      const now = new Date();
      const deadlineDate = new Date(value);
      const isValid = !isNaN(deadlineDate.getTime());

      if (!isValid) {
        return (
          <span className="block text-center text-sm text-foreground/50">
            {/* Invalid value: {value} */}-
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
  },
  {
    accessorKey: "eventStart",
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
    minSize: 180,
    maxSize: 200,
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
    minSize: 180,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intent" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("eventIntent") as string;
      const appStatus = row.original.applicationStatus as ApplicationStatus;
      const isPast = row.original.isPast as boolean;

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
  },
  {
    accessorKey: "bookmarkNote",
    minSize: 120,
    maxSize: 400,
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
