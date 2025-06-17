"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Link } from "@/components/ui/custom-link";
import { AppNotesInput } from "@/features/artists/applications/components/events-data-table/app-notes-input";
import { AppStatusSelector } from "@/features/artists/applications/components/events-data-table/app-status-selector";
import { cn } from "@/lib/utils";
import {
  ApplicationStatus,
  NonNullApplicationStatus,
  statusColorMap,
} from "@/types/applications";
import { ColumnDef } from "@tanstack/react-table";
import { Id } from "~/convex/_generated/dataModel";

export const applicationColumnLabels: Record<string, string> = {
  name: "Event Name",
  dates_edition: "Edition",
  eventStart: "Event Start",
  eventEnd: "Event End",
  productionStart: "Production Start",
  productionEnd: "Production End",
  applicationTime: "Applied At",
  applicationStatus: "Status",
  responseTime: "Response Time",
  notes: "Notes",
  // manualApplied: "Manual Entry",
};

interface ApplicationColumnsProps {
  _id: Id<"applications">;
  name: string;
  dates_edition: number;
  eventStart: string;
  eventEnd: string;
  productionStart: string;
  productionEnd: string;
  applicationTime: number;
  applicationStatus: ApplicationStatus;
  // manualApplied: boolean;
  responseTime: number;
  // response: string;
  notes?: string;
  slug: string;
}

export const applicationColumns: ColumnDef<ApplicationColumnsProps>[] = [
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
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Name" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      const eventSlug = application?.slug;
      const rawStatus = application.applicationStatus;
      const statusColor = rawStatus
        ? statusColorMap[rawStatus as NonNullApplicationStatus]
        : "text-muted-foreground";

      return (
        <div className={cn("truncate text-center font-medium", statusColor)}>
          <Link
            href={`/thelist/event/${eventSlug}/${row.getValue("dates_edition")}/call`}
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
    accessorKey: "dates_edition",
    minSize: 80,
    maxSize: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row }) => (
      <span className="text-center text-sm">
        {row.getValue("dates_edition")}
      </span>
    ),
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
    accessorKey: "productionStart",
    minSize: 150,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production Start" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">
        {row.getValue("productionStart")}
      </span>
    ),
  },
  {
    accessorKey: "productionEnd",
    minSize: 150,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production End" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">
        {row.getValue("productionEnd")}
      </span>
    ),
  },
  {
    accessorKey: "applicationTime",
    minSize: 150,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applied At" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("applicationTime") as number;
      return (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "applicationStatus",
    minSize: 180,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      // <span className="capitalize">{row.getValue("applicationStatus")}</span>
      <AppStatusSelector
        applicationId={row.original._id}
        appStatus={row.getValue("applicationStatus")}
      />
    ),
  },
  // {
  //   accessorKey: "manualApplied",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Manual Entry" />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.getValue("manualApplied") as boolean;
  //     return <span className="text-sm">{value ? "Yes" : "No"}</span>;
  //   },
  // },
  // {
  //   accessorKey: "response",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Response" />
  //   ),
  //   cell: ({ row }) => (
  //     <span className="capitalize">{row.getValue("response") || "-"}</span>
  //   ),
  // },

  {
    accessorKey: "responseTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Response Time" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("responseTime") as number;
      return (
        <span className="block text-center text-sm">
          {value ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      return (
        // <span className="capitalize">{row.getValue("notes") || "-"}</span>
        <AppNotesInput
          notes={row.getValue("notes")}
          application={application._id}
        />
      );
    },
  },
];
