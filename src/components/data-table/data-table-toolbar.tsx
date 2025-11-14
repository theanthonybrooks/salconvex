"use client";

import { TableTypes } from "@/types/tanstack-table";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@tanstack/react-table";
import { toast } from "react-toastify";

import { TbFilterX } from "react-icons/tb";
import { X } from "lucide-react";

import { TABLE_FILTERS } from "@/components/data-table/data-table-constants";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { AlertDialogSimple } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipSimple } from "@/components/ui/tooltip";
import { OnlineEventDialog } from "@/features/resources/components/online-event-dialog";
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";
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
  const { isMobile } = useDevice();
  const router = useRouter();
  const deleteMultipleEvents = useMutation(
    api.events.event.deleteMultipleEvents,
  );
  const [searchActive, setSearchActive] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const initialSort = table.initialState.sorting;
  const currentSort = table.getState().sorting;
  const isDefaultSort =
    JSON.stringify(initialSort) === JSON.stringify(currentSort);
  const isSorted = currentSort.length > 0 && !isDefaultSort;
  const oneFilter = table.getState().columnFilters.length === 1;
  const onlySearch = oneFilter && searchActive;
  const isAdmin = table.options.meta?.isAdmin;
  const tableType = table.options.meta?.tableType;
  const pageType = table.options.meta?.pageType;
  const filters =
    tableType && TABLE_FILTERS[tableType]
      ? TABLE_FILTERS[tableType].filter(
          (filter) => !filter.pageType || filter.pageType === pageType,
        )
      : [];

  // const tableType = table.options.meta?.tableType;

  const minimalView = table.options.meta?.minimalView;
  const forDashboard = pageType === "dashboard";
  const eventAndOC = tableType === "events" || tableType === "openCalls";
  const resourcesTable = tableType === "resources";
  // const userAddOnsTable = tableType === "userAddOns";
  // const appsTable = tableType === "applications";
  // const artistsTable = tableType === "artists";
  // const bookmarksTable = tableType === "bookmarks";
  // const usersTable = tableType === "users";
  // const organizersTable = tableType === "organizations";
  // const orgEventsTable = tableType === "orgEvents";
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
  const handleClearParams = () => {
    const path = window.location.pathname;
    router.replace(path, { scroll: false });
    setSearchActive(false);
  };

  useEffect(() => {
    if (initialSearchTerm !== undefined) {
      table.getColumn("name")?.setFilterValue(initialSearchTerm);
    }
  }, [initialSearchTerm, table]);

  const getColumnLabel = (table?: TableTypes) => {
    // note-to-self: use this to adjust the default column for searching. For now, it's just the name column.
    if (table === "artists") return "name";
    return "name";
  };

  return (
    <div
      className={cn(
        "flex max-w-[90vw] items-center justify-between",
        forDashboard && "mx-auto",
      )}
    >
      <div className="mx-auto flex w-full max-w-[80vw] flex-col items-center gap-3 sm:mx-0 sm:w-auto sm:flex-row">
        <Input
          placeholder="Search..."
          value={
            (table
              .getColumn(getColumnLabel(tableType))
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            table
              .getColumn(getColumnLabel(tableType))
              ?.setFilterValue(event.target.value);
            if (event.target.value.length > 0) {
              setSearchActive(true);
            } else {
              setSearchActive(false);
            }
          }}
          className="mx-auto h-12 w-full sm:h-10 sm:w-[150px] lg:w-[200px]"
        />
        {resourcesTable && isAdmin && (
          <div className="flex items-center gap-3 [@media(max-width:640px)]:w-full [@media(max-width:640px)]:flex-col">
            <OnlineEventDialog type="create">
              <Button
                variant="salWithShadowHidden"
                className="w-full px-2 sm:h-10 sm:w-fit lg:px-3"
              >
                Add Event
              </Button>
            </OnlineEventDialog>
          </div>
        )}
        {filters.length > 0 && (
          <div className="flex items-center gap-3 [@media(max-width:640px)]:w-full [@media(max-width:640px)]:flex-col">
            {filters.map((filter) => {
              const column = table.getColumn(filter.columnId);
              if (!column) return null;
              return (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  isMobile={isMobile}
                  forDashboard={forDashboard}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                  minimalView={minimalView}
                />
              );
            })}
          </div>
        )}

        {(isFiltered || isSorted) && (
          <TooltipSimple
            content={
              onlySearch
                ? "Clear search"
                : isSorted
                  ? "Reset options"
                  : "Reset filters"
            }
          >
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                table.resetSorting();
                handleClearParams();
              }}
              className="hidden h-8 px-2 sm:inline-flex sm:gap-1 lg:px-3"
            >
              {!minimalView && (onlySearch ? "Clear" : "Reset")}
              {onlySearch || isSorted ? (
                <X className="size-5" />
              ) : (
                <TbFilterX className="size-5" />
              )}
            </Button>
          </TooltipSimple>
        )}
      </div>
      <div className="flex items-center gap-3">
        {eventAndOC &&
          isAdmin &&
          pageType === "dashboard" &&
          selectedRowCount > 0 && (
            <AlertDialogSimple
              label="Delete Selection?"
              description="Are you sure you want to delete the selected events?"
              onConfirmAction={handleDeleteSelected}
            >
              <Button
                variant="ghost"
                className="hidden hover:scale-105 sm:inline-flex"
              >
                Delete Selection
              </Button>
            </AlertDialogSimple>
          )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
