import type { AdminActions } from "@/components/data-table/DataTable";
import type { PageTypes, TableTypes } from "@/types/tanstack-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import { DataTable } from "@/components/data-table/DataTable";
import { cn } from "@/helpers/utilsFns";

type MaybeResponsive<T> =
  | T
  | {
      desktop?: T;
      mobile?: T;
    };

type ResponsiveDataTableProps<TData, TValue> = {
  title?: string;
  description?: string;
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  onRowSelect?: MaybeResponsive<(row: TData | null) => void>;

  /** Default column visibility — can differ between desktop and mobile */
  defaultVisibility?: MaybeResponsive<Record<string, boolean>>;

  /** Default sort — can differ between desktop and mobile */
  defaultSort?: MaybeResponsive<ColumnSort[]>;

  /** Default filters (usually shared) */
  defaultFilters?: MaybeResponsive<ColumnFiltersState>;
  tableType: TableTypes;
  pageType: PageTypes;
  pageSize?: MaybeResponsive<number>;
  /** Optional admin actions or custom elements */
  adminActions?: AdminActions;
  /** Optional wrapper classes */
  className?: string;
  mobileClassName?: string;
  extraToolbar?: ReactNode;
  renderSubrow?: (row: TData) => ReactNode;
  subColumns?: ColumnDef<TData, TValue>[];
  minimalView?: MaybeResponsive<boolean>;
  collapsedSidebar?: MaybeResponsive<boolean>;
};

export function ResponsiveDataTable<TData, TValue>({
  title,
  description,
  data,
  columns,
  onRowSelect,
  defaultVisibility,
  defaultFilters,
  defaultSort,
  tableType,
  pageType,
  pageSize = 10,
  adminActions,
  className,
  mobileClassName,
  extraToolbar,
  minimalView,
  collapsedSidebar,
  subColumns,
}: ResponsiveDataTableProps<TData, TValue>) {
  const resolve = <T,>(
    value: MaybeResponsive<T> | undefined,
    key: "desktop" | "mobile",
  ): T | undefined =>
    typeof value === "object" &&
    value !== null &&
    ("desktop" in value || "mobile" in value)
      ? value[key]
      : (value as T | undefined);
  return (
    <>
      <div
        className={cn(
          "hidden max-h-full w-full px-10 pb-10 pt-7 lg:block",
          className,
        )}
      >
        {title && <h3 className="mb-3 text-xl">{title}</h3>}
        {description && (
          <p
            className={cn(
              "mb-8 text-sm text-muted-foreground",
              extraToolbar && "mb-3",
            )}
          >
            {description}
          </p>
        )}
        {extraToolbar && <div className="mb-6">{extraToolbar}</div>}
        <DataTable
          columns={columns}
          data={data}
          defaultVisibility={resolve(defaultVisibility, "desktop")}
          defaultFilters={resolve(defaultFilters, "desktop")}
          defaultSort={resolve(defaultSort, "desktop")}
          onRowSelect={resolve(onRowSelect, "desktop")}
          adminActions={adminActions}
          tableType={tableType}
          pageType={pageType}
          pageSize={resolve(pageSize, "desktop")}
          minimalView={resolve(minimalView, "desktop")}
          collapsedSidebar={resolve(collapsedSidebar, "desktop")}
          subColumns={subColumns}
        />
      </div>

      <div
        className={cn(
          "mx-auto flex max-w-[90dvw] flex-col justify-center gap-4 py-7 lg:hidden",
          mobileClassName,
        )}
      >
        {title && <h3 className="text-xl">{title}</h3>}
        {description && (
          <p
            className={cn(
              "mb-6 text-sm text-muted-foreground",
              extraToolbar && "mb-3",
            )}
          >
            {description}
          </p>
        )}
        {extraToolbar}
        <DataTable
          columns={columns}
          data={data}
          defaultVisibility={resolve(defaultVisibility, "mobile")}
          defaultFilters={resolve(defaultFilters, "mobile")}
          defaultSort={resolve(defaultSort, "mobile")}
          onRowSelect={resolve(onRowSelect, "mobile")}
          adminActions={adminActions}
          tableType={tableType}
          pageType={pageType}
          pageSize={resolve(pageSize, "mobile")}
          minimalView={resolve(minimalView, "mobile")}
          collapsedSidebar={resolve(collapsedSidebar, "mobile")}
          subColumns={subColumns}
          className="w-full overflow-x-auto"
        />
      </div>
    </>
  );
}
