"use client";

import { Button } from "@/components/ui/button";
import { LucideLayoutDashboard } from "lucide-react";

const AnalyticsPage = () => {
  return (
    <div
      className="scrollable relative bg-[#f3f4f0]"
      style={{ height: "calc(100dvh - 100px)" }}
    >
      <Button
        variant="salWithShadowHidden"
        className="absolute right-8 top-6 z-10 flex items-center gap-1"
        onClick={() =>
          window.open("https://eu.posthog.com/project/59928", "_blank")
        }
      >
        <LucideLayoutDashboard className="size-4" /> PostHog Dashboard
      </Button>

      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        src="https://eu.posthog.com/embedded/QJtpgS7V02f2NdbP3vTqo9qy1tX_zA"
        // style={{ height: "4000px" }}
        className="h-[4000px] xl:h-[2000px]"
      ></iframe>
    </div>
  );
};

export default AnalyticsPage;
