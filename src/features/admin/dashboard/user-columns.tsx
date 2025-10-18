//TODO: Add ability for me (or other admins) to bookmark users. Also to flag or ban users.
"use client";

import { DeleteUser } from "@/components/data-table/actions/data-table-admin-user-actions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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
  ChangeUserAccountType,
  ChangeUserRole,
} from "@/features/admin/dashboard/components/admin-user-actions";
import { ConvexDashboardLink } from "@/features/events/ui/convex-dashboard-link";
import { getFeedbackLabel } from "@/helpers/subscriptionFns";
import { cn } from "@/helpers/utilsFns";
import { ColumnDef } from "@tanstack/react-table";
import { LucideClipboardCopy, MoreHorizontal, User } from "lucide-react";
import { BsRobot } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa6";
import { Id } from "~/convex/_generated/dataModel";
import { AccountType, UserRole } from "~/convex/schema";

export const userColumnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  location: "Location",
  instagram: "Instagram",
  website: "Website",
  canFeature: "Can Feature",
  subscription: "Subscription",
  subStatus: "Sub Status",
  cancelComment: "Cancel Comment",
  cancelFeedback: "Cancel Feedback",
  cancelReason: "Cancel Reason",
  canceledAt: "Canceled At",
  lastActive: "Last Active",
  accountType: "Account Type",
  createdAt: "Created",
  role: "Role",
  source: "Source",
  organizationNames: "Organizations",
};

interface UserColumnsProps {
  _id: Id<"users">;
  artistId?: Id<"artists">;
  customerId?: string;
  name: string;
  email: string;
  location: string[];
  instagram?: string;
  website?: string;
  canFeature: boolean;
  subscription: string;
  subStatus: string;
  cancelComment?: string;
  cancelFeedback?: string;
  cancelReason?: string;
  canceledAt?: number;
  lastActive?: number;
  accountType: AccountType;
  createdAt: number;
  role: UserRole;
  source?: string;
  organizationNames: string[];
}

