"use client";

import {
  onlineEventStatusBgColorMap,
  onlineEventStatusColorMap,
  registrationStatusBgColorMap,
  registrationStatusColorMap,
} from "@/constants/resourcesConsts";

import {
  ApplicationStatus,
  NonNullApplicationStatus,
  positiveApplicationStatuses,
  statusBgColorMap,
  statusColorMap,
} from "@/types/applications";
import { PageTypes, TableTypes } from "@/types/tanstack-table";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import type { OnlineEventStateType, UserAddOnStatus } from "~/convex/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/helpers/utilsFns";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

// "events" | "orgEvents" | "organizations" | "openCalls" | "users" | "artists" | "newsletter" | "applications" | "bookmarks" | "hidden"

export const selectableTableTypes: TableTypes[] = [
  "events",
  "orgEvents",
  "organizations",
  // "users",
  // "artists",
  // "newsletter",
  // "applications",
  "openCalls",
  "resources",
];

export const numberedTableTypes: TableTypes[] = [
  "users",
  "artists",
  "newsletter",
  "applications",
  "bookmarks",
  "hidden",
  "resources",
];

export type AdminActions = {
  isAdmin: boolean;
  isEditor?: boolean;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  defaultVisibility?: VisibilityState;
  onRowSelect?: (row: TData | null, selection: Record<string, boolean>) => void;
  className?: string;
  tableClassName?: string;
  outerContainerClassName?: string;
  selectedRow?: Record<string, boolean>;
  adminActions?: AdminActions;
  tableType?: TableTypes;
  pageType?: PageTypes;
  initialSearchTerm?: string;
  minimalView?: boolean;
  defaultSort?: ColumnSort;
  defaultFilters?: ColumnFiltersState;
  pageSize?: number;
  isMobile?: boolean;
  collapsedSidebar?: boolean;
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
  initialSearchTerm,
  minimalView,
  defaultSort,
  defaultFilters,
  pageSize = 10,
  isMobile,
  collapsedSidebar,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const isSelectable = tableType
    ? selectableTableTypes.includes(tableType)
    : false;

  const defaultFiltersFromUrl: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = [];

    const validColumnIds = columns.map((c) => c.id).filter(Boolean);

    searchParams.forEach((value, key) => {
      if (!value) return;
      console.log(key, value);
      if (!validColumnIds.includes(key)) return;

      const values = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (values.length > 0) {
        filters.push({ id: key, value: values });
      }
    });

    return filters;
  }, [searchParams, columns]);

  const { isAdmin, isEditor } = adminActions ?? {};

  const [rowSelection, setRowSelection] = useState(selectedRow ?? {});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultVisibility ?? {},
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    // merge filters from URL and from props, with URL taking precedence
    if (defaultFilters?.length) {
      const merged = [
        ...defaultFiltersFromUrl,
        ...defaultFilters.filter(
          (def) => !defaultFiltersFromUrl.some((f) => f.id === def.id),
        ),
      ];
      return merged;
    }
    return defaultFiltersFromUrl;
  });

  const initialSort = useMemo<SortingState>(() => {
    return defaultSort ? [{ id: defaultSort.id, desc: defaultSort.desc }] : [];
  }, [defaultSort]);

  const [sorting, setSorting] = useState<SortingState>(initialSort);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",

    meta: {
      isAdmin,
      isEditor,
      isMobile,

      tableType,
      pageType,
      collapsedSidebar,
      minimalView,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
      sorting: initialSort,
    },

    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: isSelectable,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      setRowSelection(newSelection);

      const selectedKey = Object.keys(newSelection)[0];
      const selectedRow =
        selectedKey !== undefined ? data[Number(selectedKey)] : null;

      onRowSelect?.(selectedRow, newSelection);
    },
    // isMultiSortEvent: () => true,
    isMultiSortEvent: (e: unknown) => {
      if (e instanceof MouseEvent || e instanceof KeyboardEvent) {
        console.log("Multi-sort event:", {
          type: e.type,
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
        });
        return e.ctrlKey || e.shiftKey;
      }
      return false;
    },

    enableMultiSort: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableMultiRowSelection:
      pageType === "dashboard" && tableType === "events" && isAdmin,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const tableRows = table.getRowModel?.().rows ?? [];
  const preloadedEvent =
    initialSearchTerm && tableRows.length > 0 ? tableRows[0]?.index : null;
  const hasPreloadedEvent =
    typeof preloadedEvent === "number" && preloadedEvent >= 0;
  const hasRows = table.getRowModel().rows?.length > 0;
  const hasSelectedPreload = useRef(false);

  useEffect(() => {
    if (
      !hasPreloadedEvent ||
      Object.keys(rowSelection)?.length > 0 ||
      hasSelectedPreload.current
    )
      return;
    setRowSelection({ [preloadedEvent]: true });
    hasSelectedPreload.current = true;
  }, [preloadedEvent, hasPreloadedEvent, rowSelection]);
  // useEffect(() => {
  //   if (!hasPreloadedEvent || Object.keys(rowSelection)?.length > 0) return;
  //   setRowSelection({ [preloadedEvent]: true });
  // }, [table, preloadedEvent, hasPreloadedEvent, rowSelection]);

  useEffect(() => {
    if (selectedRow && Object.keys(selectedRow).length > 0) {
      // setRowSelection(selectedRow);
    } else {
      setRowSelection({});
    }
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

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [table, pageSize]);

  // useEffect(() => {
  //   if (!data.length) return;
  //   console.log("fuckery 2");

  //   const newSelection = { 0: true };
  //   setRowSelection(newSelection);
  // }, [data]);

  // useEffect(() => {
  //   const selectedKey = Object.keys(rowSelection)[0];

  //   console.log("fuckery", selectedKey);
  //   // const selectedRow =
  //   //   selectedKey !== undefined ? data[Number(selectedKey)] : null;

  //   // onRowSelect?.(selectedRow, rowSelection);
  // }, [rowSelection]);

  // useEffect(() => {
  //   if (!data.length) return;

  //   // Get the first row index (or whichever should be "newest")
  //   const firstRowIndex = 0;

  //   // If no row is selected yet, or if the new data length increased, select first
  //   const hasSelection = Object.keys(rowSelection).length > 0;

  //   if (!hasSelection) {
  //     setRowSelection({ [firstRowIndex]: true });
  //     onRowSelect?.(data[firstRowIndex], { [firstRowIndex]: true });
  //   }
  // }, [data, rowSelection, onRowSelect]);

  return (
    <div className={cn("w-full space-y-4 pb-3", outerContainerClassName)}>
      <DataTableToolbar
        table={table}
        setRowSelection={setRowSelection}
        initialSearchTerm={initialSearchTerm}
      />
      <div className={cn("rounded-md border", className)}>
        <Table
          containerClassname={cn(
            "scrollable, short-screen h-fit max-h-[calc(85dvh-13rem)] rounded-md sm:max-h-[calc(85dvh-13rem)] 3xl:max-h-[calc(85dvh-10rem)]",
            tableClassName,
          )}
          className={cn(hasRows && "table-fixed")}
        >
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_0.5px_0_0_rgba(0,0,0,1)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn("group relative")}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanResize() && hasRows && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-[5px] cursor-col-resize touch-none select-none",
                            header.column.getIsResizing() && "bg-primary",
                          )}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {hasRows ? (
              table.getRowModel().rows.map((row) => {
                let bgStatusClass = "";

                if (tableType === "artists") {
                  const { feature } = row.original as {
                    feature: boolean | null;
                  };
                  if (feature === true) {
                    bgStatusClass = "bg-green-100";
                  }
                }

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
                } else if (tableType === "applications") {
                  const { applicationStatus } = row.original as {
                    applicationStatus: ApplicationStatus | null;
                  };
                  const statusColor =
                    statusBgColorMap[
                      applicationStatus as NonNullApplicationStatus
                    ];
                  const textColor =
                    statusColorMap[
                      applicationStatus as NonNullApplicationStatus
                    ];
                  bgStatusClass = `${statusColor} ${textColor}`;
                } else if (tableType === "resources") {
                  const { state } = row.original as {
                    state: OnlineEventStateType;
                  };
                  const statusColor = onlineEventStatusBgColorMap[state];
                  const textColor = onlineEventStatusColorMap[state];
                  bgStatusClass = `${statusColor} ${textColor}`;
                } else if (tableType === "userAddOns") {
                  const { status } = row.original as {
                    status: UserAddOnStatus;
                  };
                  const statusColor = registrationStatusBgColorMap[status];
                  const textColor = registrationStatusColorMap[status];
                  bgStatusClass = `${statusColor} ${textColor}`;
                }

                return (
                  <TableRow
                    key={row.id}
                    onClick={row.getToggleSelectedHandler()}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "bg-white/50 data-[state=selected]:bg-salPink/30",
                      tableType &&
                        selectableTableTypes.includes(tableType) &&
                        "hover:cursor-pointer hover:bg-salYellow/10",

                      bgStatusClass,
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                        }}
                        // width={cell.column.columnDef.size ?? undefined}
                        key={cell.id}
                        className={cn(
                          "px-3",
                          cell.column.getIndex() > 1
                            ? "border-l border-border"
                            : undefined,
                          tableType &&
                            !selectableTableTypes.includes(tableType) &&
                            !numberedTableTypes.includes(tableType) &&
                            cell.column.getIndex() >= 1 &&
                            "border-l border-border",
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
