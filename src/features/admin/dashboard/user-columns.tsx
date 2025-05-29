"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Id } from "~/convex/_generated/dataModel";

interface UserColumnsProps {
  _id: Id<"users">;
  name: string;
  email: string;
  subscription: string;
  accountType: string[];
  createdAt: number;
  role: string[];
  source?: string;
}

export const userColumns: ColumnDef<UserColumnsProps>[] = [
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="truncate font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="truncate text-sm text-muted-foreground">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "subscription",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subscription" />
    ),
    cell: ({ row }) => {
      const subscription = row.getValue("subscription") as string | undefined;
      return (
        <div
          className={cn(
            "rounded px-2 py-1 text-xs font-medium",
            subscription === "pro" && "bg-green-100 text-green-800",
            subscription === "free" && "bg-gray-100 text-gray-800",
            subscription === "enterprise" && "bg-indigo-100 text-indigo-800",
            !subscription && "italic text-muted-foreground",
          )}
        >
          {subscription || "none"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },

  {
    accessorKey: "accountType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Type" />
    ),
    cell: ({ row }) => {
      const accountType = row.getValue("accountType") as string | undefined;
      return (
        <div className="capitalize">
          {accountType?.includes("artist")
            ? "Artist"
            : accountType?.includes("organizer")
              ? "organizer"
              : "-"}
        </div>
      );
    },
  },

  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    //TODO: Add function to change roles (dropdown)
    cell: ({ row }) => {
      const role = row.getValue("role") as string | undefined;
      return (
        <div className="capitalize">
          {role?.includes("admin")
            ? "Admin"
            : role?.includes("user")
              ? "User"
              : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
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
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("source") as string | undefined;
      return <span className="text-sm">{value ? value : "-"}</span>;
    },
  },
];
