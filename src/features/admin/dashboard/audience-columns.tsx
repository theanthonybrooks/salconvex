"use client";

import {
  NewsletterFrequency,
  NewsletterType,
} from "@/constants/newsletterConsts";

import type { FunctionReturnType } from "convex/server";

import { ColumnDef } from "@tanstack/react-table";

import { FaEnvelope } from "react-icons/fa6";
import {
  BadgeIcon,
  CheckCircle2,
  CircleDashed,
  LucideClipboardCopy,
  MoreHorizontal,
  TestTube,
  Verified,
  X,
} from "lucide-react";

import type { api } from "~/convex/_generated/api";
import {
  DeleteNewsletterSubscription,
  MakeSubscriberTester,
} from "@/components/data-table/actions/DataTableAdminUserActions";
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
import { cn } from "@/helpers/utilsFns";

export const audienceColumnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  active: "Active",
  type: "Type",
  frequency: "Frequency",
  userPlan: "Plan",
  userType: "User Type",
  timesAttempted: "Attempts",
  lastAttempt: "Last Attempt",
  createdAt: "Created",
};

type NewsletterSubscribers = FunctionReturnType<
  typeof api.newsletter.subscriber.getNewsletterSubscribers
>;

type NewsletterSubscriber =
  NonNullable<NewsletterSubscribers>["subscribers"][number];

export const audienceColumns: ColumnDef<NewsletterSubscriber>[] = [
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
    accessorKey: "name",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="truncate font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    minSize: 150,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="truncate text-sm text-muted-foreground">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "active",
    id: "active",
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const { active: status } = row.original;
      return (
        <div className="flex justify-center">
          {status === "active" ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : status === "pending" ? (
            <CircleDashed className="size-4" />
          ) : (
            <X className="size-4 text-red-500" />
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(value);
    },
  },
  {
    accessorKey: "verified",
    id: "verified",
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ver." />
    ),
    cell: ({ row }) => {
      const { verified } = row.original;
      return (
        <div className="flex justify-center">
          {verified ? (
            <Verified className="size-4 text-emerald-600" />
          ) : (
            <BadgeIcon className="size-4 text-red-500" />
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
    accessorKey: "type",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const types = row.getValue("type") as NewsletterType[] | undefined;
      return (
        <div className="truncate text-center text-sm capitalize text-muted-foreground">
          {types?.join(", ")}
        </div>
      );
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
      const frequency = row.getValue("frequency") as
        | NewsletterFrequency
        | undefined;
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
      const plan = row.getValue("userPlan") as number | undefined;
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
    accessorKey: "userType",
    id: "userType",
    minSize: 100,
    maxSize: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Type" />
    ),
    cell: ({ row }) => {
      const { userType, tester } = row.original;

      return (
        <div className="flex items-center gap-1 truncate text-center text-sm capitalize text-muted-foreground">
          {userType}
          {tester ? <TestTube className="size-3" /> : null}
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as number | undefined;
      return (
        <span className="text-sm">
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
    id: "actions",

    maxSize: 40,
    minSize: 40,
    enableResizing: false,
    cell: ({ row }) => {
      const { _id: id, email, tester } = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;

      return (
        <div className={cn("flex justify-center")}>
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
                <DeleteNewsletterSubscription subscriberId={id} />
                <DropdownMenuItem>
                  <Link
                    href={`mailto:${email}`}
                    target="_blank"
                    className="flex items-center gap-x-2"
                  >
                    <FaEnvelope className="size-4" /> Contact
                  </Link>
                </DropdownMenuItem>
                <MakeSubscriberTester subscriberId={id} tester={tester} />
                <DropdownMenuItem>
                  <CopyableItem
                    copyContent={id}
                    defaultIcon={<LucideClipboardCopy className="size-4" />}
                  >
                    Subscription ID
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
