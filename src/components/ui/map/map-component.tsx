// TODO: remove the redirect from the layout.tsx file once the map is actually functional

"use client";

import { select_continents } from "@/constants/locationConsts";

import type { EventCategory } from "@/types/eventTypes";
import type { Continents } from "@/types/thelist";
import { EventType } from "@/types/eventTypes";

import { useEffect, useState } from "react";

import { Plus, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { getYearOptions, getYearOptionsFromArray } from "@/helpers/dateFns";
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
  const [edition, setEdition] = useState<number | null>(null);
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [eventType, setEventType] = useState<EventType[] | null>(null);
  const [continent, setContinent] = useState<Continents | null>(null);
  const thisYear = new Date().getFullYear();
  void setCategory;
  void setEventType;

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: mapData } = useQueryWithStatus(
    api.map.worldMap.getWorldMapData,
    {
      filters: {
        edition: edition ?? undefined,
        category: category ?? undefined,
        type: eventType ?? undefined,
        continent: continent ?? undefined,
      },
    },
  );
  const { data: availableEditions } = useQueryWithStatus(
    api.map.worldMap.getAvailableEditions,
    {},
  );

  const yearOptions = availableEditions
    ? getYearOptionsFromArray(availableEditions)
    : getYearOptions(thisYear - 2, thisYear);

  const searchTerm = search.trim().toLowerCase();

  let filteredMapData = mapData;

  if (searchTerm && mapData) {
    filteredMapData = mapData?.filter((event) =>
      event.label.toLowerCase().includes(searchTerm),
    );
  }
  const numResults = filteredMapData?.length ?? 0;
  const disabledClass = "pointer-events-none opacity-30";

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8">
      <h1 className="sr-only font-tanker text-3xl lowercase tracking-wide xl:text-[5rem]">
        World Map
      </h1>

      <div
        className={cn(
          "flex h-dvh w-full grid-cols-[20%_minmax(0,1fr)] flex-col overflow-hidden rounded border-1.5 xl:grid",
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
            <p className="w-full pb-3 text-center text-sm">
              Total Results: {numResults}
            </p>

            {/* <p className="px-3 pb-2 text-xl font-bold">Filters</p> */}
            <Separator className="mb-4" thickness={2} />
            <div className="flex flex-col gap-y-2 px-4">
              <section className="flex flex-col gap-1 py-1">
                <Label className="text-sm" htmlFor="edition">
                  Edition
                </Label>
                <SelectSimple
                  options={yearOptions}
                  value={edition ? String(edition) : ""}
                  onChangeAction={(value) => setEdition(Number(value))}
                  placeholder="--Select Edition--"
                  hasReset
                />
              </section>
              <section className="flex flex-col gap-1 py-1">
                <Label className="text-sm" htmlFor="continent">
                  Continent
                </Label>
                <SelectSimple
                  options={select_continents}
                  value={continent ?? ""}
                  onChangeAction={(value) => setContinent(value as Continents)}
                  placeholder="--Select Continent--"
                  hasReset
                />
              </section>
              <div className={cn(disabledClass, "flex flex-col gap-y-2")}>
                <section className="flex items-center justify-between">
                  <p className="text-sm">Category</p>{" "}
                  <Plus className="size-4" />
                </section>
                <section className="flex items-center justify-between">
                  <p className="text-sm">Event Type</p>{" "}
                  <Plus className="size-4" />
                </section>
                {/* <section className="flex items-center justify-between">
                  <p className="text-sm">Country</p> <Plus className="size-4" />
                </section> */}

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
          <Card className="rounded-lg border-foreground/20 bg-card/50 p-4 text-sm">
            <p className="inline">
              Shoutout to{" "}
              <a href="https://instagram.com/creagiovane" target="_blank">
                @creagiovane
              </a>{" "}
              and his{" "}
              <a
                href="https://instagram.com/sticker_pasteup_fest_world_map"
                target="_blank"
              >
                map
              </a>{" "}
              for taking the time to gather all of the sticker and paste-up
              events
            </p>
          </Card>
        </div>

        <section className="w-full">
          <LazyMap
            points={filteredMapData ?? []}
            className={cn(
              "z-0 mx-auto h-dvh w-full overflow-hidden border-l-1.5",
            )}
            locationType="full"
            fullScreen={fullScreen}
            setFullScreenAction={setFullScreen}
            mapType="full"
          />
        </section>
      </div>
    </div>
  );
}
