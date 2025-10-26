// TODO: remove the redirect from the layout.tsx file once the map is actually functional

"use client";

import { useEffect, useState } from "react";

import { Plus, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";

export default function WorldMapComponent() {
  const [fullScreen, setFullScreen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    sessionStorage.setItem("previousSalPage", "/map");
  }, []);

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: mapData, isPending } = useQueryWithStatus(
    api.map.worldMap.getWorldMapData,
    { filters: {} },
  );

  const searchTerm = search.trim().toLowerCase();

  let filteredMapData = mapData;

  if (searchTerm && mapData) {
    filteredMapData = mapData?.filter((event) =>
      event.label.toLowerCase().includes(searchTerm),
    );
  }

  return (
    <div className="mt-8 flex h-full w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <h1 className="font-tanker text-3xl lowercase tracking-wide xl:text-[5rem]">
        World Map
      </h1>

      <div
        className={cn(
          "flex w-full grid-cols-[20%_minmax(0,1fr)] flex-col overflow-hidden rounded border-1.5 xl:grid",
          fullScreen && "!flex h-dvh max-w-[95dvw] items-center justify-center",
        )}
      >
        <div className="flex w-full flex-col justify-between gap-y-4 bg-card/70 p-3">
          <div>
            <div className={cn("relative w-full")}>
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 mt-2"
              />

              <X
                className={cn(
                  "absolute right-2 top-2.5 text-foreground/50 hover:scale-105 hover:cursor-pointer hover:text-red-600 active:scale-95",
                  !search && "invisible",
                )}
                onClick={() => setSearch("")}
              />
            </div>

            {/* <p className="px-3 pb-2 text-xl font-bold">Filters</p> */}
            <Separator className="mb-4" thickness={2} />
            <div className="pointer-events-none flex flex-col gap-y-2 px-4 opacity-30">
              <section className="flex items-center justify-between">
                <p className="text-sm">Category</p> <Plus className="size-4" />
              </section>
              <div className="flex flex-col gap-y-2">
                <section className="flex items-center justify-between">
                  <p className="text-sm">Event Type</p>{" "}
                  <Plus className="size-4" />
                </section>
                <section className="flex items-center justify-between">
                  <p className="text-sm">Country</p> <Plus className="size-4" />
                </section>
                <section className="flex items-center justify-between">
                  <p className="text-sm">Continent</p>{" "}
                  <Plus className="size-4" />
                </section>
                <Separator className="mb-4" thickness={2} />
                <section className="flex items-center gap-2">
                  <Checkbox id="active" className="text-sm" checked={true} />
                  <Label htmlFor="active" className="">
                    Show All (Including Archived)
                  </Label>
                </section>
              </div>
            </div>
            <p className="my-2 text-center text-lg font-bold text-foreground">
              Coming soon!
            </p>
          </div>
          <p className="text-sm">
            Shoutout to @creagiovane and his @sticker_pasteup_fest_world_map for
            taking the time to gather all of the sticker and paste-up events
          </p>
        </div>

        <section className="w-full">
          {isPending ? (
            <div>Loading...</div>
          ) : (
            <LazyMap
              points={filteredMapData ?? []}
              label={"test"}
              className={cn(
                "z-0 mx-auto h-[calc(95dvh-100px)] w-full max-w-[90dvw] overflow-hidden border-l-1.5",
                fullScreen && "h-dvh",
              )}
              locationType="full"
              fullScreen={fullScreen}
              setFullScreen={setFullScreen}
              mapType="full"
            />
          )}
        </section>
      </div>
    </div>
  );
}
