"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmingDropdown } from "@/components/ui/confirmation-dialog-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { LucideClipboardCopy, MoreHorizontal } from "lucide-react";
import { Id } from "~/convex/_generated/dataModel";

interface UserColumnsProps {
  _id: Id<"users">;
  name: string;
  email: string;
  subscription: string;
  subStatus: string;
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
      console.log(subscription);
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
          <p className="capitalize"> {subscription || "none"}</p>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "subStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const subStatus = row.getValue("subStatus") as string | undefined;
      return (
        <div
          className={cn(
            "rounded px-2 py-1 text-xs font-medium",
            subStatus === "active" &&
              "border border-green-400 bg-green-100 text-green-800",
            subStatus === "trialing" &&
              "border border-yellow-400 bg-yellow-100 text-yellow-800",
            subStatus === "canceled" &&
              "border border-red-400 bg-red-100 text-red-800",
            !subStatus && "italic text-muted-foreground",
          )}
        >
          <p className="text-center capitalize">{subStatus || "none"}</p>
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
  {
    id: "actions",
    size: 48,
    maxSize: 48,
    minSize: 48,
    enableResizing: false,
    cell: ({ row }) => {
      const user = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;
      // const dumbFuck = row.table.fuckoff
      // console.log(table.options)

      return (
        <div className={cn("flex justify-center")}>
          <ConfirmingDropdown>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="scrollable mini darkbar max-h-56"
              >
                {/* {isAdmin && <DataTableAdminActions eventId={event._id} />} */}
                <DropdownMenuLabel>Actions</DropdownMenuLabel>{" "}
                <DropdownMenuSeparator />
                {/* <DuplicateEvent eventId={event._id} /> */}
                <p>Delete User</p>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user._id)}
                  className="flex items-center gap-x-2"
                >
                  <LucideClipboardCopy className="size-4" /> Event ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
