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

import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultVisibility?: VisibilityState;
  onRowSelect?: (row: TData | null) => void;
  className?: string;
  containerClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelect,
  defaultVisibility,
  className,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
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

    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    // onRowSelectionChange: setRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      setRowSelection(newSelection);

      const selectedKey = Object.keys(newSelection)[0];
      const selectedRow =
        selectedKey !== undefined ? data[Number(selectedKey)] : null;

      onRowSelect?.(selectedRow);
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableMultiRowSelection: false,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    console.log("Row selection changed:", rowSelection);
  }, [rowSelection]);

  return (
    <div className={cn("w-full space-y-4", containerClassName)}>
      <DataTableToolbar table={table} />
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn("bg-white/20 px-3 hover:bg-white/50")}
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
                    "bg-white/50 hover:cursor-pointer hover:bg-white/70 data-[state=selected]:bg-salYellow/30",
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
