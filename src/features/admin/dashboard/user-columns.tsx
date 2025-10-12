//TODO: Add ability for me (or other admins) to bookmark users. Also to flag or ban users.
"use client";

import { DeleteUser } from "@/components/data-table/actions/data-table-admin-user-actions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ConvexDashboardLink } from "@/features/events/ui/convex-dashboard-link";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { LucideClipboardCopy, MoreHorizontal, User } from "lucide-react";
import { BsRobot } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa6";
import { Id } from "~/convex/_generated/dataModel";

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
  cancelReason?: string;
  canceledAt?: number;
  lastActive?: number;
  accountType: string[];
  createdAt: number;
  role: string[];
  source?: string;
  organizationNames: string[];
}

export const userColumns: ColumnDef<UserColumnsProps>[] = [
  {
    id: "select",
    size: 30,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
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
  },
  {
    accessorKey: "email",
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
  },
  {
    accessorKey: "subscription",
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
  },
  {
    accessorKey: "subStatus",
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
  },

  {
    accessorKey: "cancelReason",
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
    accessorKey: "cancelComment",
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
  },
  {
    accessorKey: "location",
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
  },
  {
    accessorKey: "website",
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
  },

  {
    accessorKey: "accountType",
    minSize: 120,
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
      const accountType = row.getValue("accountType") as string[];
      return (
        <div className="capitalize">
          {accountType && accountType.length > 0
            ? accountType.map((type) => type.split("|")[0]).join(", ")
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "organizationNames",
    minSize: 120,
    maxSize: 400,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization Names" />
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
    minSize: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    //TODO: Add function to change roles (dropdown)
    cell: ({ row }) => {
      const role = row.getValue("role") as string | undefined;
      return (
        <div className="text-center capitalize">
          {role?.includes("admin")
            ? "Admin"
            : role?.includes("user")
              ? "User"
              : "-"}
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
          {value ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "source",
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
