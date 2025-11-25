//TODO: Add ability for me (or other admins) to bookmark users. Also to flag or ban users.
"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ArrowRight, LucideClipboardCopy, MoreHorizontal } from "lucide-react";

import type { PostStatusType } from "~/convex/schema";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { ConfirmingDropdown } from "@/components/ui/confirmation-dialog-context";
import { CopyableItem } from "@/components/ui/copyable-item";
import { Link } from "@/components/ui/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipSimple } from "@/components/ui/tooltip";
import {
  AdminSocialNotes,
  AdminSocialTimePicker,
  AdminSocialUpdate,
} from "@/features/admin/dashboard/components/admin-social-actions";
import { cn } from "@/helpers/utilsFns";

import { Id } from "~/convex/_generated/dataModel";

export const socialsColumnLabels: Record<string, string> = {
  name: "Name",
  deadline: "Deadline",
  postDate: "Post Date",
  plannedDate: "Planned",
  posted: "Status",
};

export interface SocialColumnProps {
  id: Id<"events">;
  name: string;
  slug: string;
  edition: number;
  deadline: string | null;
  postDate?: number;
  plannedDate?: number;
  posted?: PostStatusType;
  notes?: string;
}

export const socialColumns: ColumnDef<SocialColumnProps>[] = [
  {
    accessorKey: "rowNumber",
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    size: 40,
    cell: ({ row }) => {
      return (
        <div className="text-center text-sm text-muted-foreground">
          {row.index + 1}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      void columnId;
      return rowA.index - rowB.index;
    },
    enableHiding: false,
  },
  {
    accessorKey: "name",
    id: "name",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { name, slug, edition } = row.original;
      return (
        <TooltipSimple content="View Open Call" side="top">
          <Link
            href={`/thelist/event/${slug}/${edition}/call/social`}
            target="_blank"
            className="truncate text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {name}
          </Link>
        </TooltipSimple>
      );
    },
  },
  {
    accessorKey: "deadline",
    id: "deadline",
    minSize: 120,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const { deadline } = row.original;
      const value = deadline ? new Date(deadline).getTime() : null;
      return (
        <>
          <p className="text-center text-sm lg:hidden">
            {value
              ? new Date(value).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })
              : "-"}
          </p>
          <p className="hidden text-center text-sm lg:block">
            {value
              ? new Date(value).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "-"}
          </p>
        </>
      );
    },
  },
  {
    accessorKey: "posted",
    id: "posted",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { posted, id: eventId } = row.original;
      return <AdminSocialUpdate eventId={eventId} status={posted} />;
    },
  },
  {
    accessorKey: "plannedDate",
    id: "plannedDate",
    minSize: 150,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Planned Date" />
    ),
    cell: ({ row }) => {
      const { plannedDate: value, id: eventId } = row.original;
      return <AdminSocialTimePicker eventId={eventId} plannedDate={value} />;
    },
  },
  {
    accessorKey: "postDate",
    id: "postDate",
    minSize: 120,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Post Date" />
    ),
    cell: ({ row }) => {
      const { postDate: value } = row.original;

      return (
        <>
          <p className="text-center text-sm lg:hidden">
            {value
              ? new Date(value).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })
              : "-"}
          </p>
          <p className="hidden text-center text-sm lg:block">
            {value
              ? new Date(value).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "-"}
          </p>
        </>
      );
    },
  },

  {
    accessorKey: "notes",
    id: "notes",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const { notes, id: eventId } = row.original;
      return <AdminSocialNotes eventId={eventId} notes={notes} />;
    },
  },

  {
    id: "actions",

    maxSize: 40,
    minSize: 40,
    enableResizing: false,
    cell: ({ row }) => {
      const { id, slug, edition } = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;

      // console.log(table.options)

      return (
        <div
          className={cn("flex justify-center")}
          onClick={(e) => e.stopPropagation()}
        >
          <ConfirmingDropdown>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto size-8 max-h-8 min-w-8 border-foreground/30 p-0 hover:cursor-pointer hover:bg-white/70 active:scale-90"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="scrollable mini darkbar max-h-56"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>{" "}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={`/thelist/event/${slug}/${edition}/call/`}
                    target="_blank"
                    className="flex items-center gap-x-2"
                  >
                    <ArrowRight className="size-4" /> View OC
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyableItem
                    defaultIcon={<LucideClipboardCopy className="size-4" />}
                    copyContent={id}
                  >
                    Event ID
                  </CopyableItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
