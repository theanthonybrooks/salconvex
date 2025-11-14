"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Table } from "@tanstack/react-table";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { newsletterColumnLabels } from "@/features/admin/dashboard/newsletter-columns";
import { resourcesColumnLabels } from "@/features/admin/dashboard/resources-column";
import { userColumnLabels } from "@/features/admin/dashboard/user-columns";
import { userAddOnColumnLabels } from "@/features/admin/dashboard/userAddon-columns";
import { applicationColumnLabels } from "@/features/artists/applications/components/events-data-table/application-columns";
import { bookmarkColumnLabels } from "@/features/artists/dashboard/data-tables/bookmark-columns";
import { hiddenColumnLabels } from "@/features/artists/dashboard/data-tables/hidden-columns";
import { columnLabels } from "@/features/events/components/events-data-table/event-columns";
import { orgEventColumnLabels } from "@/features/organizers/dashboard/data-tables/organizer-columns";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

const labelMaps: Record<string, Record<string, string>> = {
  bookmarks: bookmarkColumnLabels,
  applications: applicationColumnLabels,
  hidden: hiddenColumnLabels,
  events: columnLabels,
  orgEvents: orgEventColumnLabels,
  users: userColumnLabels,
  newsletter: newsletterColumnLabels,
  userAddOns: userAddOnColumnLabels,
  resources: resourcesColumnLabels,
};

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const tableType = table.options.meta?.tableType as
    | keyof typeof labelMaps
    | undefined;
  const labels = tableType ? labelMaps[tableType] : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-10 gap-1 lg:flex"
        >
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="scrollable mini darkbar flex max-h-[50dvh] flex-col gap-y-0.5">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide(),
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {labels?.[column.id] ?? column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
