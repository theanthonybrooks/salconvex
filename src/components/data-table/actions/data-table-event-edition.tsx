"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event } from "@/features/events/components/events-data-table/columns";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

interface DataTableEventEditionProps {
  event: Event;
  dashboard?: boolean;
}

export const DataTableEventEdition = ({
  event,
  dashboard,
}: DataTableEventEditionProps) => {
  const updateEdition = useMutation(api.events.event.updateEdition);
  const [pendingEdition, setPendingEdition] = useState<number | null>(null);

  const currentEdition = event.dates.edition;
  const eventId = event._id;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const handleChange = async (newValue: string) => {
    const newEdition = parseInt(newValue, 10);
    if (newEdition === currentEdition) return;
    try {
      setPendingEdition(newEdition);
      await updateEdition({ eventId, edition: newEdition });
      toast.success("Event edition updated successfully!", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data ?? "Failed to update edition");
      } else {
        toast.error("Unexpected error updating edition.");
      }
    } finally {
      setPendingEdition(null);
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {dashboard ? (
        <Select
          onValueChange={handleChange}
          value={String(currentEdition)}
          disabled={pendingEdition !== null}
        >
          <SelectTrigger className="h-8 w-[80px]">
            {pendingEdition !== null ? (
              <span className="flex w-full items-center justify-center">
                <LoaderCircle className="ml-1 size-4 animate-spin text-muted-foreground" />
              </span>
            ) : (
              <SelectValue placeholder={String(currentEdition)} />
            )}
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="max-w-[60px] truncate font-medium">
          {currentEdition}
        </span>
      )}
    </div>
  );
};
