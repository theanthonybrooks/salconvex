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
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const tablePageSize = table.getState().pagination.pageSize;
  const formType = table.options.meta?.pageType === "form";
  const minimalView = table.options.meta?.minimalView;
  // const tableType = table.options.meta?.tableType;
  // const forEvents = tableType === "events";
  // console.log(table.nextPage());

  // console.log(table.previousPage());

  if (table.options.data.length <= 10 && formType) return;
  return (
    <div className="flex flex-col items-center justify-between gap-y-2 px-2 sm:flex-row">
      {!minimalView && (
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <div className="flex w-full items-center justify-around space-x-6 lg:space-x-8">
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
              {[10, 20, 30, 40, 50].map((pageSize) => (
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
              "hidden size-8 max-h-8 p-0 lg:flex",
              "disabled:border-foreground/50 disabled:opacity-30 sm:disabled:invisible",
            )}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className={cn(
              "h-8 max-h-8 w-10 p-0 sm:w-auto sm:p-2",
              "disabled:border-foreground/50 disabled:opacity-30 sm:disabled:invisible",
            )}
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
              "h-8 max-h-8 w-10 p-0 sm:w-auto sm:p-2",
              "disabled:border-foreground/50 disabled:opacity-30",
            )}
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
              "hidden size-8 max-h-8 p-0 lg:flex",
              "disabled:border-foreground/50 disabled:opacity-30",
            )}
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
