import { useIsMobile } from "@/hooks/use-media-query";
import { Table } from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const isMobile = useIsMobile();
  const totalResults = table.getFilteredRowModel().rows.length;
  const tablePageSize = table.getState().pagination.pageSize;
  const tablePageIndex = table.getState().pagination.pageIndex;

  const formType = table.options.meta?.pageType === "form";
  const minimalView = table.options.meta?.minimalView;

  const currentStartingPgResultsNumber = tablePageIndex * tablePageSize + 1;
  const currentEndingPgResultsNumber = Math.min(
    (tablePageIndex + 1) * tablePageSize,
    totalResults,
  );
  const hasSelectColumn = table
    .getAllColumns()
    .some((col) => col.id === "select");

  // const tableType = table.options.meta?.tableType;
  // const forEvents = tableType === "events";
  // console.log(table.nextPage());

  // console.log(table.previousPage());

  if (table.options.data.length <= 10 && formType) return;
  return (
    <div className="flex flex-col items-center justify-between gap-y-2 px-2 sm:flex-row">
      {hasSelectColumn && (
        <div
          className={cn(
            "flex-1 text-sm text-muted-foreground",
            (minimalView || formType) && "invisible",
          )}
        >
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      {!hasSelectColumn && (
        <div className={cn("flex-1 text-sm text-muted-foreground")}>
          {currentStartingPgResultsNumber}-{currentEndingPgResultsNumber} of{" "}
          {table.getFilteredRowModel().rows.length} results
        </div>
      )}

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="hidden items-center space-x-2 sm:flex">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={tablePageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className={cn(
              "hsm:max-h-8 idden p-0 sm:size-8 lg:flex",
              "disabled:border-foreground/50 disabled:opacity-30",
              // "sm:disabled:invisible",
            )}
            size={isMobile ? "lg" : "sm"}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className={cn(
              "w-full p-0 px-4 sm:size-8 sm:max-h-8 sm:w-auto sm:p-2",
              "disabled:border-foreground/50 disabled:opacity-30",
              // "sm:disabled:invisible",
            )}
            size={isMobile ? "lg" : "sm"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="sm:hidden" />
            <p className="hidden sm:block">Prev</p>
          </Button>
          <Button
            variant="outline"
            className={cn(
              "w-full p-0 px-4 sm:size-8 sm:max-h-8 sm:w-auto sm:p-2",
              "disabled:border-foreground/50 disabled:opacity-30",
            )}
            size={isMobile ? "lg" : "sm"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="sm:hidden" />
            <p className="hidden sm:block">Next</p>
          </Button>
          <Button
            variant="outline"
            className={cn(
              "hidden p-0 sm:size-8 sm:max-h-8 lg:flex",
              "disabled:border-foreground/50 disabled:opacity-30",
            )}
            size={isMobile ? "lg" : "sm"}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
