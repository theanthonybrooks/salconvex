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
  "organizations",
  "applications",
  "openCalls",
  "users",
] as const;

export type TableTypes = (typeof tableTypes)[number];

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    isAdmin: boolean | undefined;
    viewAll: boolean | undefined;
    setViewAll: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    tableType: TableTypes | undefined;
    getRowData?: (row: TData) => void;
  }
}
