"use client";

import type { PublicEventPreviewData } from "@/types/eventTypes";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import {
  RecapCover,
  RecapEndCover,
  RecapLastPage,
} from "@/features/events/ui/thisweek-recap/recap-cover";
import RecapPost from "@/features/events/ui/thisweek-recap/recap-post";

export interface RecapData {
  events: PublicEventPreviewData[];
  displayRange: string;
  source: "thisweek" | "nextweek";
  fontSize: number | null;
}

export default function RecapRenderPage() {
  if (typeof window === "undefined") {
    const { searchParams } = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "");
    const token = searchParams.get("token");
    if (token !== "render-token") {
      notFound();
    }
  }
  const [data, setData] = useState<RecapData | null>(null);

  useEffect(() => {
    const checkData = () => {
      const recapData = (window as unknown as { __RECAP_DATA__?: RecapData })
        .__RECAP_DATA__;
      if (recapData && !data) {
        setData(recapData);
      }
    };

    checkData();

    const interval = setInterval(checkData, 300);
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, [data]);

  if (!data) return <p id="recap-loading">Loading recap...</p>;

  const { events, displayRange, fontSize } = data;

  return (
    <div className="flex flex-col gap-6 bg-white p-6 text-black">
      <RecapCover
        id="recap-cover"
        dateRange={displayRange}
        fontSize={fontSize}
      />
      {events.map((event, i) => (
        <RecapPost
          key={event._id || i}
          id={`recap-post-${i + 1}`}
          event={event}
          index={i}
        />
      ))}
      <RecapLastPage id="recap-last-page" openCallCount={events.length} />
      <RecapEndCover id="recap-end-cover" />
    </div>
  );
}
