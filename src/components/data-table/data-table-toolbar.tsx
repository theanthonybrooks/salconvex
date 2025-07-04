"use client";

import { Table } from "@tanstack/react-table";
import { LucideDiamondPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

import {
  appStatusOptions,
  bookmarkIntents,
  eventCategories,
  eventStates,
  subscriptionOptions,
  subscriptionStatusOptions,
} from "@/components/data-table/data-table-row-actions";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setRowSelection: (row: Record<string, boolean>) => void;
  initialSearchTerm?: string;
}

export function DataTableToolbar<TData>({
  table,
  setRowSelection,
  initialSearchTerm,
}: DataTableToolbarProps<TData>) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const router = useRouter();
  const deleteMultipleEvents = useMutation(
    api.events.event.deleteMultipleEvents,
  );
  const toolbarData = table.options.meta?.toolbarData;
  const isFiltered = table.getState().columnFilters.length > 0;
  const isAdmin = table.options.meta?.isAdmin;
  // const viewAll = table.options.meta?.viewAll;
  // const setViewAll = table.options.meta?.setViewAll;
  const tableType = table.options.meta?.tableType;
  const pageType = table.options.meta?.pageType;
  const minimalView = table.options.meta?.minimalView;
  const forDashboard = pageType === "dashboard";
  const eventAndOC = tableType === "events" || tableType === "openCalls";
  const appsTable = tableType === "applications";
  const bookmarksTable = tableType === "bookmarks";
  const usersTable = tableType === "users";
  const selectedRowCount = Object.keys(table.getState().rowSelection).length;
  const handleDeleteSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const items = selectedRows.map((row) => {
      const { _id, state } = row.original as {
        _id: Id<"events">;
        state: string;
      };
      return { eventId: _id, state };
    });

    try {
      const result = await deleteMultipleEvents({ items, isAdmin });

      const deletedCount = result.deletedEventIds.length;
      const skippedCount = result.skippedEventIds.length;

      if (deletedCount > 0) {
        toast.success(
          `${deletedCount} event${deletedCount > 1 ? "s" : ""} deleted.`,
        );
      }

      if (skippedCount > 0) {
        toast.warning(`${skippedCount} could not be deleted.`);
      }
      setRowSelection({});
    } catch (error) {
      console.error("Failed to delete selected events:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (initialSearchTerm !== undefined) {
      table.getColumn("name")?.setFilterValue(initialSearchTerm);
    }
  }, [initialSearchTerm, table]);

  return (
    <div
      className={cn(
        "flex max-w-[90vw] items-center justify-between",
        forDashboard && "mx-auto",
      )}
    >
      <div className="mx-auto flex w-full flex-col items-center gap-3 sm:mx-0 sm:w-auto sm:flex-row">
        {/* {isAdmin && setViewAll && (
          <Button
            variant="ghost"
            onClick={() => setViewAll(!viewAll)}
            className="hover:scale-105 sm:hidden"
          >
            {viewAll ? "View Submissions" : "View  All"}
          </Button>
        )} */}

        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="mx-auto h-12 w-full max-w-[74dvw] sm:h-10 sm:w-[150px] lg:w-[200px]"
        />
        {eventAndOC && (
          <div className="flex items-center gap-3 [@media(max-width:768px)]:w-[85vw] [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:px-5">
            {table.getColumn("state") && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("state")}
                title="State"
                options={eventStates}
              />
            )}
            {table.getColumn("openCallState") && !minimalView && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("openCallState")}
                title="Open Call"
                options={eventStates}
                className={cn(
                  "2xl:flex",
                  forDashboard && "flex",
                  !forDashboard && "not-ipad md:hidden",
                )}
              />
            )}
            {table.getColumn("category") && !minimalView && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("category")}
                title="Category"
                options={eventCategories}
              />
            )}

            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "hidden h-10 items-center gap-1 border-dashed bg-card md:flex",
                  )}
                  onClick={() => router.push("/dashboard/admin/event")}
                >
                  <LucideDiamondPlus className="size-4" />
                  Add New
                </Button>

                {/* {setViewAll && (
                  <Button
                    variant="salWithShadowHidden"
                    onClick={() => setViewAll(!viewAll)}
                    className="h-10 sm:h-10"
                  >
                    {viewAll ? "View Submissions" : "View  All"}
                  </Button>
                )} */}
              </>
            )}
          </div>
        )}
        {usersTable && (
          <div className="flex items-center gap-3 [@media(max-width:768px)]:w-[85vw] [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:px-5">
            {table.getColumn("subscription") && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("subscription")}
                title="Subscription"
                options={subscriptionOptions}
              />
            )}
            {table.getColumn("subStatus") && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("subStatus")}
                title="Status"
                options={subscriptionStatusOptions}
              />
            )}

            {/* {table.getColumn("openCallState") && !minimalView && (
              <DataTableFacetedFilter
              isMobile={isMobile}
              forDashboard={forDashboard}
                column={table.getColumn("openCallState")}
                title="Open Call"
                options={eventStates}
                className={cn(
                  "2xl:flex",
                  forDashboard && "flex",
                  !forDashboard && "not-ipad md:hidden",
                )}
              />
            )} */}
            <span className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Total Monthly:</p>
              <p className="text-sm font-bold">
                {toolbarData?.totalPerMonth?.toFixed(2) ?? 0}
              </p>
            </span>
            <span className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Total Annual:</p>
              <p className="text-sm font-bold">
                {toolbarData?.totalPerYear?.toFixed(2) ?? 0}
              </p>
            </span>
          </div>
        )}
        {appsTable && (
          <div className="flex flex-row items-center justify-between gap-3 md:flex-row [@media(max-width:768px)]:w-[85vw] [@media(max-width:768px)]:px-5">
            {table.getColumn("applicationStatus") && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("applicationStatus")}
                title="Status"
                options={appStatusOptions}
              />
            )}
          </div>
        )}
        {bookmarksTable && (
          <div className="flex flex-row items-center justify-between gap-3 md:flex-row [@media(max-width:768px)]:w-[85vw] [@media(max-width:768px)]:px-5">
            {table.getColumn("eventIntent") && (
              <DataTableFacetedFilter
                isMobile={isMobile}
                forDashboard={forDashboard}
                column={table.getColumn("eventIntent")}
                title="Intent"
                options={bookmarkIntents}
              />
            )}
          </div>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="hidden h-8 px-2 sm:inline-flex sm:gap-1 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {eventAndOC &&
          isAdmin &&
          pageType === "dashboard" &&
          selectedRowCount > 0 && (
            <Button
              variant="ghost"
              onClick={() => handleDeleteSelected()}
              className="hidden hover:scale-105 sm:inline-flex"
            >
              Delete Selection
            </Button>
          )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
