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
import { RowData } from "@tanstack/react-table";

export const tableTypes = [
  "events",
  "socials",
  "orgEvents",
  "organizations",
  "organizationStaff",
  "applications",
  "openCalls",
  "users",
  "bookmarks",
  "hidden",
  "newsletter",
  "artists",
  "resources",
  "support",
  "userAddOns",
  "sac",
] as const;

export const pageTypes = ["form", "dashboard"] as const;
export type PageTypes = (typeof pageTypes)[number];

export type TableTypes = (typeof tableTypes)[number];

export type AdminActionType = {
  isAdmin: boolean | undefined;
  isEditor: boolean | undefined;
};

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    isAdmin: boolean | undefined;
    isEditor?: boolean;

    tableType?: TableTypes;
    pageType?: PageTypes;
    getRowData?: (row: TData) => void;

    isMobile?: boolean;
    minimalView?: boolean;
    collapsedSidebar?: boolean;
  }
}
