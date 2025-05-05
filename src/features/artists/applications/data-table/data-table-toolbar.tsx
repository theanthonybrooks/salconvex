"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  eventCategories,
  eventStates,
} from "@/features/artists/applications/data-table/data-table-row-actions";
import { DataTableViewOptions } from "@/features/artists/applications/data-table/data-table-view-options";
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
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-10 w-full sm:w-[150px] lg:w-[250px]"
        />
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
          <Button variant="ghost" onClick={() => setViewAll(!viewAll)}>
            {viewAll ? "View Submissions" : "View  All"}
          </Button>
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
