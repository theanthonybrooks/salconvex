"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  DataTableAdminOrgActions,
  DataTableAdminOrgStateActions,
} from "@/components/data-table/actions/data-table-admin-org-actions";
import {
  ApproveEvent,
  ArchiveEvent,
  CopyEventId,
  DeleteEvent,
  DuplicateEvent,
  GoToEvent,
  ReactivateEvent,
} from "@/components/data-table/actions/data-table-event-actions";
import { DataTableEventEdition } from "@/components/data-table/actions/data-table-event-edition";
import { DataTableEventName } from "@/components/data-table/actions/data-table-event-name";
import {
  ApproveBoth,
  ApproveOC,
  DeleteOC,
  DuplicateOC,
  ReactivateOC,
} from "@/components/data-table/actions/data-table-oc-actions";
import { DataTableOrgInfo } from "@/components/data-table/actions/data-table-org-info";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getEventCategoryLabelAbbr, getEventTypeLabel } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { EventType, SubmissionFormState } from "@/types/event";
import { SubmissionFormState as OpenCallState } from "@/types/openCall";
import { LucideClipboardCopy, MoreHorizontal } from "lucide-react";
import { Id } from "~/convex/_generated/dataModel";

export const columnLabels: Record<string, string> = {
  name: "Name",
  dates_edition: "Edition",
  state: "State",
  openCallState: "Open Call",
  lastEditedAt: "Last Edited",
  category: "Category",
  type: "Event Type",
  _id: "Event ID",
};

export type Event = {
  _id: Id<"events">;
  mainOrgId: Id<"organizations">;
  name: string;
  dates: {
    edition: number;
  };
  slug: string;
  state: SubmissionFormState;
  category: string;
  type: EventType[];
  lastEditedAt?: number;
  openCallState?: string | null;
  openCallId?: Id<"openCalls"> | null;
  approvedAt?: number;
};

