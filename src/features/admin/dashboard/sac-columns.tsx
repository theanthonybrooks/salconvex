"use client";

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
import type { FunctionReturnType } from "convex/server";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { SacCheckedSelector } from "@/features/admin/dashboard/components/admin-sac-actions";

import { api } from "~/convex/_generated/api";

export const sacColumnLabels: Record<string, string> = {
  createdAt: "Created At",
  updatedAt: "Last Updated",
  checked: "Checked",
  salUpdatedAt: "SAL Updated",
  appLink: "App Link",
};

// type SacResults = ({
//     updatedAt: string | undefined;
//     openCall: { ... 3 more } | undefined;
//     event: { ... 4 more };
//     salUpdatedAt: number;
//     checked: boolean;
//     sacId: string;
//     dataCollectionId: string;
//     location: { ... 2 more };
//     contact: { ... 2 more };
//     createdAt: string;
// })[] | null

type SacResults = FunctionReturnType<typeof api.sac.sacData.getSacData>;
type SacResult = NonNullable<SacResults>[number];

export const sacColumns: ColumnDef<SacResult>[] = [
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
  },

  {
    accessorKey: "name",
    id: "name",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { name } = row.original;
      return <div className="truncate font-medium">{name}</div>;
    },
    enableSorting: true,
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

      return (
        <div className="truncate text-center text-sm">
          {email ? (
            <a href={`mailto:${email}`} target="_blank">
              {email}
            </a>
          ) : (
            "-"
          )}
        </div>
      );
    },
    sortUndefined: "last",
  },
  {
    accessorKey: "website",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => {
      const { website } = row.original;
      const displayLink = website?.startsWith("http")
        ? website.slice(website.indexOf("//") + 2)
        : website;
      return (
        <div className="truncate text-center text-sm">
          {website ? (
            <a href={website} target="_blank">
              {displayLink}
            </a>
          ) : (
            "-"
          )}
        </div>
      );
    },
    sortUndefined: "last",
  },

  {
    accessorKey: "appLink",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="App Link" />
    ),
    cell: ({ row }) => {
      const { appLink } = row.original;
      const displayLink = appLink?.startsWith("http")
        ? appLink.slice(appLink.indexOf("//") + 2)
        : appLink;
      return (
        <div className="truncate text-center text-sm">
          {appLink ? (
            <a href={appLink} target="_blank">
              {displayLink}
            </a>
          ) : (
            "-"
          )}
        </div>
      );
    },
    sortUndefined: "last",
  },
  {
    accessorKey: "deadline",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const { deadline } = row.original;
      return (
        <div className="truncate text-center">
          {" "}
          {deadline
            ? new Date(deadline).toLocaleString("en-US", {
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
    sortUndefined: "last",
  },
  {
    accessorKey: "country",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => {
      const { country } = row.original;
      return <div className="truncate">{country ?? "-"}</div>;
    },
  },
  {
    accessorKey: "checked",
    accessorFn: (row) => String(row.checked),
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="✅" />
    ),
    cell: ({ row }) => {
      const { checked, _id: sacId } = row.original;

      return <SacCheckedSelector sacId={sacId} checked={checked} />;
    },
  },

  {
    accessorKey: "createdAt",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const { createdAt: value } = row.original;
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
    accessorKey: "salUpdatedAt",
    id: "salUpdatedAt",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SAL Updated At" />
    ),
    cell: ({ row }) => {
      const { salUpdatedAt } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize">
          {salUpdatedAt
            ? new Date(salUpdatedAt).toLocaleString("en-US", {
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

  // {
  //   id: "actions",

  //   maxSize: 80,
  //   minSize: 80,
  //   enableResizing: false,
  //   cell: ({ row }) => {
  //     const { _id: eventId } = row.original;

  //     // const openCallState = event.openCallState;
  //     // const openCallId = event.openCallId;
  //     // console.log(table.options)

  //     return (
  //       <div
  //         className={cn("flex justify-center")}
  //         onClick={(e) => e.stopPropagation()}
  //       >
  //         {eventId && <p> Event ID: {eventId}</p>}

  //         {/* <ConfirmingDropdown key={ticketId}>
  //           <DropdownMenu>
  //             <DropdownMenuTrigger asChild>
  //               <Button
  //                 variant="outline"
  //                 className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
  //               >
  //                 <span className="sr-only">Open menu</span>
  //                 <MoreHorizontal className="size-4" />
  //               </Button>
  //             </DropdownMenuTrigger>
  //             <DropdownMenuContent
  //               align="end"
  //               className="scrollable mini darkbar max-h-56"
  //             >
  //               <DropdownMenuGroup>
  //                 <DropdownMenuLabel>Admin</DropdownMenuLabel>
  //                 <DeleteSupportTicketBtn ticketId={ticketId} />
  //               </DropdownMenuGroup>
  //             </DropdownMenuContent>
  //           </DropdownMenu>
  //         </ConfirmingDropdown> */}
  //       </div>
  //     );
  //   },
  // },
];
