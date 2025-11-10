import type { AdminActions } from "@/components/data-table/data-table";
import type { PageTypes, TableTypes } from "@/types/tanstack-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { cn } from "@/helpers/utilsFns";

// import { ReactNode } from "react";

// type DataTableWrapperProps = {
//   title: string;
//   description?: string;
//   children: ReactNode;
//   mobileChildren: ReactNode;
// };

// export const DataTableWrapper = ({
//   children,
//   mobileChildren,
//   title,
//   description,
// }: DataTableWrapperProps) => {
//   return (
//     <>
//       <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
//         <h3 className="mb-3 text-xl">{title}</h3>
//         {description && (
//           <p className="text-sm text-muted-foreground">{description}</p>
//         )}
//         {children}
//       </div>
//       <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
//         <h3 className="mb-3 text-xl">{title}</h3>
//         {description && (
//           <p className="text-sm text-muted-foreground">{description}</p>
//         )}
//         {mobileChildren}
//       </div>
//     </>
//   );
// };

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
  defaultSort?: MaybeResponsive<{ id: string; desc: boolean }>;

  /** Default filters (usually shared) */
  defaultFilters?: MaybeResponsive<{ id: string; value: string[] }[]>;
  tableType: TableTypes;
  pageType: PageTypes;
  pageSize?: MaybeResponsive<number>;
  /** Optional admin actions or custom elements */
  adminActions?: AdminActions;
  /** Optional wrapper classes */
  className?: string;
  mobileClassName?: string;
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
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
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
        />
      </div>

      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-7 lg:hidden",
          mobileClassName,
        )}
      >
        {title && <h3 className="text-xl">{title}</h3>}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
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
          className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
        />
      </div>
    </>
  );
}
