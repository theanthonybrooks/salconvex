import { cn } from "@/lib/utils";
import React from "react";

interface FlairBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const FlairBadge = ({ children, className }: FlairBadgeProps) => {
  return (
    <div
      className={cn(
        "mx-auto inline-flex w-fit items-center gap-1 rounded-full bg-foreground/[5%] px-[8px] py-1 text-[10px] leading-4 text-foreground/70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
};
