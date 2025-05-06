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
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const isAdmin = table.options.meta?.isAdmin;
  const viewAll = table.options.meta?.viewAll;
  const setViewAll = table.options.meta?.setViewAll;
  const tableType = table.options.meta?.tableType;
  const eventAndOC = tableType === "events" || tableType === "openCalls";
  return (
    <div className="flex max-w-[90vw] items-center justify-between">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
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
                className="md:hidden xl:flex"
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
      <DataTableViewOptions table={table} />
    </div>
  );
}
