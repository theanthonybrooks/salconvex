"use client";

import { getSupportCategoryLabel } from "@/constants/supportConsts";

import type { Priority } from "@/constants/kanbanConsts";
import type { SupportCategory } from "@/constants/supportConsts";

import { ColumnDef } from "@tanstack/react-table";

import { MoreHorizontal } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { ConfirmingDropdown } from "@/components/ui/confirmation-dialog-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DeleteSupportTicketBtn,
  GoToSupportTicket,
  SupportTicketPrioritySelector,
  SupportTicketStatusSelector,
} from "@/features/admin/dashboard/components/admin-support-actions";
import { cn } from "@/helpers/utilsFns";

import { type Doc, type Id } from "~/convex/_generated/dataModel";

export const supportColumnLabels: Record<string, string> = {
  ticketNumber: "Ticket #",
  name: "User Name",
  email: "User Email",
  category: "Category",
  status: "Status",
  _creationTime: "Created At",
  updatedAt: "Last Updated",
  message: "Message",
};

const getRank = (status: string) => {
  switch (status) {
    case "pending":
      return 1;
    case "open":
      return 2;
    case "resolved":
      return 3;
    case "closed":
      return 4;
    default:
      return 5;
  }
};

// _id: Id<"support">;
// _creationTime: number;
// updatedAt?: number | undefined;
// updatedBy?: Id<"users"> | undefined;
// userId: Id<"users"> | null;
// name: string;
// email: string;
// createdAt: number;
// category: string;
// status: "pending" | "open" | "resolved" | "closed";
// ticketNumber: number;
// message: string;

type SupportColumnsProps = Doc<"support"> & {
  kanbanId?: Id<"todoKanban">;
  priority?: Priority;
};

export const supportColumns: ColumnDef<SupportColumnsProps>[] = [
  {
    accessorKey: "ticketNumber",
    id: "ticketNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 40,
    maxSize: 40,

    cell: ({ row }) => {
      const { ticketNumber } = row.original;
      return (
        <div className="block truncate text-center font-medium">
          {ticketNumber}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId));
      return value.includes(filterValue);
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { name } = row.original;
      return <div className="truncate font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const { email } = row.original;
      return <div className="truncate">{email}</div>;
    },
  },

  {
    accessorKey: "status",
    id: "status",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { status, _id: ticketId } = row.original;
      return (
        <SupportTicketStatusSelector ticketId={ticketId} status={status} />
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
    enableMultiSort: true,
    sortingFn: (rowA, rowB) => {
      const a = getRank(rowA.getValue("status"));
      const b = getRank(rowB.getValue("status"));

      return a - b;
    },
    sortUndefined: "last",
  },
  {
    accessorKey: "priority",
    minSize: 40,
    maxSize: 40,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const { priority, kanbanId, status } = row.original;
      return (
        <SupportTicketPrioritySelector
          kanbanId={kanbanId}
          priority={priority}
          status={status}
        />
      );
    },
  },

  {
    accessorKey: "category",
    minSize: 90,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const { category } = row.original;
      const categoryLabel = getSupportCategoryLabel(
        category as SupportCategory,
      );
      return (
        <div className="truncate text-center text-sm">{categoryLabel}</div>
      );
    },
  },

  {
    accessorKey: "_creationTime",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const { _creationTime: value } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize">
          {new Date(value).toLocaleString("en-US", {
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
    accessorKey: "updatedAt",
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const { updatedAt } = row.original;
      // console.log(plan);
      return (
        <div>
          {updatedAt
            ? new Date(updatedAt).toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              })
            : "-"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "message",
    minSize: 200,
    maxSize: 1600,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message" />
    ),
    cell: ({ row }) => {
      const { message } = row.original;
      return <div className="truncate text-sm">{message}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  // {
  //   accessorKey: "updatedBy",
  //   minSize: 70,
  //   maxSize: 100,
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Updated By" />
  //   ),
  //   cell: ({ row }) => {
  //     const { updatedBy } = row.original;
  //     return (
  //       <div
  //         className={cn(
  //           "flex items-center justify-center gap-1 truncate text-center text-sm",
  //         )}
  //       >
  //         {updatedBy}
  //       </div>
  //     );
  //   },
  //   filterFn: (row, columnId, filterValue) => {
  //     if (!Array.isArray(filterValue)) return true;
  //     const value = row.getValue(columnId);
  //     return filterValue.includes(String(value));
  //   },
  // },

  {
    id: "actions",

    maxSize: 80,
    minSize: 80,
    enableResizing: false,
    cell: ({ row }) => {
      const { _id: ticketId, ticketNumber, kanbanId } = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;
      // console.log(table.options)

      return (
        <div
          className={cn("flex justify-center")}
          onClick={(e) => e.stopPropagation()}
        >
          <GoToSupportTicket ticketNumber={ticketNumber} kanbanId={kanbanId} />

          <ConfirmingDropdown key={ticketId}>
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
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Admin</DropdownMenuLabel>
                  <DeleteSupportTicketBtn ticketId={ticketId} />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
