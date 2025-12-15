"use client";

import type { FunctionReturnType } from "convex/server";

import { ColumnDef } from "@tanstack/react-table";
import { capitalize } from "lodash";

import { FaEnvelope } from "react-icons/fa";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  TestTube,
  X,
} from "lucide-react";

import type { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { ConfirmingDropdown } from "@/components/ui/confirmation-dialog-context";
import { Link } from "@/components/ui/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PopoverSimple } from "@/components/ui/popover";
import { TooltipSimple } from "@/components/ui/tooltip";
import {
  CampaignSendNowBtn,
  CampaignStatusSelector,
} from "@/features/admin/dashboard/components/admin-newsletter-actions";
import { cn } from "@/helpers/utilsFns";

export const campaignColumnLabels: Record<string, string> = {
  id: "Campaign ID",
  userPlan: "Plan",
  isTest: "Test",
  sendTime: "Planned Date",
  _creationTime: "Created",
};

type Campaigns = FunctionReturnType<
  typeof api.newsletter.campaign.getCampaigns
>;

export type Campaign = NonNullable<Campaigns>[number];

//   type Campaign = {
// [x]    title: string;
// [-]    slug: string;
// [x]    status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
// [2]    sendTime: number | undefined;
// [x]    type: "openCall" | "general";
// [x]    frequency: "monthly" | "all" | "weekly";
// [x]    userPlan: 0 | 1 | 2 | 3;
// [x]    isTest: boolean;
// []    emailContent: string | undefined;
// []    sendTime: number;
// []    startedSendTime: number | undefined;
// []    finishedSendTime: number | undefined;
// [x]    audienceStatus: "pending" | "inProgress" | "complete" | "failed";
// [x]    audienceCount: number | undefined;
// [x]    audienceError: string | undefined;
// []    createdBy: Id<"users">;
// }

export const campaignColumns: ColumnDef<Campaign>[] = [
  {
    id: "expand",
    size: 20,
    cell: ({ row }) => {
      const Icon = row.getIsExpanded() ? ChevronDown : ChevronRight;
      return <Icon className="size-6" />;
    },
  },
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
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      void columnId;
      return rowA.index - rowB.index;
    },
    enableHiding: false,
  },
  {
    accessorKey: "title",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const { title, publicTitle } = row.original;
      return (
        <TooltipSimple content={`Public Title: ${publicTitle}`}>
          <span className="truncate font-medium">{title}</span>
        </TooltipSimple>
      );
    },
  },
  {
    accessorKey: "status",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { status, _id } = row.original;

      return <CampaignStatusSelector campaignId={_id} status={status} />;
    },
  },
  {
    accessorKey: "audienceStatus",
    id: "audienceStatus",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Audience Status" />
    ),
    cell: ({ row }) => {
      const { audienceStatus, audienceError } = row.original;
      const formattedError = audienceError ? `Error: ${audienceError}` : "";
      const audienceStatusClass: Record<
        Doc<"newsletterCampaign">["audienceStatus"],
        string
      > = {
        pending: "text-yellow-800 border-yellow-600 bg-yellow-50",
        inProgress: "text-blue-800 border-blue-600 bg-blue-50",
        complete: "text-green-800 border-green-600 bg-green-100",
        failed: "text-red-800 border-red-600 bg-red-100",
      };
      return (
        <div
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <PopoverSimple
            clickOnly
            content={formattedError}
            disabled={!audienceError || audienceStatus !== "failed"}
          >
            <div
              className={cn(
                "flex h-9 w-30 items-center justify-center gap-1 rounded border px-3",
                audienceStatusClass[audienceStatus],
              )}
            >
              {audienceStatus === "complete" ? (
                <CheckIcon className="size-4" />
              ) : audienceStatus === "failed" ? (
                <X className="size-4" />
              ) : null}
              {capitalize(audienceStatus)}
            </div>
          </PopoverSimple>
        </div>
      );
    },
  },
  {
    accessorKey: "audienceCount",
    id: "audienceCount",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Audience Count" />
    ),
    cell: ({ row }) => {
      const { audienceCount } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize">
          {audienceCount}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    id: "type",
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const { type } = row.original;
      return <div className="flex justify-center">{capitalize(type)}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "isTest",
    id: "isTest",
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Test" />
    ),
    cell: ({ row }) => {
      const { isTest } = row.original;
      return (
        <div className="flex justify-center">
          {isTest ? (
            <TestTube className="size-4 text-emerald-600" />
          ) : (
            <X className="size-4 text-red-500" />
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
  },
  {
    accessorKey: "frequency",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Frequency" />
    ),
    cell: ({ row }) => {
      const { frequency } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize text-muted-foreground">
          {frequency}
        </div>
      );
    },
  },

  {
    accessorKey: "userPlan",
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    accessorFn: (row) => String(row.userPlan),
    cell: ({ row }) => {
      const { userPlan: plan } = row.original;
      return (
        <div
          className={cn(
            "rounded px-2 py-1 text-xs font-medium",
            plan === 1 && "bg-green-100 text-green-800",
            plan === 2 && "bg-gray-100 text-gray-800",
            plan === 3 && "bg-indigo-100 text-indigo-800",
            !plan && "italic text-muted-foreground",
          )}
        >
          <p className="text-center capitalize"> {plan || "none"}</p>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },

  {
    accessorKey: "_creationTime",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const { _creationTime: value } = row.original;
      return (
        <span className="block text-center text-sm">
          {value
            ? new Date(value).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              })
            : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "id",
    id: "id",
    accessorFn: (row) => row._id,
    enableSorting: false,
    enableHiding: true,

    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    size: 100,
    cell: ({ row }) => {
      const { _id: campaignId } = row.original;
      return (
        <div className="text-center text-sm text-muted-foreground">
          {campaignId}
        </div>
      );
    },
  },
  {
    accessorKey: "createdBy",
    id: "createdBy",
    minSize: 120,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const { createdBy } = row.original;
      return (
        <div className="truncate text-center text-sm capitalize">
          {createdBy}
        </div>
      );
    },
  },

  {
    id: "actions",

    maxSize: 60,
    minSize: 60,
    enableResizing: false,
    cell: ({ row }) => {
      const { _id: id, status } = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;

      return (
        <div
          className={cn("flex justify-center gap-x-2")}
          onClick={(e) => e.stopPropagation()}
        >
          <CampaignSendNowBtn campaignId={id} status={status} />
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
                {/* {isAdmin && <DataTableAdminActions eventId={event._id} />} */}
                <DropdownMenuLabel>Actions</DropdownMenuLabel>{" "}
                <DropdownMenuSeparator />
                {/* <DuplicateEvent eventId={event._id} /> */}
                <DropdownMenuItem>
                  <Link
                    href={`mailto:`}
                    target="_blank"
                    className="flex items-center gap-x-2"
                  >
                    <FaEnvelope className="size-4" /> Send
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
export const campaignSubColumns: ColumnDef<Campaign>[] = [
  {
    id: "__spacer__",
    minSize: 50,
    maxSize: 50,
    size: 50,
    enableResizing: false,
    header: () => null,
    cell: () => null,
  },

  {
    accessorKey: "plannedSendTime",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Planned Time" />
    ),
    cell: ({ row }) => {
      const { plannedSendTime: value } = row.original;
      const now = Date.now();
      const isPast = value && now > value;
      return (
        <div
          className={cn("text-center text-sm", isPast && "italic text-red-600")}
        >
          {value
            ? new Date(value).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              })
            : "-"}
          {isPast && " (past)"}
        </div>
      );
    },
  },
  {
    accessorKey: "finishedSendTime",
    id: "finishedSendTime",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Finished Time" />
    ),
    cell: ({ row }) => {
      const { finishedSendTime: value } = row.original;
      return (
        <div className={cn("text-center text-sm")}>
          {value
            ? new Date(value).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              })
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "startedSendTime",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started Time" />
    ),
    cell: ({ row }) => {
      const { startedSendTime: value } = row.original;
      return (
        <div className={cn("text-center text-sm")}>
          {value
            ? new Date(value).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              })
            : "-"}
        </div>
      );
    },
  },
];
