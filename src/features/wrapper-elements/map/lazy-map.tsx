"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/helpers/utilsFns";

function FallbackSkeleton() {
  const pathname = usePathname();
  const mapPage = pathname.includes("/map");
  return (
    <Skeleton
      className={cn(
        "relative min-h-[200px] w-full rounded-xl bg-black/20 sm:min-h-[400px]",
        mapPage && "h-[calc(95dvh-100px)]",
      )}
    >
      <p className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center text-[1.5rem] font-black leading-8 text-white md:text-[4rem] md:leading-[5.5rem]">
        Loading Map...
      </p>
    </Skeleton>
  );
}

export const LazyMap = dynamic(() => import("../../events/event-leaflet"), {
  ssr: false,
  loading: () => <FallbackSkeleton />,
});
