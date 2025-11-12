"use client";

import { dashboardNavItems } from "@/constants/links";

import { MergedEventPreviewData } from "@/types/eventTypes";
import { User } from "@/types/user";

import { Separator } from "@/components/ui/separator";
import { TheListFilters } from "@/features/thelist/components/filters/the-list-filters";

import { UserPrefsType } from "~/convex/schema";

interface Props {
  user: User | null;
  userPref: UserPrefsType | null;
  isMobile: boolean;
  results: MergedEventPreviewData[];
  isLoading: boolean;
}

export const EventFilters = ({ user, isMobile, results, isLoading }: Props) => {
  return (
    <div className="mx-auto mb-6 flex w-full max-w-[min(95vw,1280px)] flex-col items-center gap-4 px-6 sm:gap-6 sm:px-8">
      <Separator className="mx-auto" thickness={2} />

      <TheListFilters
        title={"Search"}
        source={dashboardNavItems}
        className="flex"
        // groupName={"Heading"}
        shortcut="k"
        placeholder="Search"
        user={user}
        // userPref={userPref}

        isMobile={isMobile}
        results={results}
        isLoading={isLoading}
      />

      <Separator className="mx-auto" thickness={2} />
    </div>
  );
};
