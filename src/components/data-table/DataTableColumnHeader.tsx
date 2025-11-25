import { Column } from "@tanstack/react-table";

import {
  ArrowDown,
  ArrowDownNarrowWide,
  ArrowDownWideNarrow,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/helpers/utilsFns";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const baseClassName = "h-full px-3 ";

  if (!column.getCanSort()) {
    return <div className={cn(baseClassName, className)}>{title}</div>;
  }
  const descSortActive = column.getIsSorted() === "desc";
  const ascSortActive = column.getIsSorted() === "asc";
  const sortingActive = descSortActive || ascSortActive;
  return (
    <div
      className={cn(
        baseClassName,
        "flex items-center space-x-2 hover:bg-white/50",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="mx-auto w-full">
          <Button
            variant="link"
            size="sm"
            className="flex h-8 items-center gap-x-1 hover:cursor-pointer data-[state=open]:bg-white/50"
          >
            <span>{title}</span>
            {descSortActive ? (
              <ArrowDownNarrowWide className="size-4" />
            ) : ascSortActive ? (
              <ArrowDownWideNarrow className="size-4" />
            ) : (
              <ChevronsUpDown className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {!ascSortActive && (
            <DropdownMenuItem
              onClick={(e) => {
                const isMulti = e.ctrlKey || e.shiftKey;
                column.toggleSorting(false, isMulti);
              }}
              className="hover:cursor-pointer hover:bg-salPink/50 focus:bg-salPink/50"
            >
              <ArrowUp className="size-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
          )}
          {!descSortActive && (
            <DropdownMenuItem
              onClick={(e) => {
                const isMulti = e.ctrlKey || e.shiftKey;
                column.toggleSorting(true, isMulti);
              }}
              className="hover:cursor-pointer hover:bg-salPink/50 focus:bg-salPink/50"
            >
              <ArrowDown className="size-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
          )}
          {sortingActive && (
            <DropdownMenuItem
              onClick={() => column.clearSorting()}
              className="hover:cursor-pointer hover:bg-salPink/50 focus:bg-salPink/50"
            >
              <ChevronsUpDown className="size-3.5 text-muted-foreground/70" />
              Reset
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => column.toggleVisibility(false)}
            className="hover:cursor-pointer hover:bg-salPink/50 focus:bg-salPink/50"
          >
            <EyeOff className="size-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
