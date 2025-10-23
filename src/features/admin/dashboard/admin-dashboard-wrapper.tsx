"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import ThisweekRecapPost from "@/features/events/thisweek-recap-post";

export function AdminDashboardWrapper({}) {
  // const [existingEvent, setExistingEvent] = useState<Doc<"events"> | null>(
  //   null,
  // );
  // const [existingOpenCall, setExistingOpenCall] =
  //   useState<Doc<"openCalls"> | null>(null);

  const [source, setSource] = useState<"thisweek" | "nextweek">("thisweek");

  const thisWeekPage = source === "thisweek";

  return (
    <>
      <Button
        variant="salWithShadowHiddenBg"
        onClick={() => setSource("thisweek")}
        disabled={source === "thisweek"}
      >
        This Week
      </Button>
      <Button
        variant="salWithShadowHiddenBg"
        onClick={() => setSource("nextweek")}
        disabled={source === "nextweek"}
      >
        Next Week
      </Button>

      <ThisweekRecapPost source={thisWeekPage ? "thisweek" : "nextweek"} />
    </>
  );
}
