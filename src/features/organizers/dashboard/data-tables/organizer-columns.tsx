"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  DataTableAdminOrgActions,
  DataTableAdminOrgStateActions,
  OrgDuplicateEvent,
  OrgDuplicateOC,
} from "@/components/data-table/actions/data-table-admin-org-actions";
import {
  ArchiveEvent,
  DeleteEvent,
  GoToEvent,
  ReactivateEvent,
} from "@/components/data-table/actions/data-table-event-actions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { ConfirmingDropdown } from "@/components/ui/confirmation-dialog-context";
import { CopyableItem } from "@/components/ui/copyable-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrgEventActions } from "@/features/organizers/dashboard/data-tables/orgEventActions";
import { getEventCategoryLabelAbbr, getEventTypeLabel } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { EventCategory, EventType, SubmissionFormState } from "@/types/event";
import { OpenCallState } from "@/types/openCall";
import { OrgEventData } from "@/types/organizer";
import { Clipboard, MoreHorizontal } from "lucide-react";

export const orgEventColumnLabels: Record<string, string> = {
  orgName: "Org Name",
  name: "Event Name",
  dates_edition: "Edition",
  state: "State",
  openCallState: "Open Call",
  lastEditedAt: "Last Edited",
  category: "Category",
  type: "Event Type",
};

export const orgColumnLabels: Record<string, string> = {
  orgName: "Organizer",
  name: "Name",
  dates_edition: "Edition",
  state: "State",
  openCallState: "Open Call",
  lastEditedAt: "Last Edited",
  category: "Category",
  type: "Event Type",
};

// export type Event = {
//   _id: Id<"events">;
//   mainOrgId: Id<"organizations">;
//   name: string;
//   dates: {
//     edition: number;
//   };
//   slug: string;
//   state: SubmissionFormState;
//   category: string;
//   type: EventType[];
//   lastEditedAt?: number;
//   openCallState?: string | null;
//   openCallId?: Id<"openCalls"> | null;
//   organizationName?: string;
// };

