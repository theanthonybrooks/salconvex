"use client";

import type { Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

interface DataTableSubrowProps<TData> {
  row: Row<TData>;
  children?: ReactNode;
}

export function DataTableSubrow<TData>({
  row,
  children,
}: DataTableSubrowProps<TData>) {
  // // const isMobile = useIsMobile(768);

  // // const isAdmin = table.options.meta?.isAdmin;
  // const tableType = table.options.meta?.tableType;
  // // const pageType = table.options.meta?.pageType;
  // if (!tableType) return null;

  // const typedResult = asRow(row.original, tableType);
  // const { _id } = typedResult;

  return (
    <tr>
      {/* 2nd row is a custom 1 cell row */}
      <td colSpan={row.getVisibleCells().length}>{children}</td>
    </tr>
  );
}
