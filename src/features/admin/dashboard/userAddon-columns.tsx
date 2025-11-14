"use client";

import { ColumnDef } from "@tanstack/react-table";

import type { UserAddOnStatus } from "~/convex/schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Link } from "@/components/ui/custom-link";
import {
  UpdateOrder,
  UpdateRegistrationStatus,
  ViewNotes,
} from "@/features/resources/components/online-event-table-actions";

import { Id } from "~/convex/_generated/dataModel";

export const userAddOnColumnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  link: "Link",
  notes: "Notes",
  paid: "Paid",
  canceled: "Canceled",
  createdAt: "Created",
  status: "Status",
  order: "Order",
};

interface UserAddOnColumnsProps {
  _id: Id<"userAddOns">;
  name: string;
  email: string;
  link?: string;
  notes?: string;
  paid: boolean;
  plan?: number;
  canceled: boolean;
  status: UserAddOnStatus;
  order?: number;
  capacity: number;
  _creationTime: number;
  takenOrders: number[];
}

export const userAddOnColumns: ColumnDef<UserAddOnColumnsProps>[] = [
  {
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 30,

    cell: ({ row }) => {
      return (
        <div
          className="text-center"
          onClick={() => {
            row.toggleSelected();
          }}
        >
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
  },
  {
    accessorKey: "name",
    minSize: 120,
    maxSize: 150,
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
    size: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const { email } = row.original;
      // return <OnlineEventStatusBtn eventId={row.original._id} state={state} />;
      return (
        <Link
          href={`mailto:${email ?? ""}`}
          target="_blank"
          className="truncate"
        >
          {email}
        </Link>
      );
    },
  },
  {
    accessorKey: "link",
    size: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Link" />
    ),
    cell: ({ row }) => {
      const { link } = row.original;
      return (
        <Link href={link ?? "#"} target="_blank" className="truncate">
          {link}
        </Link>
      );
    },
  },

  {
    accessorKey: "notes",
    minSize: 220,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const { notes } = row.original;
      return <ViewNotes notes={notes} />;
    },
  },

  {
    accessorKey: "paid",
    minSize: 50,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid" />
    ),
    cell: ({ row }) => {
      const { paid } = row.original;
      return <div className="truncate text-center">{paid ? "Yes" : "No"}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "canceled",
    id: "canceled",
    minSize: 50,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Canceled" />
    ),
    cell: ({ row }) => {
      const { canceled } = row.original;
      return (
        <div className="truncate text-center">{canceled ? "Yes" : "No"}</div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
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
      const { status, _id: registrationId } = row.original;
      return (
        <UpdateRegistrationStatus
          status={status}
          registrationId={registrationId}
        />
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "order",
    id: "order",
    minSize: 50,
    maxSize: 50,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => {
      const {
        order,
        _id: registrationId,
        capacity,
        takenOrders,
        status,
      } = row.original;
      const disabled = status !== "chosen";
      return (
        <UpdateOrder
          disabled={disabled}
          registrationId={registrationId}
          order={order}
          takenOrders={takenOrders}
          capacity={capacity}
        />
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
    sortUndefined: "last",
  },
  {
    accessorKey: "plan",
    minSize: 40,
    maxSize: 40,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const { plan } = row.original;
      return <div className="truncate text-center">{plan ?? "-"}</div>;
    },
  },

  {
    accessorKey: "createdAt",
    id: "createdAt",
    minSize: 90,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const { _creationTime: value } = row.original;
      return (
        <span className="text-sm">
          {value
            ? new Date(value).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              })
            : "-"}
        </span>
      );
    },
  },

  // {
  //   id: "actions",

  //   maxSize: 40,
  //   minSize: 40,
  //   enableResizing: false,
  //   cell: ({ row }) => {
  //     const event = row.original;

  //     // const openCallState = event.openCallState;
  //     // const openCallId = event.openCallId;
  //     // console.log(table.options)

  //     return (
  //       <div className={cn("flex justify-center")}>
  //         <OnlineEventDialog eventId={event._id}>
  //           <Button
  //             variant="outline"
  //             className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
  //           >
  //             <span className="sr-only">Edit</span>
  //             <Pencil className="size-4" />
  //           </Button>
  //         </OnlineEventDialog>
  //       </div>
  //     );
  //   },
  // },
];
