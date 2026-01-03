import { type ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/helpers/utilsFns";

type EventDesktopSummaryCardProps = {
  children: ReactNode;
};

export const EventDesktopSummaryCard = ({
  children,
}: EventDesktopSummaryCardProps) => {
  return (
    <Card
      className={cn(
        "dark:bg-tab-a10 row-start-2 hidden w-full max-w-[350px] grid-cols-[75px_minmax(0,1fr)] gap-x-3 self-start rounded-3xl border-foreground/20 bg-white/50 p-3 pt-5 first:mt-6 xl:sticky xl:top-24 xl:grid",
      )}
    >
      {children}
    </Card>
  );
};