export const columns: ColumnDef<Event>[] = [
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
  },

  {
    accessorKey: "name",
    // size: "100%",
    minSize: 120,
    // maxSize: 400,

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row, table }) => {
      // const isAdmin = table.options.meta?.isAdmin;
      const pageType = table.options.meta?.pageType;
      const isDashboard = pageType === "dashboard";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20ch] truncate pl-1 font-medium sm:max-w-[500px] sm:pl-0">
            {/* {row.getValue("name")} */}
            <DataTableEventName event={row.original} dashboard={isDashboard} />
          </span>
        </div>
      );
    },
  },
  {
    id: "dates_edition",
    accessorFn: (row) => row.dates.edition,

    minSize: 90,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edition" />
    ),
    cell: ({ row, table }) => {
      // const isAdmin = table.options.meta?.isAdmin;
      const event = row.original as Event;
      const pageType = table.options.meta?.pageType;
      const isDashboard = pageType === "dashboard";

      return (
        //   <div className="flex justify-center space-x-2">
        //   <span className="max-w-[60px] truncate font-medium">
        //     {row.getValue("dates_edition")}
        //   </span>
        // </div>
        <DataTableEventEdition event={event} dashboard={isDashboard} />
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
    minSize: 130,
    maxSize: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),

    cell: ({ row, table }) => {
      const event = row.original as Event;
      const state = row.getValue("state") as SubmissionFormState;
      const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex justify-center">
          <DataTableAdminOrgStateActions
            eventId={event._id}
            state={state}
            userRole={isAdmin ? "admin" : "user"}
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

    minSize: 130,
    maxSize: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Open Call" />
    ),

    cell: ({ row, table }) => {
      const event = row.original as Event;
      const ocState = (row.getValue("openCallState") as OpenCallState) || null;
      const isAdmin = table.options.meta?.isAdmin;
      return (
        <div className="flex justify-center">
          {/* <div
            className={cn(
              "flex w-max items-center justify-center gap-1 rounded border p-2 px-4",
              !ocState && "border-transparent",
              ocState === "draft" && "bg-orange-200",
              ocState === "pending" && "bg-indigo-100",
              ocState === "submitted" && "bg-blue-200",
              ocState === "published" && "bg-green-200",
            )}
          >
            {ocState ? (
              ocState === "draft" ? (
                <FaRegFloppyDisk className="size-4 shrink-0" />
              ) : ocState === "submitted" ? (
                <CircleFadingPlus className="size-4 shrink-0" />
              ) : ocState === "pending" ? (
                <DollarSign className="size-4 shrink-0" />
              ) : ocState === "published" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" />
              )
            ) : (
              ""
            )}
            <span className="capitalize">{ocState || "-"}</span>
          </div> */}
          <DataTableAdminOrgStateActions
            eventId={event._id}
            state={ocState}
            userRole={isAdmin ? "admin" : "user"}
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
    id: "submissionState",
    accessorKey: "submissionState",
    header: () => null, // no header cell
    cell: () => null, // no table cell
    filterFn: (row, _columnId, filterValue: string[]) => {
      const state = row.original.state;
      const ocState = row.original.openCallState;
      return filterValue.includes(state) || filterValue.includes(ocState ?? "");
    },

    enableHiding: false,
    enableSorting: false,
  },

  {
    accessorKey: "lastEditedAt",

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
    minSize: 120,
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
    accessorKey: "_id",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event ID" />
    ),
    cell: ({ row }) => {
      const value = row.original as Event;
      return (
        <div className="flex justify-center">
          <CopyEventId eventId={value._id} />
        </div>
      );
    },
  },
  {
    id: "actions",

    maxSize: 40,
    minSize: 40,
    enableResizing: false,
    cell: ({ row, table }) => {
      const event = row.original as Event;
      const state = event.state as SubmissionFormState;
      const isAdmin = table.options.meta?.isAdmin;
      const ocState = event.openCallState;
      const openCallId = event.openCallId;
      const hasOC = !!openCallId;
      const edition = event.dates.edition;
      const slug = event.slug;
      const eventApproved = typeof event.approvedAt === "number";

      // const openCallState = event.openCallState;

      return (
        <div className={cn("flex justify-center", isAdmin && "flex")}>
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
                {isAdmin && (
                  <DataTableAdminOrgActions
                    eventId={event._id}
                    userRole="admin"
                  />
                )}
                <DropdownMenuLabel>
                  {isAdmin ? "Event" : "Actions"}
                </DropdownMenuLabel>{" "}
                <DropdownMenuSeparator />
                <GoToEvent slug={slug} edition={edition} />
                <DuplicateEvent eventId={event._id} />
                {((state === "draft" && !eventApproved) || isAdmin) && (
                  <DeleteEvent eventId={event._id} isAdmin={isAdmin} />
                )}
                {state === "submitted" && isAdmin && (
                  <ApproveEvent eventId={event._id} />
                )}
                {state === "published" && <ArchiveEvent eventId={event._id} />}
                {(state === "archived" ||
                  (state === "published" && isAdmin)) && (
                  <ReactivateEvent eventId={event._id} state={state} />
                )}
                {hasOC && (
                  <>
                    <DropdownMenuLabel className="mt-2 border-t-1.5 border-foreground/20">
                      Open Call
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DuplicateOC openCallId={openCallId} />
                    {(ocState === "draft" || isAdmin) && (
                      <DeleteOC openCallId={openCallId} isAdmin={isAdmin} />
                    )}
                    {ocState === "submitted" && isAdmin && (
                      <ApproveOC openCallId={openCallId} />
                    )}

                    {(ocState === "archived" || ocState === "published") &&
                      isAdmin && (
                        <ReactivateOC openCallId={openCallId} state={ocState} />
                      )}
                    {ocState === "submitted" &&
                      state === "submitted" &&
                      isAdmin && <ApproveBoth openCallId={openCallId} />}
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <CopyableItem
                        defaultIcon={<LucideClipboardCopy className="size-4" />}
                        copyContent={event._id}
                      >
                        Event ID
                      </CopyableItem>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CopyableItem
                        defaultIcon={<LucideClipboardCopy className="size-4" />}
                        copyContent={openCallId as string}
                      >
                        Open Call ID
                      </CopyableItem>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(event._id)}
                      className="flex items-center gap-x-2"
                    >
                      <LucideClipboardCopy className="size-4" /> Event ID
                    </DropdownMenuItem>
                    <DataTableOrgInfo orgId={event.mainOrgId} />
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
