"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";

import { useQuery } from "convex-helpers/react/cache";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { api } from "~/convex/_generated/api";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isAdmin = useQuery(api.users.isAdmin);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    try {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
      });
      if (isAdmin) {
        posthog.opt_out_capturing();
        posthog.stopSessionRecording();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("ERR_BLOCKED_BY_CLIENT")) {
          console.warn("PostHog request blocked by client.");
        } else {
          console.error("PostHog error:", error);
        }
      } else {
        console.error("PostHog error:", error);
      }
    }
  }, [isAdmin]);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
