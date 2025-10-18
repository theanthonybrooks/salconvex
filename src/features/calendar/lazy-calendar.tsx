"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Custom fallback skeleton
const CalendarSkeleton = (
  <div className="p-4">
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-36" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 pt-4">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-sm" />
        ))}
      </div>
    </div>
  </div>
);

// Lazy-load the calendar component
export const LazyCalendar = dynamic(() => import("./calendar-wrapper"), {
  ssr: false,
  loading: () => CalendarSkeleton,
});
