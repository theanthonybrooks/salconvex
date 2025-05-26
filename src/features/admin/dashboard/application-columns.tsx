"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import { ColumnDef } from "@tanstack/react-table";
import { Id } from "~/convex/_generated/dataModel";

interface ApplicationColumnsProps {
  _id: Id<"applications">;
  name: string;
  dates_edition: number;
  eventStart: string;
  eventEnd: string;
  productionStart: string;
  productionEnd: string;
  applicationTime: number;
  applicationStatus: string;
  manualApplied: boolean;
  responseTime: number;
  response: string;
  slug: string;
}

export const applicationColumns: ColumnDef<ApplicationColumnsProps>[] = [
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
      const application = row.original;
      const eventSlug = application?.slug;

      console.log(application);

      return (
        <div className="truncate font-medium">
          <Link
            href={`/thelist/event/${eventSlug}/${row.getValue("dates_edition")}/call`}
            target="_blank"
          >
            {row.getValue("name")}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "dates_edition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("dates_edition")}</span>
    ),
  },
  {
    accessorKey: "eventStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Start" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("eventStart")}</span>
    ),
  },
  {
    accessorKey: "eventEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event End" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("eventEnd")}</span>
    ),
  },
  {
    accessorKey: "productionStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production Start" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("productionStart")}</span>
    ),
  },
  {
    accessorKey: "productionEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production End" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("productionEnd")}</span>
    ),
  },
  {
    accessorKey: "applicationTime",
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("applicationStatus")}</span>
    ),
  },
  {
    accessorKey: "manualApplied",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manual Entry" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("manualApplied") as boolean;
      return <span className="text-sm">{value ? "Yes" : "No"}</span>;
    },
  },
  {
    accessorKey: "response",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Response" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("response") || "-"}</span>
    ),
  },
  {
    accessorKey: "responseTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Response Time" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("responseTime") as number;
      return (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    },
  },
];
