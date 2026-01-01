"use client";

import { select_continents } from "@/constants/locationConsts";

import type { EventCategory } from "@/types/eventTypes";
import type { Continents } from "@/types/thelist";
import { EventType } from "@/types/eventTypes";

import { useState } from "react";

import { Funnel, FunnelX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [edition, setEdition] = useState<number | null>(null);
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [eventType, setEventType] = useState<EventType[] | null>(null);
  const [continent, setContinent] = useState<Continents | null>(null);
  const [expanded, setExpanded] = useState(false);
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

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8">
      <h1 className="sr-only font-tanker text-3xl lowercase tracking-wide xl:text-[5rem]">
        World Map
      </h1>

      <LazyMap
        points={filteredMapData ?? []}
        className={cn(
          "z-0 mx-auto h-[calc(100dvh-120px)] w-full overflow-hidden rounded border-1.5 border-foreground/50",
        )}
        locationType={continent ? "country" : "full"}
        fullScreen={fullScreen}
        setFullScreenAction={setFullScreen}
        mapType="full"
        toolbarContent={
          <>
            <div className="flex w-full gap-2">
              <div className={cn("relative w-full")}>
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <X
                  className={cn(
                    "absolute right-2 top-2.5 text-foreground/50 hover:scale-105 hover:cursor-pointer hover:text-red-600 active:scale-95",
                    !search && "invisible",
                  )}
                  onClick={() => setSearch("")}
                />
              </div>
              <Button
                variant="outline"
                className="h-11 border border-foreground/30 bg-card hover:bg-salYellowLt/50 active:bg-salYellowDark/50 sm:h-11"
                aria-label="open filters"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? (
                  <FunnelX className="size-4" />
                ) : (
                  <Funnel className="size-4" />
                )}
              </Button>
            </div>
            {expanded && (
              <div className="flex flex-col gap-y-2">
                <p className="w-full py-1 text-center text-sm">
                  Total Results: {numResults}
                </p>
                <Separator className="mb-4" thickness={2} />
                <div className="scrollable justy mini flex max-h-[min(400px,50dvh)] flex-col gap-y-2 px-4">
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
                      onChangeAction={(value) =>
                        setContinent(value as Continents)
                      }
                      placeholder="--Select Continent--"
                      hasReset
                    />
                  </section>
                </div>
                <Separator className="my-2" thickness={2} />
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
                    for taking the time to gather all of the sticker and
                    paste-up events
                  </p>
                </Card>
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
