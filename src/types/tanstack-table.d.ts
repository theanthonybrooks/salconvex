// import { RowData } from "@tanstack/react-table";

// declare module "@tanstack/react-table" {
//   interface TableMeta<TData extends RowData> {
//     updateData?: (rowIndex: number, columnId: string, value: string) => void;
//     toggleAllBoolean?: (columnId: string, value: boolean) => void;
//     changeAllOptions?: (columnId: string, value: string | number) => void;
//     getIsAllTrue?: (columnId: string) => boolean;
//     getIsSomeTrue?: (columnId: string) => boolean;
//   }
// }
import { ToolbarData } from "@/components/data-table/data-table";
import { RowData } from "@tanstack/react-table";
export const tableTypes = [
  "events",
  "orgEvents",
  "organizations",
  "applications",
  "openCalls",
  "users",
  "bookmarks",
  "hidden",
] as const;

export const pageTypes = ["form", "dashboard"] as const;
export type PageTypes = (typeof pageTypes)[number];

export type TableTypes = (typeof tableTypes)[number];

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    isAdmin: boolean | undefined;
    viewAll: boolean | undefined;
    setViewAll: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    tableType: TableTypes | undefined;
    pageType?: PageTypes;
    getRowData?: (row: TData) => void;
    minimalView?: boolean;
    toolbarData?: ToolbarData;
  }
}
