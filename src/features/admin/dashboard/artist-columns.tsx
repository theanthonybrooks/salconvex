//TODO: Add ability for me (or other admins) to bookmark users. Also to flag or ban users.
"use client";

import type { FunctionReturnType } from "convex/server";

import { ColumnDef } from "@tanstack/react-table";

import { LucideClipboardCopy, MoreHorizontal } from "lucide-react";

import {
  ArtistAdminNotesInput,
  ArtistFeatureSelect,
} from "@/components/data-table/actions/DataTableAdminArtistActions";
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
import { ConvexDashboardLink } from "@/features/events/ui/convex-dashboard-link";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";

export const artistColumnLabels: Record<string, string> = {
  name: "Name",
  nationality: "Nationality",
  documents: "Documents",
  instagram: "Instagram",
  website: "Website",
  canFeature: "Can Feature",
  feature: "Feature",
  notes: "Notes",
  createdAt: "Created",
};
type ArtistResults = FunctionReturnType<
  typeof api.artists.artistQueries.getActiveArtists
>;
type ArtistResult = NonNullable<ArtistResults>[number];

export const artistColumns: ColumnDef<ArtistResult>[] = [
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
      const { artistId, name } = row.original;
      return (
        <ConvexDashboardLink
          className="font-medium"
          table="artists"
          id={artistId}
        >
          <p className="truncate">{name}</p>
        </ConvexDashboardLink>
      );
    },
  },

  {
    accessorKey: "nationality",
    id: "nationality",
    minSize: 120,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nationality" />
    ),
    cell: ({ row }) => {
      const { nationality } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {nationality?.length > 0 ? (
            <TooltipSimple content={nationality.join(", ")}>
              <p>{nationality?.length > 0 ? nationality.join(", ") : "-"}</p>
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
    accessorFn: (row) => {
      const value = row.instagram;
      return value ? true : false;
    },
    id: "instagram",
    minSize: 90,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instagram" />
    ),
    cell: ({ row }) => {
      const { instagram, feature } = row.original;
      const username = instagram?.startsWith("@")
        ? instagram?.slice(1)
        : instagram;

      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {instagram ? (
            <Link
              href={`https://www.instagram.com/${username}`}
              target="_blank"
              className={cn(feature === false && "line-through")}
            >
              {instagram}
            </Link>
          ) : (
            "-"
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const instagram = row.original?.instagram;
      const hasValue = !!instagram && instagram.trim() !== "";
      return filterValue.includes(String(hasValue));
    },
  },
  {
    accessorKey: "website",
    id: "website",
    minSize: 90,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => {
      const { website, feature } = row.original;
      const displayLink = website?.startsWith("http")
        ? website.slice(website.indexOf("//") + 2)
        : website;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {website ? (
            <Link
              href={website}
              target="_blank"
              className={cn(feature === false && "line-through")}
            >
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
    accessorFn: (row) => {
      const value = row.canFeature;
      if (typeof value === "boolean") return value;
      return "-";
    },
    id: "canFeature",
    minSize: 60,
    maxSize: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Can?" />
    ),
    cell: ({ row }) => {
      const { canFeature } = row.original;
      return (
        <div className="truncate text-center text-sm text-muted-foreground">
          {typeof canFeature === "boolean" ? (canFeature ? "Yes" : "No") : "-"}
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
    accessorKey: "feature",
    id: "feature",
    minSize: 80,
    maxSize: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feature" />
    ),
    cell: ({ row }) => {
      const { feature } = row.original;
      return (
        <ArtistFeatureSelect
          artistId={row.original.artistId}
          feature={feature}
          key={row.original.artistId}
        />
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      const value = row.getValue(columnId);
      return filterValue.includes(String(value));
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
      const { notes, artistId } = row.original;
      return <ArtistAdminNotesInput artist={artistId} notes={notes ?? ""} />;
    },
  },
  {
    accessorKey: "createdAt",
    id: "createdAt",
    minSize: 120,
    maxSize: 220,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const { createdAt: value } = row.original;
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
      const { artistId } = row.original;

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
                {/* <DropdownMenuItem>
                  <Link
                    href={`mailto:${user.email}`}
                    target="_blank"
                    className="flex items-center gap-x-2"
                  >
                    <FaEnvelope className="size-4" /> Contact
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem>
                  <CopyableItem
                    defaultIcon={<LucideClipboardCopy className="size-4" />}
                    copyContent={artistId}
                  >
                    User ID
                  </CopyableItem>
                </DropdownMenuItem>
                {artistId && (
                  <DropdownMenuItem>
                    <CopyableItem
                      defaultIcon={<LucideClipboardCopy className="size-4" />}
                      copyContent={artistId}
                    >
                      Artist ID
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
