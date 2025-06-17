"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
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
import { positiveApplicationStatuses } from "@/types/applications";
import { PageTypes, TableTypes } from "@/types/tanstack-table";
import { useEffect } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

export type ToolbarData = {
  totalPerMonth?: number;
  totalPerYear?: number;
  userCount?: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbarData?: ToolbarData;
  defaultVisibility?: VisibilityState;
  onRowSelect?: (row: TData | null, selection: Record<string, boolean>) => void;
  className?: string;
  tableClassName?: string;
  outerContainerClassName?: string;
  selectedRow?: Record<string, boolean>;
  adminActions?: {
    isAdmin: boolean;
    viewAll: boolean;
    setViewAll: React.Dispatch<React.SetStateAction<boolean>>;
  };
  tableType?: TableTypes;
  pageType?: PageTypes;
  initialSearchTerm?: string;
  minimalView?: boolean;
  defaultSort?: ColumnSort;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbarData,
  onRowSelect,
  defaultVisibility,
  className,
  tableClassName,
  outerContainerClassName,
  selectedRow,

  adminActions,
  tableType,
  pageType,
  initialSearchTerm,
  minimalView,
  defaultSort,
}: DataTableProps<TData, TValue>) {
  const { isAdmin, viewAll, setViewAll } = adminActions ?? {};
  const [rowSelection, setRowSelection] = React.useState(selectedRow ?? {});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultVisibility ?? {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const initialSort = React.useMemo<SortingState>(() => {
    return defaultSort ? [{ id: defaultSort.id, desc: defaultSort.desc }] : [];
  }, [defaultSort]);
  const [sorting, setSorting] = React.useState<SortingState>(initialSort);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",

    meta: {
      isAdmin,
      viewAll,
      setViewAll,
      tableType,
      pageType,
      minimalView,
      toolbarData,
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
  const tableRows = table.getRowModel().rows;
  const preloadedEvent = initialSearchTerm ? tableRows[0]?.index : null;
  const hasPreloadedEvent =
    typeof preloadedEvent === "number" && preloadedEvent > 0;

  useEffect(() => {
    if (!hasPreloadedEvent || Object.keys(rowSelection)?.length > 0) return;
    setRowSelection({ [preloadedEvent]: true });
  }, [table, preloadedEvent, hasPreloadedEvent, rowSelection]);

  useEffect(() => {
    if (selectedRow && Object.keys(selectedRow).length > 0) {
      // setRowSelection(selectedRow);
      // console.log("dogs");
    } else {
      setRowSelection({});
    }
  }, [selectedRow]);

  useEffect(() => {
    if (isAdmin) {
      setRowSelection({});
    }
  }, [viewAll, isAdmin]);

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

  return (
    <div className={cn("w-full space-y-4", outerContainerClassName)}>
      <DataTableToolbar
        table={table}
        setRowSelection={setRowSelection}
        initialSearchTerm={initialSearchTerm}
      />
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
              table.getRowModel().rows.map((row) => {
                let bgStatusClass = "";

                if (tableType === "bookmarks") {
                  const { eventIntent } = row.original as {
                    eventIntent: string | null;
                  };

                  if (eventIntent !== null) {
                    if (eventIntent === "planned") {
                      bgStatusClass = "bg-yellow-100";
                    } else if (eventIntent === "missed") {
                      bgStatusClass = "bg-stone-100 text-foreground/50";
                    } else if (eventIntent === "rejected") {
                      bgStatusClass = "bg-red-100 text-red-700";
                    } else if (
                      positiveApplicationStatuses.includes(eventIntent)
                    ) {
                      bgStatusClass = "bg-green-100";
                    }
                  }
                }
                return (
                  <TableRow
                    key={row.id}
                    onClick={row.getToggleSelectedHandler()}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "bg-white/50 hover:cursor-pointer hover:bg-salYellow/10 data-[state=selected]:bg-salPink/30",
                      tableType === "bookmarks" && bgStatusClass,
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
                );
              })
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
