"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";

import { Id } from "~/convex/_generated/dataModel";

export const newsletterColumnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  link: "Link",
  notes: "Notes",
  paid: "Paid",
  canceled: "Canceled",
  createdAt: "Created",
};

// const getAllOnlineEvents: RegisteredQuery<"public", EmptyObject, Promise<{
//  [x]   _id: Id<"onlineEvents">;
//  [x]   _creationTime: number;
//  [x]   updatedAt?: number | undefined;
//  [x]   location?: string | undefined;
//  [x]   img?: string | undefined;
//  []   updatedBy?: Id<"users"> | undefined;
//  [x]   name: string;
//  [x]   organizer: Id<"users">;
//  []   slug: string;
//  [x]   requirements: string[];
//  [x]   description: string;
//  [x]   regDeadline: number;
//  [x]   startDate: number;
//  [x]   endDate: number;
//  [x]   price: number;
//  [x]   capacity: {
//  [x]       max: number;
//  [x]       current: number;
//  []   };
//  [x]   terms: string[];
// }[]>>

interface UserAddOnColumnsProps {
  _id: Id<"userAddOns">;
  name: string;
  email: string;
  link?: string;
  notes?: string;
  paid: boolean;
  plan?: number;
  canceled: boolean;
  _creationTime: number;
}

export const userAddOnColumns: ColumnDef<UserAddOnColumnsProps>[] = [
  {
    id: "select",
    size: 30,
    minSize: 30,
    maxSize: 30,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={() => table.toggleAllRowsSelected(false)}
        aria-label="Deselect all"
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
    enableResizing: false,
  },
  {
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 40,
    cell: ({ row }) => {
      return (
        <div
          className="text-center text-sm text-muted-foreground"
          onClick={() => {
            row.toggleSelected();
            console.log(row.original._id);
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
    maxSize: 400,
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
    minSize: 150,
    maxSize: 150,
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
          className="truncate text-sm text-muted-foreground"
        >
          {email}
        </Link>
      );
    },
  },
  {
    accessorKey: "link",
    minSize: 150,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Link" />
    ),
    cell: ({ row }) => {
      const { link } = row.original;
      return (
        <Link
          href={link ?? "#"}
          target="_blank"
          className="truncate text-sm text-muted-foreground"
        >
          {link}
        </Link>
      );
    },
  },

  {
    accessorKey: "notes",
    minSize: 150,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const { notes } = row.original;
      return (
        <div className="truncate text-sm text-muted-foreground">
          {notes ?? ""}
        </div>
      );
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
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {paid ? "Yes" : "No"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "canceled",
    minSize: 50,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Canceled" />
    ),
    cell: ({ row }) => {
      const { canceled } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {canceled ? "Yes" : "No"}
        </div>
      );
    },
  },
  {
    accessorKey: "plan",
    minSize: 50,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const { plan } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {plan ?? "-"}
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const { _creationTime: value } = row.original;
      return (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : "-"}
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
