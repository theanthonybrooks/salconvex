"use client";

import type { SacApiResponse } from "@/lib/jobs/syncSacData";

import { useState } from "react";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopoverSimple } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getTrailingS } from "@/helpers/stylingFns";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SacApiResponse }
  | { status: "error"; message: string };

export default function SACToolbar() {
  //   const { preloadedUserData } = useConvexPreload();
  //   const userData = usePreloadedQuery(preloadedUserData);
  //   const { user } = userData || {};
  let insertCount: number | undefined;
  let updateCount: number | undefined;
  let numResults: number | undefined;
  const [state, setState] = useState<State>({ status: "idle" });
  const [pending, setPending] = useState(false);
  const { status } = state;
  const hasResults = status === "success" && state.data.dataItems?.length > 0;

  if (status === "success") {
    insertCount = state.data.counts.insertCount;
    updateCount = state.data.counts.updateCount;
    numResults = state.data.dataItems?.length;
  }

  const handleFetchData = async () => {
    setState({ status: "loading" });

    try {
      setPending(true);
      const res = await fetch("/api/admin/sac-fetch", {
        method: "POST",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();

      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col items-end gap-3 rounded-lg border-1.5 border-dashed border-foreground/20 bg-card/70 p-3 md:flex-row">
        <div className="flex items-center gap-2">
          <Button
            variant="salWithShadowHidden"
            onClick={handleFetchData}
            disabled={status === "loading"}
            className="!sm:h-10 w-full md:w-40"
            type="button"
          >
            {hasResults ? (
              pending ? (
                "Loading..."
              ) : (
                "Load More Data"
              )
            ) : pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              "Load Current Data"
            )}
          </Button>
        </div>
        <Separator
          thickness={2}
          className="mx-2 hidden h-10 md:block"
          orientation="vertical"
        />

        {hasResults && (
          <PopoverSimple
            clickOnly
            content={
              <div className="scrollable mini darkbar max-h-30 px-3">
                <ol className="ml-1 list-outside list-decimal text-sm">
                  {/* {audience.map((a) => (
                        <li key={a._id}>
                          <p className="truncate">{a.email}</p>
                        </li>
                      ))} */}
                  <li>
                    <p className="truncate">
                      {insertCount} item
                      {getTrailingS(insertCount)} added
                    </p>
                  </li>
                  <li>
                    <p className="truncate">
                      {updateCount} item
                      {getTrailingS(updateCount)} updated
                    </p>
                  </li>
                </ol>
                {/* <span className="mb-3 w-full text-center text-sm sm:w-auto">
                  {state.data.dataItems?.length} items found
                </span> */}
              </div>
            }
          >
            <span className="mb-3 flex w-full items-center gap-1 text-center text-sm sm:w-auto">
              <p>
                {numResults} item{getTrailingS(numResults)} found,
              </p>
              <p>
                {insertCount} item
                {getTrailingS(insertCount)} added,
              </p>
              <p>
                {updateCount} item
                {getTrailingS(updateCount)} updated,
              </p>
            </span>
          </PopoverSimple>
        )}
        {status === "error" && (
          <span className="text-red-600">{state.message}</span>
        )}
      </div>
    </div>
  );
}
