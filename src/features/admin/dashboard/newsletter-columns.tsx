"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Id } from "~/convex/_generated/dataModel";
import {
  CheckCircle2,
  LucideClipboardCopy,
  MoreHorizontal,
  X,
} from "lucide-react";
import { FaEnvelope } from "react-icons/fa6";

import { DeleteNewsletterSubscription } from "@/components/data-table/actions/data-table-admin-user-actions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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
import { cn } from "@/helpers/utilsFns";
import {
  NewsletterFrequency,
  NewsletterType,
} from "@/constants/newsletterConsts";

export const newsletterColumnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  active: "Active",
  type: "Type",
  frequency: "Frequency",
  userPlan: "Plan",
  timesAttempted: "Attempts",
  lastAttempt: "Last Attempt",
  createdAt: "Created",
};

interface NewsletterColumnsProps {
  _id: Id<"newsletter">;
  name: string;
  email: string;
  active: boolean;
  type?: NewsletterType[];
  frequency?: NewsletterFrequency;
  userPlan?: number;
  timesAttempted: number;
  lastAttempt: number;
  createdAt: number;
}

export const newsletterColumns: ColumnDef<NewsletterColumnsProps>[] = [
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
    minSize: 60,
    maxSize: 90,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean | undefined;
      return (
        <div className="flex justify-center">
          {active ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <X className="size-4 text-red-500" />
          )}
        </div>
      );
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
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.getValue("userPlan") as number | undefined;
      // console.log(plan);
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
          <p className="capitalize"> {plan || "none"}</p>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
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
          {value ? new Date(value).toLocaleString() : "-"}
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
      const user = row.original;

      // const openCallState = event.openCallState;
      // const openCallId = event.openCallId;
      // console.log(table.options)

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
                <DeleteNewsletterSubscription userId={user._id} />
                <DropdownMenuItem>
                  <Link
                    href={`mailto:${user.email}`}
                    target="_blank"
                    className="flex items-center gap-x-2"
                  >
                    <FaEnvelope className="size-4" /> Contact
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user._id)}
                  className="flex items-center gap-x-2"
                >
                  <LucideClipboardCopy className="size-4" /> User ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
