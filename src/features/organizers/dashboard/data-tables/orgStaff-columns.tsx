"use client";

// import { type OrgStaffData } from "@/types/organizer";
import type { OrgStaffData } from "@/types/organizer";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";

export const orgStaffColumnLabels: Record<string, string> = {
  name: "Name",
  role: "Role",
  openCallState: "Open Call",
  lastUpdatedAt: "Last Updated",
  lastUpdatedBy: "Updated By",
};

export const orgStaffColumns: ColumnDef<OrgStaffData>[] = [
  // {
  //   id: "select",
  //   size: 30,
  //   minSize: 30,
  //   maxSize: 30,
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={() => table.toggleAllRowsSelected(false)}
  //       aria-label="Deselect all"
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
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 30,
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
  },

  {
    accessorKey: "name",
    id: "name",
    // size: "100%",
    minSize: 120,
    maxSize: 300,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { name } = row.original;
      // console.log(row.original?.organizationName);
      // const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20ch] truncate pl-1 capitalize sm:max-w-[500px] sm:pl-0">
            {name}
          </span>
        </div>
      );
    },
    enableMultiSort: true,
  },

  //TODO: Make optional column
  //   {
  //     accessorKey: "type",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Type" />
  //     ),
  //     cell: ({ row }) => {
  //       return (
  //         <div className="flex space-x-2">
  //           <span className="max-w-[500px] truncate">
  //             {row.getValue("eventType")}
  //           </span>
  //         </div>
  //       );
  //     },
  //   },

  {
    accessorKey: "role",
    id: "role",
    size: 130,
    minSize: 130,
    maxSize: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),

    cell: ({ row }) => {
      const { role } = row.original;
      return <div className="flex justify-center">{role}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
    enableMultiSort: true,
  },

  {
    accessorKey: "lastUpdatedAt",
    id: "lastUpdatedAt",

    minSize: 180,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const { lastUpdatedAt: value } = row.original;
      return (
        <div className="flex justify-center space-x-2">
          <span className="max-w-[175px] truncate capitalize">
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
        </div>
      );
    },
    enableMultiSort: true,
  },
  //   {
  //     accessorKey: "lastUpdatedBy",
  //     id: "lastUpdatedBy",

  //     minSize: 180,
  //     maxSize: 180,
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Updated By" />
  //     ),
  //     cell: ({ row }) => {
  //       const { lastUpdatedBy: value } = row.original;
  //       return (
  //         <div className="flex justify-center space-x-2">
  //           <span className="max-w-[175px] truncate font-medium capitalize">
  //             {value ?? "-"}
  //           </span>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     id: "actions",
  //     size: 48,
  //     maxSize: 48,
  //     minSize: 48,
  //     enableResizing: false,
  //     cell: ({ row, table }) => {
  //       const event = row.original

  //       const isAdmin = table.options.meta?.isAdmin;

  //       // console.log(openCallState);

  //       // const openCallState = event.openCallState;
  //       // console.log(table.options)

  //       return (
  //         <div className={cn("hidden justify-center md:flex", isAdmin && "flex")}>
  //           <ConfirmingDropdown>
  //             <DropdownMenu>
  //               <DropdownMenuTrigger asChild>
  //                 <Button
  //                   variant="outline"
  //                   className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
  //                 >
  //                   <span className="sr-only">Open menu</span>
  //                   <MoreHorizontal className="size-4" />
  //                 </Button>
  //               </DropdownMenuTrigger>
  //               <DropdownMenuContent
  //                 align="end"
  //                 className="scrollable mini darkbar max-h-56"
  //               >
  //                 <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
  //                 <GoToEvent
  //                   slug={slug}
  //                   edition={edition}
  //                   hasOpenCall={hasOC}
  //                   category={eventCategory}
  //                 />
  //                 <DataTableAdminOrgActions
  //                   eventId={event._id}
  //                   userRole={isAdmin ? "admin" : "user"}
  //                 />
  //                 <RenameEventDialog event={event} />
  //                 {((state === "draft" && !ocApproved) || isAdmin) && (
  //                   <DeleteEvent eventId={event._id} isAdmin={isAdmin} />
  //                 )}
  //                 {state === "published" && <ArchiveEvent eventId={event._id} />}

  //                 {(state === "archived" ||
  //                   (state === "published" && isAdmin)) && (
  //                   <ReactivateEvent eventId={event._id} state={state} />
  //                 )}

  //                 {event.approvedAt && (
  //                   <>
  //                     <DropdownMenuSeparator />
  //                     <OrgDuplicateEvent
  //                       eventId={event._id}
  //                       category={eventCategory}
  //                     />
  //                     {openCallId && ocApproved && (
  //                       <OrgDuplicateOC openCallId={openCallId} />
  //                     )}
  //                   </>
  //                 )}
  //                 <DropdownMenuSeparator />
  //                 <DropdownMenuLabel>{"Support"}</DropdownMenuLabel>
  //                 <DropdownMenuItem>
  //                   <div className="flex items-center gap-x-1">
  //                     <Clipboard className="size-4" />
  //                     <CopyableItem copyContent={event._id}>
  //                       Event ID
  //                     </CopyableItem>
  //                   </div>
  //                 </DropdownMenuItem>
  //                 {openCallId && (
  //                   <DropdownMenuItem>
  //                     <div className="flex items-center gap-x-1">
  //                       <Clipboard className="size-4" />
  //                       <CopyableItem copyContent={openCallId as string}>
  //                         Open Call ID
  //                       </CopyableItem>
  //                     </div>
  //                   </DropdownMenuItem>
  //                 )}
  //                 {/* <DropdownMenuItem
  //                   onClick={() => navigator.clipboard.writeText(event._id)}
  //                   className="flex items-center gap-x-2"
  //                 >
  //                   <LucideClipboardCopy className="size-4" /> Event ID
  //                 </DropdownMenuItem> */}
  //                 {/* {isAdmin && <DataTableOrgInfo orgId={event.mainOrgId} />} */}
  //               </DropdownMenuContent>
  //             </DropdownMenu>
  //           </ConfirmingDropdown>
  //         </div>
  //       );
  //     },
  //   },
];
