"use client";

import { useState } from "react";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopoverSimple } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: { dataItems: unknown[] } }
  | { status: "error"; message: string };

export default function SACAdminPage() {
  //   const { preloadedUserData } = useConvexPreload();
  //   const userData = usePreloadedQuery(preloadedUserData);
  //   const { user } = userData || {};
  const [state, setState] = useState<State>({ status: "idle" });
  const [pending, setPending] = useState(false);
  const hasResults =
    state.status === "success" && state.data.dataItems?.length > 0;

  const handleFetchData = async () => {
    setState({ status: "loading" });

    try {
      setPending(true);
      const res = await fetch("/api/cron/sac-fetch", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();

      setState({ status: "success", data });
      console.log("results", data.dataItems?.length, data);
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
    <div className="px-10 pt-10">
      <div className="flex flex-col items-end gap-3 rounded-lg border-1.5 border-dashed border-foreground/30 bg-background/50 p-3 md:flex-row">
        <section className="flex w-full flex-col gap-2 md:w-auto">
          <h3>Admin Functions:</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="salWithShadowHidden"
              onClick={handleFetchData}
              disabled={state.status === "loading"}
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
        </section>
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
                {/* <ol className="ml-1 list-outside list-decimal text-sm">
                      {audience.map((a) => (
                        <li key={a._id}>
                          <p className="truncate">{a.email}</p>
                        </li>
                      ))}
                    </ol> */}
                <span className="mb-3 w-full text-center text-sm sm:w-auto">
                  {state.data.dataItems?.length} items found
                </span>
              </div>
            }
          >
            <span className="mb-3 w-full text-center text-sm sm:w-auto">
              {state.data.dataItems?.length} items found
            </span>
          </PopoverSimple>
        )}
        {state.status === "error" && (
          <span className="text-red-600">{state.message}</span>
        )}
      </div>
    </div>
  );
}