export const userColumns: ColumnDef<UserColumnsProps>[] = [
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
    // enableSorting: false,
    sortingFn: (rowA, rowB, columnId) => {
      void columnId;
      return rowA.index - rowB.index;
    },
    enableHiding: false,
    enableResizing: false,
    enableMultiSort: true,
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
      const { _id: userId, name } = row.original;
      return (
        <ConvexDashboardLink
          className="font-medium"
          table="userSubscriptions"
          id={userId}
        >
          <p className="truncate">{name}</p>
        </ConvexDashboardLink>
      );
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "email",
    id: "email",
    minSize: 150,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <CopyableItem className="text-sm text-muted-foreground" truncate>
        {row.getValue("email")}
      </CopyableItem>
    ),
    enableMultiSort: true,
  },
  {
    accessorKey: "subscription",
    id: "subscription",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subscription" />
    ),
    cell: ({ row }) => {
      const { subscription } = row.original;
      const fatcapSubs = ["3a. monthly-fatcap", "3b. yearly-fatcap"];
      const originalSubs = ["1a. monthly-original", "1b. yearly-original"];
      const bananaSubs = ["2a. monthly-banana", "2b. yearly-banana"];
      return (
        <div
          className={cn(
            "rounded px-2 py-1 text-xs font-medium",
            fatcapSubs.includes(subscription ?? "") &&
              "border border-green-500 bg-green-100 text-green-800",
            originalSubs.includes(subscription ?? "") &&
              "border border-gray-500 bg-gray-100 text-gray-800",
            bananaSubs.includes(subscription ?? "") &&
              "border border-orange-500 bg-orange-100 text-orange-800",

            !subscription && "italic text-muted-foreground",
          )}
        >
          <p className="text-center capitalize"> {subscription || "none"}</p>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "subStatus",
    id: "subStatus",
    minSize: 100,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { subStatus, cancelReason } = row.original;
      const systemCancel = cancelReason === "payment_failed";

      return (
        <div
          className={cn(
            "rounded px-2 py-1 text-xs font-medium",
            subStatus === "active" &&
              "border border-green-400 bg-green-100 text-green-800",
            subStatus === "trialing" &&
              "border border-yellow-400 bg-yellow-100 text-yellow-800",
            subStatus === "canceled" &&
              "border border-red-400 bg-red-100 text-red-800",
            !subStatus && "italic text-muted-foreground",
          )}
        >
          <p className="flex items-center justify-center gap-1 text-center capitalize">
            {subStatus || "none"}
            {cancelReason ? (
              systemCancel ? (
                <BsRobot className="size-3" />
              ) : (
                <User className="size-3" />
              )
            ) : null}
          </p>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      return filterValue.includes(row.getValue(columnId));
    },
    enableMultiSort: true,
  },

  {
    accessorKey: "cancelReason",
    id: "cancelReason",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cancel Reason" />
    ),
    cell: ({ row }) => {
      const { cancelReason } = row.original;
      return (
        <TooltipSimple content={cancelReason}>
          <div
            className={cn(
              "truncate text-sm text-muted-foreground",
              !cancelReason && "text-center",
            )}
          >
            {cancelReason || "-"}
          </div>
        </TooltipSimple>
      );
    },
  },
  {
    accessorKey: "cancelFeedback",
    id: "cancelFeedback",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cancel Feedback" />
    ),
    cell: ({ row }) => {
      const { cancelFeedback } = row.original;
      return (
        <TooltipSimple content={getFeedbackLabel(cancelFeedback)}>
          <div
            className={cn(
              "truncate text-sm text-muted-foreground",
              !cancelFeedback && "text-center",
            )}
          >
            {getFeedbackLabel(cancelFeedback) || "-"}
          </div>
        </TooltipSimple>
      );
    },
  },
  {
    accessorKey: "cancelComment",
    id: "cancelComment",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cancel Comment" />
    ),
    cell: ({ row }) => {
      const { cancelComment } = row.original;
      return (
        <TooltipSimple content={cancelComment}>
          <div
            className={cn(
              "truncate text-sm text-muted-foreground",
              !cancelComment && "text-center",
            )}
          >
            {cancelComment || "-"}
          </div>
        </TooltipSimple>
      );
    },
  },
  {
    accessorKey: "canceledAt",
    id: "canceledAt",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Canceled At" />
    ),
    cell: ({ row }) => {
      const { canceledAt } = row.original;
      return (
        <div
          className={cn(
            "truncate text-sm text-muted-foreground",
            !canceledAt && "text-center",
          )}
        >
          {canceledAt ? new Date(canceledAt).toLocaleString() : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastActive",
    id: "lastActive",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Active" />
    ),
    cell: ({ row }) => {
      const { lastActive } = row.original;
      return (
        <div
          className={cn(
            "truncate text-sm text-muted-foreground",
            !lastActive && "text-center",
          )}
        >
          {lastActive ? new Date(lastActive).toLocaleString() : "-"}
        </div>
      );
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "location",
    id: "location",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const { location } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {location?.length > 0 ? (
            <TooltipSimple content={location.join(", ")}>
              <p>{location?.length > 0 ? location.join(", ") : "-"}</p>
            </TooltipSimple>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "instagram",
    id: "instagram",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instagram" />
    ),
    cell: ({ row }) => {
      const { instagram } = row.original;
      const username = instagram?.startsWith("@")
        ? instagram?.slice(1)
        : instagram;

      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {instagram ? (
            <Link
              href={`https://www.instagram.com/${username}`}
              target="_blank"
            >
              {instagram}
            </Link>
          ) : (
            "-"
          )}
        </div>
      );
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "website",
    id: "website",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => {
      const { website } = row.original;
      const displayLink = website?.startsWith("http")
        ? website.slice(website.indexOf("//") + 2)
        : website;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {website ? (
            <Link href={website} target="_blank">
              {displayLink}
            </Link>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "canFeature",
    id: "canFeature",
    minSize: 40,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Can Feature" />
    ),
    cell: ({ row }) => {
      const { canFeature, artistId } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {artistId ? (canFeature ? "Yes" : "No") : "-"}
        </div>
      );
    },
    enableMultiSort: true,
  },

  {
    accessorKey: "accountType",
    id: "accountType",
    minSize: 180,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Type" />
    ),
    filterFn: (row, columnId, filterValue) => {
      const types = row.getValue(columnId) as string[];
      if (!Array.isArray(filterValue)) return true;
      if (filterValue.includes("both")) {
        // Only include rows where BOTH "artist" AND "organizer" are present
        return types.includes("artist") && types.includes("organizer");
      }
      // Otherwise, include if any filterValue matches any type
      return filterValue.some((f) => types.includes(f));
    },
    getUniqueValues: (row) => {
      const value = row.accountType;
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return [value];
      return [];
    },
    cell: ({ row }) => {
      const { accountType, _id: userId } = row.original;
      return (
        <ChangeUserAccountType userId={userId} accountType={accountType} />
      );
    },
  },
  {
    accessorKey: "organizationNames",
    id: "organizationNames",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Org Names" />
    ),
    cell: ({ row }) => {
      const organizationNames = row.getValue("organizationNames") as string[];
      return (
        <div
          className={cn(
            "scrollable mini justy line-clamp-2 capitalize",
            !organizationNames?.length && "text-center",
          )}
        >
          {organizationNames && organizationNames.length > 0
            ? organizationNames.join(", ")
            : "-"}
        </div>
      );
    },
  },

  {
    accessorKey: "role",
    id: "role",
    minSize: 180,
    maxSize: 250,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    //TODO: Add function to change roles (dropdown)
    cell: ({ row }) => {
      const { role, _id: userId } = row.original;

      return <ChangeUserRole userId={userId} role={role} />;
    },
  },
  {
    accessorKey: "createdAt",
    id: "createdAt",
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const { createdAt: value } = row.original;
      return (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "source",
    id: "source",
    minSize: 120,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("source") as string | undefined;
      return (
        <TooltipSimple content={value}>
          <p className={cn("truncate text-sm", !value && "text-center")}>
            {value ? value : "-"}
          </p>
        </TooltipSimple>
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
      const { artistId } = user;

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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>{" "}
                <DropdownMenuSeparator />
                <DeleteUser userId={user._id} />
                <DropdownMenuItem>
                  <Link
                    href={`mailto:${user.email}`}
                    target="_blank"
                    className="flex items-center gap-x-2"
                  >
                    <FaEnvelope className="size-4" /> Contact
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyableItem
                    defaultIcon={<LucideClipboardCopy className="size-4" />}
                    copyContent={user.email}
                    className="gap-x-2"
                  >
                    Copy Email
                  </CopyableItem>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyableItem
                    defaultIcon={<LucideClipboardCopy className="size-4" />}
                    copyContent={user._id}
                    className="gap-x-2"
                  >
                    User ID
                  </CopyableItem>
                </DropdownMenuItem>
                {artistId && (
                  <DropdownMenuItem>
                    <CopyableItem
                      defaultIcon={<LucideClipboardCopy className="size-4" />}
                      copyContent={artistId}
                      className="gap-x-2"
                    >
                      Artist ID
                    </CopyableItem>
                  </DropdownMenuItem>
                )}
                {user.customerId && (
                  <DropdownMenuItem>
                    <CopyableItem
                      defaultIcon={<LucideClipboardCopy className="size-4" />}
                      copyContent={user.customerId}
                      className="gap-x-2"
                    >
                      Stripe ID
                    </CopyableItem>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmingDropdown>
        </div>
      );
    },
  },
];
