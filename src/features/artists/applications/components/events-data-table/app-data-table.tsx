"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/features/artists/applications/components/events-data-table/apps-data-table-toolbar";
import { cn } from "@/lib/utils";
import { PageTypes, TableTypes } from "@/types/tanstack-table";
import { useEffect } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultVisibility?: VisibilityState;
  onRowSelect?: (row: TData | null, selection: Record<string, boolean>) => void;
  className?: string;
  tableClassName?: string;
  outerContainerClassName?: string;
  selectedRow?: Record<string, boolean>;
  adminActions?: {
    isAdmin: boolean;
  };
  tableType?: TableTypes;
  pageType?: PageTypes;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelect,
  defaultVisibility,
  className,
  tableClassName,
  outerContainerClassName,
  selectedRow,

  adminActions,
  tableType,
  pageType,
}: DataTableProps<TData, TValue>) {
  const { isAdmin } = adminActions ?? {};
  const [rowSelection, setRowSelection] = React.useState(selectedRow ?? {});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultVisibility ?? {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",

    meta: {
      isAdmin,

      tableType,
      pageType,
    },

    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      setRowSelection(newSelection);

      const selectedKey = Object.keys(newSelection)[0];
      const selectedRow =
        selectedKey !== undefined ? data[Number(selectedKey)] : null;

      onRowSelect?.(selectedRow, newSelection);
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableMultiRowSelection: pageType === "dashboard",
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    if (selectedRow && Object.keys(selectedRow).length > 0) {
      // setRowSelection(selectedRow);
      // console.log("dogs");
    } else {
      setRowSelection({});
    }

    // console.log("selected row", selectedRow);
  }, [selectedRow]);

  useEffect(() => {
    if (isAdmin) {
      setRowSelection({});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (defaultVisibility) {
      setColumnVisibility(defaultVisibility);
    }
  }, [defaultVisibility]);

  useEffect(() => {
    const selectedKey = Object.keys(rowSelection)[0];

    if (selectedKey !== undefined && !data[Number(selectedKey)]) {
      setRowSelection({});
      onRowSelect?.(null, {});
    }
  }, [data, rowSelection, onRowSelect]);

  // console.log(
  //   table
  //     .getAllLeafColumns()
  //     .filter((col) => col.getIsVisible())
  //     .map((col) => col.id),
  // );

  return (
    <div className={cn("w-full space-y-4", outerContainerClassName)}>
      <DataTableToolbar table={table} setRowSelection={setRowSelection} />
      <div className={cn("rounded-md border", className)}>
        <Table
          containerClassname={cn(
            "rounded-md h-fit max-h-[calc(85dvh-13rem)]  sm:max-h-[calc(85dvh-10rem)] 3xl:max-h-[calc(85dvh-7rem)] scrollable,",
            tableClassName,
          )}
        >
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_0.5px_0_0_rgba(0,0,0,1)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn("px-3 hover:bg-white/50")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={row.getToggleSelectedHandler()}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "bg-white/50 hover:cursor-pointer hover:bg-salYellow/10 data-[state=selected]:bg-salPink/30",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      style={{
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                      width={cell.column.columnDef.size ?? undefined}
                      key={cell.id}
                      className={cn(
                        "px-3",
                        cell.column.getIndex() > 1
                          ? "border-l border-border"
                          : undefined,
                        // cell.column.getIndex() ===
                        //   cell.row.getVisibleCells().length - 1 &&
                        //   cell.row.getVisibleCells().length > 5 &&
                        //   "border-none",
                        {
                          /*  note-to-self:  ^ was specifically there for the context menu in the last column  */
                        },
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
