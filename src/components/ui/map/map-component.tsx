// TODO: remove the redirect from the layout.tsx file once the map is actually functional

"use client";

import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";

import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";

export default function WorldMapComponent() {
  useEffect(() => {
    sessionStorage.setItem("previousSalPage", "/map");
  }, []);

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: mapData, isPending } = useQueryWithStatus(
    api.map.worldMap.getWorldMapData,
    { filters: {} },
  );

  return (
    <div className="mt-8 flex h-full w-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-tanker text-3xl lowercase tracking-wide xl:text-[5rem]">
        World Map
      </h1>

      <div className="flex w-full max-w-[80dvw] grid-cols-[20%_minmax(0,1fr)] flex-col gap-x-10 gap-y-3 xl:grid">
        {/* <div className="col-span-1 h-max w-full self-start rounded-xl border-1.5 border-foreground/20 bg-white/50 py-3">
          <p className="px-3 pb-2 text-xl font-bold">Filters</p>
          <Separator className="mb-4" thickness={2} />
          <div className="flex flex-col gap-y-2 px-4">
            <section className="flex items-center justify-between">
              <p className="text-sm">Category</p> <Plus className="size-4" />
            </section>
            <div className="flex flex-col gap-y-2">
              <section className="flex items-center justify-between">
                <p className="text-sm">Event Type</p>{" "}
                <Plus className="size-4" />
              </section>
              <section className="flex items-center justify-between">
                <p className="text-sm">Category</p> <Plus className="size-4" />
              </section>
              <section className="flex items-center justify-between">
                <p className="text-sm">Active</p> <Plus className="size-4" />
              </section>
            </div>
          </div>
          <p className="my-2 text-center text-lg font-bold text-foreground">
            Coming soon!
          </p>
        </div> */}
        <section className="w-full">
          {isPending ? (
            <div>Loading...</div>
          ) : (
            <LazyMap
              points={mapData ?? []}
              label={"test"}
              className="z-0 mb-4 h-[calc(80dvh-100px)] w-full max-w-[90dvw] overflow-hidden rounded-xl"
            />
          )}
        </section>
      </div>
    </div>
  );
}
