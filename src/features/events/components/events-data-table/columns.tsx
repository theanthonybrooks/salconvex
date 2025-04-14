"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubmissionFormState } from "@/types/event";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Id } from "~/convex/_generated/dataModel";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Event = {
  _id: Id<"events">;
  name: string;
  dates: {
    edition: number;
  };
  state: SubmissionFormState;
  lastEditedAt?: number;
};

export const columns: ColumnDef<Event>[] = [
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
  {
    accessorKey: "dates.edition",

    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Edition
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "state",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          State
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const state = row.getValue("state") as SubmissionFormState;
      return (
        <div className="flex w-[100px] items-center gap-1">
          {state === "draft" ? (
            <Pencil className="size-4" />
          ) : state === "submitted" ? (
            <QuestionMarkCircledIcon className="size-4" />
          ) : state === "published" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <span className="capitalize">{state}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastEditedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Edited
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return new Date(value).toLocaleString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment._id)}
            >
              Copy Event ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
