//TODO: Break the dropdown menu into sub-menus.

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SocialDropdownMenus } from "@/features/events/components/social-dropdown-menus";
import { getEventCategoryLabelAbbr, getEventTypeLabel } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import {
  EventCategory,
  EventType,
  PostStatus,
  SubmissionFormState,
} from "@/types/event";
import { OpenCallState } from "@/types/openCall";
import { Globe, LucideClipboardCopy, MoreHorizontal } from "lucide-react";
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
  posted?: PostStatus;
  eApprovedByUserName?: string | null;
  ocApprovedByUserName?: string | null;
};

const approvedByColumn: ColumnDef<Event> = {
  accessorKey: "approvedBy",
  id: "approvedBy",
  minSize: 160,
  maxSize: 160,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Approved By" />
  ),
  cell: ({ row }) => {
    const { eApprovedByUserName: eApprover, ocApprovedByUserName: oApprover } =
      row.original;

    return (
      <div className="flex justify-center">
        <span className="truncate font-medium">
          {eApprover}
          {oApprover && oApprover !== eApprover && `, ${oApprover}`}
        </span>
      </div>
    );
  },
};

export const getColumns = (isAdmin: boolean): ColumnDef<Event>[] => {
  const baseColumns: ColumnDef<Event>[] = [
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
      id: "name",
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
              <DataTableEventName
                event={row.original}
                dashboard={isDashboard}
              />
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
      id: "state",
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
      id: "openCallState",
      minSize: 130,
      maxSize: 130,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Open Call" />
      ),

      cell: ({ row, table }) => {
        const event = row.original as Event;
        const ocState =
          (row.getValue("openCallState") as OpenCallState) || null;
        const isAdmin = table.options.meta?.isAdmin;
        return (
          <div className="flex justify-center">
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
        return (
          filterValue.includes(state) || filterValue.includes(ocState ?? "")
        );
      },

      enableHiding: false,
      enableSorting: false,
    },

    {
      accessorKey: "lastEditedAt",
      id: "lastEditedAt",
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
        const eventCategory = event.category as EventCategory;
        const state = event.state as SubmissionFormState;
        const isAdmin = table.options.meta?.isAdmin;
        const isDashboard = table.options.meta?.pageType === "dashboard";
        const ocState = event.openCallState;
        const openCallId = event.openCallId;
        const hasOC = !!openCallId;
        const edition = event.dates.edition;
        const slug = event.slug;
        const eventApproved = typeof event.approvedAt === "number";
        const postStatus = event.posted;

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
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DataTableAdminOrgActions
                          eventId={event._id}
                          userRole="admin"
                        />
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                        Event
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className={cn("p-2")}>
                          {/* NOTE: this is the 'View Event' link */}
                          <GoToEvent
                            slug={slug}
                            edition={edition}
                            hasOpenCall={false}
                            category={eventCategory}
                          />
                          {isAdmin && hasOC && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                                <Globe className="size-4" /> Socials
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className={cn("p-2")}>
                                  <SocialDropdownMenus
                                    socialsEvent={event}
                                    openCallState={!!ocState}
                                    postStatus={postStatus}
                                  />
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          )}
                          <DuplicateEvent eventId={event._id} />
                          {isAdmin && (
                            <DeleteEvent
                              eventId={event._id}
                              isAdmin={isAdmin}
                            />
                          )}
                          {state === "submitted" && isAdmin && (
                            <ApproveEvent eventId={event._id} />
                          )}
                          {state === "published" && (
                            <ArchiveEvent eventId={event._id} />
                          )}
                          {(state === "archived" ||
                            (state === "published" && isAdmin)) && (
                            <ReactivateEvent
                              eventId={event._id}
                              state={state}
                            />
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                  {hasOC && (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                            Open Call
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className={cn("p-2")}>
                              <GoToEvent
                                slug={slug}
                                edition={edition}
                                hasOpenCall={true}
                                category={eventCategory}
                              />

                              <DuplicateOC openCallId={openCallId} />
                              {isAdmin && (
                                <DeleteOC
                                  openCallId={openCallId}
                                  isAdmin={isAdmin}
                                  dashboardView={isDashboard}
                                />
                              )}
                              {ocState === "submitted" && isAdmin && (
                                <ApproveOC openCallId={openCallId} />
                              )}

                              {(ocState === "archived" ||
                                ocState === "published") &&
                                isAdmin && (
                                  <ReactivateOC
                                    openCallId={openCallId}
                                    state={ocState}
                                  />
                                )}
                              {ocState === "submitted" &&
                                state === "submitted" &&
                                isAdmin && (
                                  <ApproveBoth openCallId={openCallId} />
                                )}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isAdmin && (
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                          Convex
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className={cn("p-2")}>
                            <DropdownMenuItem>
                              <CopyableItem
                                defaultIcon={
                                  <LucideClipboardCopy className="size-4" />
                                }
                                copyContent={event._id}
                              >
                                Event ID
                              </CopyableItem>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CopyableItem
                                defaultIcon={
                                  <LucideClipboardCopy className="size-4" />
                                }
                                copyContent={openCallId as string}
                              >
                                Open Call ID
                              </CopyableItem>
                            </DropdownMenuItem>

                            <DataTableOrgInfo orgId={event.mainOrgId} />
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </ConfirmingDropdown>
          </div>
        );
      },
    },
  ];

  if (isAdmin) {
    baseColumns.splice(
      baseColumns.findIndex((col) => col.id === "lastEditedAt"),
      0,
      approvedByColumn,
    );
  }

  return baseColumns;
};
