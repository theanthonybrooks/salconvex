"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  eventCategories,
  eventStates,
} from "@/components/data-table/data-table-row-actions";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setRowSelection: (row: Record<string, boolean>) => void;
}

export function DataTableToolbar<TData>({
  table,
  setRowSelection,
}: DataTableToolbarProps<TData>) {
  const deleteMultipleEvents = useMutation(
    api.events.event.deleteMultipleEvents,
  );
  const isFiltered = table.getState().columnFilters.length > 0;
  const isAdmin = table.options.meta?.isAdmin;
  const viewAll = table.options.meta?.viewAll;
  const setViewAll = table.options.meta?.setViewAll;
  const tableType = table.options.meta?.tableType;
  const pageType = table.options.meta?.pageType;
  const forDashboard = pageType === "dashboard";
  const eventAndOC = tableType === "events" || tableType === "openCalls";
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

  return (
    <div className="flex max-w-[90vw] items-center justify-between">
      <div className="mx-auto flex w-full flex-col items-center gap-3 sm:mx-0 sm:w-auto sm:flex-row">
        {isAdmin && setViewAll && (
          <Button
            variant="ghost"
            onClick={() => setViewAll(!viewAll)}
            className="hover:scale-105 sm:hidden"
          >
            {viewAll ? "View Submissions" : "View  All"}
          </Button>
        )}

        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="mx-auto h-10 w-full max-w-[74dvw] sm:w-[150px] lg:w-[200px]"
        />
        {eventAndOC && (
          <div className="flex items-center justify-between gap-3">
            {table.getColumn("state") && (
              <DataTableFacetedFilter
                column={table.getColumn("state")}
                title="State"
                options={eventStates}
              />
            )}
            {table.getColumn("openCallStatus") && (
              <DataTableFacetedFilter
                column={table.getColumn("openCallStatus")}
                title="Open Call"
                options={eventStates}
                className={cn(
                  "2xl:flex",
                  forDashboard && "flex",
                  !forDashboard && "not-ipad md:hidden",
                )}
              />
            )}
            {table.getColumn("category") && (
              <DataTableFacetedFilter
                column={table.getColumn("category")}
                title="Category"
                options={eventCategories}
              />
            )}

            {isAdmin && setViewAll && (
              <Button
                variant="ghost"
                onClick={() => setViewAll(!viewAll)}
                className="hidden hover:scale-105 sm:inline-flex"
              >
                {viewAll ? "View Submissions" : "View  All"}
              </Button>
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
        {isAdmin && pageType === "dashboard" && selectedRowCount > 0 && (
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