export const orgColumns: ColumnDef<OrgEventData>[] = [
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
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination?.pageIndex ?? 0;
      const pageSize =
        table.getState().pagination?.pageSize ??
        table.getRowModel().rows.length;
      return (
        <div className="text-center text-sm text-muted-foreground">
          {pageIndex * pageSize + row.index + 1}
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      void columnId;
      // Sort based on the index (numeric order)
      return rowA.index - rowB.index;
    },
    enableHiding: false,
  },

  {
    accessorKey: "orgName",
    id: "orgName",
    // size: "100%",
    minSize: 120,
    maxSize: 300,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organizer" />
    ),
    cell: ({ row }) => {
      // console.log(row.original?.organizationName);
      // const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20ch] truncate pl-1 font-medium capitalize sm:max-w-[500px] sm:pl-0">
            <OrgEventActions event={row.original} field="orgName" />
          </span>
        </div>
      );
    },
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
      // const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20ch] truncate pl-1 font-medium capitalize sm:max-w-[500px] sm:pl-0">
            <OrgEventActions event={row.original} field="eventName" />
          </span>
        </div>
      );
    },
  },
  {
    id: "dates_edition",
    accessorFn: (row) => row.dates.edition,
    size: 60,
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row }) => {
      // const isAdmin = table.options.meta?.isAdmin;

      return (
        <div className="flex justify-center space-x-2">
          <span className="max-w-[60px] truncate font-medium">
            {row.getValue("dates_edition")}
          </span>
        </div>
      );
    },
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
  //           <span className="max-w-[500px] truncate font-medium">
  //             {row.getValue("eventType")}
  //           </span>
  //         </div>
  //       );
  //     },
  //   },

  {
    accessorKey: "state",
    id: "state",
    size: 130,
    minSize: 130,
    maxSize: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),

    cell: ({ row, table }) => {
      const state = row.getValue("state") as SubmissionFormState;
      const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex justify-center">
          <DataTableAdminOrgStateActions
            eventId={row.original._id}
            state={state}
            userRole={isAdmin ? "admin" : "user"}
            clickThrough
          />
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "openCallState",
    id: "openCallState",
    size: 130,
    minSize: 130,
    maxSize: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Open Call" />
    ),

    cell: ({ row, table }) => {
      const ocState = (row.getValue("openCallState") as OpenCallState) || null;
      const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex justify-center">
          <DataTableAdminOrgStateActions
            eventId={row.original._id}
            state={ocState}
            userRole={isAdmin ? "admin" : "user"}
            clickThrough
          />
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },

  {
    accessorKey: "lastEditedAt",
    id: "lastEditedAt",
    size: 180,
    minSize: 180,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Edited" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="flex justify-center space-x-2">
          <span className="max-w-[175px] truncate font-medium capitalize">
            {!isNaN(new Date(value).getTime())
              ? new Date(value).toLocaleString()
              : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    id: "category",
    size: 80,
    minSize: 80,
    maxSize: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center space-x-2">
          <span className="min-w-20 max-w-[500px] truncate text-center font-medium capitalize">
            {getEventCategoryLabelAbbr(row.getValue("category"))}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "type",
    id: "type",
    accessorFn: (row) => row.type,
    filterFn: (row, columnId, filterValues: string[]) => {
      const cellValues = row.getValue<string[]>(columnId) ?? [];
      return filterValues.some((val) => cellValues.includes(val));
    },
    // filterFn: (row, columnId, filterValue) => {
    //   if (!Array.isArray(filterValue)) return true;
    //   return filterValue.includes(row.getValue(columnId));
    // },
    getUniqueValues: (row) => {
      const values = row.type;
      return Array.isArray(values) ? values : [values];
    },
    size: 200,
    minSize: 200,
    maxSize: 240,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Type" />
    ),
    cell: ({ row }) => {
      const types = row.getValue("type") as EventType[];

      return (
        <div className="flex justify-center space-x-2">
          <span className="min-w-20 max-w-[500px] truncate font-medium capitalize">
            {Array.isArray(types) && types.length > 0
              ? types.map((type) => getEventTypeLabel(type)).join(", ")
              : "-"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 48,
    maxSize: 48,
    minSize: 48,
    enableResizing: false,
    cell: ({ row, table }) => {
      const event = row.original as OrgEventData;
      const eventCategory = event.category as EventCategory;

      // const openCallState = event.openCallState;
      const state = event.state as SubmissionFormState;
      const isAdmin = table.options.meta?.isAdmin;
      const edition = event.dates.edition;
      const slug = event.slug;
      const openCallId = event.openCallId;
      const hasOC = !!openCallId;
      const ocApproved = !!event.approvedAt;
      // console.log(openCallState);

      // const openCallState = event.openCallState;
      // console.log(table.options)

      return (
        <div className={cn("hidden justify-center md:flex", isAdmin && "flex")}>
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
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <GoToEvent
                  slug={slug}
                  edition={edition}
                  hasOpenCall={hasOC}
                  category={eventCategory}
                />
                <DataTableAdminOrgActions
                  eventId={event._id}
                  userRole={isAdmin ? "admin" : "user"}
                />
                {((state === "draft" && !ocApproved) || isAdmin) && (
                  <DeleteEvent eventId={event._id} isAdmin={isAdmin} />
                )}
                {state === "published" && <ArchiveEvent eventId={event._id} />}

                {(state === "archived" ||
                  (state === "published" && isAdmin)) && (
                  <ReactivateEvent eventId={event._id} state={state} />
                )}

                <DropdownMenuSeparator />
                <OrgDuplicateEvent
                  eventId={event._id}
                  category={eventCategory}
                />
                {openCallId && <OrgDuplicateOC openCallId={openCallId} />}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{"Support"}</DropdownMenuLabel>
                <DropdownMenuItem>
                  <div className="flex items-center gap-x-1">
                    <Clipboard className="size-4" />
                    <CopyableItem copyContent={event._id}>
                      Event ID
                    </CopyableItem>
                  </div>
                </DropdownMenuItem>
                {openCallId && (
                  <DropdownMenuItem>
                    <div className="flex items-center gap-x-1">
                      <Clipboard className="size-4" />
                      <CopyableItem copyContent={openCallId as string}>
                        Open Call ID
                      </CopyableItem>
                    </div>
                  </DropdownMenuItem>
                )}
                {/* <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(event._id)}
                  className="flex items-center gap-x-2"
                >
                  <LucideClipboardCopy className="size-4" /> Event ID
                </DropdownMenuItem> */}
                {/* {isAdmin && <DataTableOrgInfo orgId={event.mainOrgId} />} */}
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
