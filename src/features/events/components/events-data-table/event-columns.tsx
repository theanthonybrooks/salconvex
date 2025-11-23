//TODO: Break the dropdown menu into sub-menus.

"use client";

import {
  EventCategory,
  EventType,
  PostStatus,
  SubmissionFormState,
} from "@/types/eventTypes";
import { OpenCallState } from "@/types/openCallTypes";

import { ColumnDef } from "@tanstack/react-table";

import { Globe, LucideClipboardCopy, MoreHorizontal } from "lucide-react";

import {
  DataTableAdminOrgActions,
  DataTableAdminOrgStateActions,
} from "@/components/data-table/actions/DataTableAdminOrgActions";
import {
  ApproveEvent,
  ArchiveEvent,
  CopyEventId,
  DeleteEvent,
  DuplicateEvent,
  GoToEvent,
  ReactivateEvent,
} from "@/components/data-table/actions/DataTableEventActions";
import { DataTableEventEdition } from "@/components/data-table/actions/DataTableEventEdition";
import {
  DataTableEventName,
  RenameEventDialog,
} from "@/components/data-table/actions/DataTableEventName";
import {
  ApproveBoth,
  ApproveOC,
  DeleteOC,
  DuplicateOC,
  ReactivateOC,
} from "@/components/data-table/actions/DataTableOCActions";
import { DataTableOrgInfo } from "@/components/data-table/actions/DataTableOrgInfo";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
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
import { getEventCategoryLabel, getEventTypeLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";

import { Id } from "~/convex/_generated/dataModel";

export const columnLabels: Record<string, string> = {
  name: "Name",
  dates_edition: "Edition",
  state: "State",
  openCallState: "Open Call",
  approvedBy: "Approved By",
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
  openCallApproved?: boolean;
};

export const getEventColumns = <T extends Event>(
  isAdmin: boolean,
): ColumnDef<T>[] => {
  const approvedByColumn: ColumnDef<T> = {
    accessorKey: "approvedBy",
    id: "approvedBy",
    minSize: 160,
    maxSize: 160,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approved By" />
    ),
    cell: ({ row }) => {
      const {
        eApprovedByUserName: eApprover,
        ocApprovedByUserName: oApprover,
      } = row.original;

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

  const numberColumn: ColumnDef<T> = {
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
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableMultiSort: true,
  };

  const selectColumn: ColumnDef<T> = {
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
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  };
  const baseColumns: ColumnDef<T>[] = [
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
        const event = row.original as T;

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
      enableMultiSort: true,
      sortUndefined: "last",
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
        const { state } = row.original;
        const isAdmin = table.options.meta?.isAdmin;

        return (
          <div className="flex justify-center">
            <DataTableAdminOrgStateActions
              eventId={row.original._id}
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
      enableMultiSort: true,
      sortUndefined: "last",
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
        const { _id: eventId } = row.original;
        const ocState =
          (row.getValue("openCallState") as OpenCallState) || null;
        const isAdmin = table.options.meta?.isAdmin;
        return (
          <div className="flex justify-center">
            <DataTableAdminOrgStateActions
              eventId={eventId}
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
      enableMultiSort: true,
      sortUndefined: "last",
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
              {getEventCategoryLabel(row.getValue("category"), true)}
            </span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue)) return true;
        return filterValue.includes(row.getValue(columnId));
      },
      enableMultiSort: true,
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
        const { type: types } = row.original;

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
      enableMultiSort: true,
    },
    {
      accessorKey: "lastEditedAt",
      id: "lastEditedAt",
      minSize: 180,
      maxSize: 180,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Edited" />
      ),
      cell: ({ row }) => {
        const { lastEditedAt: value } = row.original;
        return (
          <div className="flex justify-center space-x-2">
            <span className="max-w-[175px] truncate font-medium capitalize">
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
    {
      accessorKey: "_id",
      minSize: 120,
      maxSize: 400,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event ID" />
      ),
      cell: ({ row }) => {
        const value = row.original;
        return (
          <div className="flex justify-center">
            <CopyEventId eventId={value._id} />
          </div>
        );
      },
      enableMultiSort: true,
    },
    {
      id: "actions",

      maxSize: 40,
      minSize: 40,
      enableResizing: false,
      cell: ({ row, table }) => {
        const {
          slug,
          state,
          openCallState: ocState,
          openCallId,
          dates: { edition },
          openCallApproved: ocApproved,
          posted: postStatus,
        } = row.original;
        const event = row.original;
        const eventCategory = event.category as EventCategory;
        const { isAdmin, isEditor } = table.options.meta ?? {};
        const isDashboard = table.options.meta?.pageType === "dashboard";
        const hasOC = !!openCallId;

        const neitherApproved = !ocApproved && !event.approvedAt;

        const handleFirstRowSelect = () => {
          setTimeout(() => {
            table.setRowSelection({ 0: true });
          }, 300);
        };

        return (
          <div
            className={cn("flex justify-center", isAdmin && "flex")}
            onClick={(e) => e.stopPropagation()}
          >
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
                  {(isAdmin || isEditor) && (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DataTableAdminOrgActions
                          eventId={event._id}
                          userRole="admin"
                        />

                        <GoToEvent
                          slug={slug}
                          edition={edition}
                          hasOpenCall={hasOC}
                          category={eventCategory}
                          general={true}
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
                          {/* note-to-self: this is the 'View Event' link */}
                          <GoToEvent
                            slug={slug}
                            edition={edition}
                            hasOpenCall={false}
                            category={eventCategory}
                          />
                          {isDashboard && <RenameEventDialog event={event} />}
                          {((state === "draft" && neitherApproved) ||
                            isAdmin) && (
                            <DeleteEvent
                              eventId={event._id}
                              isAdmin={isAdmin}
                            />
                          )}

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
                          <DuplicateEvent
                            eventId={event._id}
                            onDuplicate={handleFirstRowSelect}
                          />

                          {state === "submitted" && isAdmin && (
                            <ApproveEvent eventId={event._id} />
                          )}
                          {state === "published" && (
                            <ArchiveEvent eventId={event._id} />
                          )}
                          {(state === "archived" ||
                            (state === "published" && isEditor)) && (
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
                              {/* note-to-self: this is the 'View OC' link */}
                              <GoToEvent
                                slug={slug}
                                edition={edition}
                                hasOpenCall={true}
                                category={eventCategory}
                              />

                              <DuplicateOC
                                openCallId={openCallId}
                                onDuplicate={handleFirstRowSelect}
                              />
                              {(isAdmin || !ocApproved) && (
                                <DeleteOC
                                  openCallId={openCallId}
                                  isAdmin={isAdmin}
                                />
                              )}
                              {ocState === "submitted" && isAdmin && (
                                <ApproveOC openCallId={openCallId} />
                              )}

                              {(ocState === "archived" ||
                                ocState === "published") && (
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

    return [numberColumn, ...baseColumns];
  }

  return [selectColumn, ...baseColumns];
};
