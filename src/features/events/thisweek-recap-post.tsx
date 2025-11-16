import { SortOptions } from "@/types/thelist";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";
import { formatInTimeZone } from "date-fns-tz";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

import {
  ArrowLeft,
  ArrowRight,
  Clipboard,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  RecapCover,
  RecapEndCover,
  RecapLastPage,
} from "@/features/events/ui/thisweek-recap/recap-cover";
import RecapPost from "@/features/events/ui/thisweek-recap/recap-post";
import { formatCondensedDateRange } from "@/helpers/dateFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";

interface ThisweekRecapPostProps {
  source: "thisweek" | "nextweek";
}

const ThisweekRecapPost = ({ source }: ThisweekRecapPostProps) => {
  const router = useRouter();
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  const [captionText, setCaptionText] = useState("");
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  const [altText, setAltText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [altCharCount, setAltCharCount] = useState(0);
  const [dateFontSize, setDateFontSize] = useState<number | null>(null);

  const sortOptions = useMemo<SortOptions>(
    () => ({
      sortBy: "openCall",
      sortDirection: "asc",
    }),
    [],
  );

  const queryResult = useFilteredEventsQuery(
    {
      showHidden: true,
      bookmarkedOnly: false,
      limit: 20,
      eventTypes: [],
      eventCategories: [],
    },
    sortOptions,
    { page: 1 },
    source,
  );

  const now = useMemo(() => new Date(), []);

  const activeResults = useMemo(() => {
    return (
      queryResult?.results
        ?.filter((event) => {
          const dueDate = event.tabs?.openCall?.basicInfo?.dates?.ocEnd;
          if (!dueDate) return false;
          return new Date(dueDate) >= now;
        })
        .sort((a, b) => {
          const aDate = new Date(
            a.tabs?.openCall?.basicInfo?.dates?.ocEnd ?? 0,
          ).getTime();
          const bDate = new Date(
            b.tabs?.openCall?.basicInfo?.dates?.ocEnd ?? 0,
          ).getTime();
          return aDate - bDate;
        }) ?? []
    );
  }, [queryResult?.results, now]);

  const filteredResults = useMemo(() => {
    return activeResults.filter((event) => !excludedIds.includes(event._id));
  }, [activeResults, excludedIds]);

  const { data: totalOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getTotalNumberOfOpenCalls,
  );

  const openCallsThisWeek = queryResult?.results.length ?? 0;
  const pastOpenCalls = openCallsThisWeek - activeResults.length;
  const activeOpenCalls = totalOpenCallsData?.activeOpenCalls ?? 0;

  const otherOpenCallCount =
    activeOpenCalls - openCallsThisWeek + excludedIds.length + pastOpenCalls;

  const displayRange =
    queryResult?.weekStartISO && queryResult?.weekEndISO
      ? formatCondensedDateRange(
          queryResult.weekStartISO,
          queryResult.weekEndISO,
        )
      : "";

  const handleDownloadAll = async () => {
    try {
      await toast.promise(
        (async () => {
          const res = await fetch("/api/recap-screenshot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              events: filteredResults,
              otherCount: otherOpenCallCount,
              fontSize: dateFontSize,
              displayRange,
              source,
              excludedIds,
            }),
          });

          if (!res.ok) throw new Error("Failed to generate screenshots");

          const blob = await res.blob();
          saveAs(blob, `${displayRange}-recap.zip`);
        })(),
        {
          pending: "Creating recap post...",
          success: "Recap created successfully!",
          error: "Failed to create post.",
        },
        {
          autoClose: 2000,
          pauseOnHover: false,
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  // const handleDownloadSingle = async (index: number) => {
  //   const node = refs.current[index];
  //   if (!node) return;
  //   await waitForImagesToLoad([node]);
  //   try {
  //     const dataUrl = await toJpeg(node, { quality: 0.95 });
  //     saveAs(dataUrl, `${displayRange}-recap-${index + 1}.jpg`);
  //   } catch (err) {
  //     console.error(`Error rendering node ${index}`, err);
  //   }
  // };

  const handleCopyText = () => {
    navigator.clipboard.writeText(captionText).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const handleCopyAlt = () => {
    navigator.clipboard.writeText(altText).then(() => {
      setCopiedAlt(true);
      setTimeout(() => setCopiedAlt(false), 2000);
    });
  };

  useEffect(() => {
    // if (!filteredResults?.length) return;

    const grouped: Record<string, { events: string[]; timeZone: string }> = {};

    for (const event of filteredResults) {
      const name = event.name;
      const dueDate = event.tabs?.openCall?.basicInfo.dates?.ocEnd ?? "";
      const timeZone =
        event?.tabs?.openCall?.basicInfo?.dates?.timezone ?? "Europe/Berlin";
      const dateKey = formatInTimeZone(dueDate, timeZone, "yyyy-MM-dd");

      const instagram = event.links?.instagram;
      const igHandle = instagram
        ? instagram
            .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
            .replace(/\/$/, "")
        : "";
      const organization = igHandle ? `| ${igHandle}` : "";

      if (!grouped[dateKey]) {
        grouped[dateKey] = { events: [], timeZone };
      }
      grouped[dateKey].events.push(`${name} ${organization}`.trim());
    }

    const sortedDates = Object.keys(grouped).sort();

    let content = `A quick rundown of what I've found that's ending in the next 7 days. The links for everything are on The Street Art List website (link in bio).\n\n`;
    content += `DM or email at hey@thestreetartlist.com with any feedback or things that you think would be useful to include. Also, use the submission form on the site for any open calls that I haven't included!\n\n`;
    content += `P.S. - Any questions related to the events should be asked to the organizers directly. I'm not organizing anything unless I say otherwise, so I'm unfortunately not able to answer any questions beyond the info provided on the site.\n\n`;

    let counter = 1;
    for (const date of sortedDates) {
      const { events, timeZone } = grouped[date];

      const formattedDate = formatInTimeZone(date, timeZone, "MMMM d");

      content += `${formattedDate}:\n`;
      for (const item of events) {
        content += `${counter}. ${item}\n`;
        counter++;
      }
      content += "\n";
    }

    content += `Access to all of the open calls, the ability to bookmark, hide, and track applications starts at $3/month. The coding of the site, searching, reading through, addition of open calls, and these IG posts are all done by me @anthonybrooksart.\n\n`;

    content += `#opencall #muralfest #publicartopencall #muralfestival #graffitijam #graffiti #streetartfestival #muralproject #callforartist #streetartopencall #urbanart #arteurbana #muralproject #eoi #callforartist #rfq #rfp #artistopencall\n`;
    content += `#artistopportunities #artistopportunity #streetartopencall #streetartcalls`;

    setCaptionText(content);
    setCharCount(content.length);
  }, [filteredResults]);

  useEffect(() => {
    // if (!filteredResults?.length) return;

    const altText = `Weekly post for ${displayRange}. The links are on The Street Art List website (thestreetartlist.com)`;

    setAltText(altText);
    setAltCharCount(altText.length);
  }, [filteredResults, displayRange]);

  return (
    <>
      <div className="mt-10 flex items-center gap-2">
        <Button
          onClick={() => router.push("/admin/thisweek")}
          variant="salWithShadowHiddenBg"
          disabled={source === "thisweek"}
        >
          {source === "nextweek" && <ArrowLeft className="size-4" />} This Week
        </Button>
        <p>or</p>
        <Button
          onClick={() => router.push("/admin/nextweek")}
          variant="salWithShadowHiddenBg"
          disabled={source === "nextweek"}
        >
          Next Week {source === "thisweek" && <ArrowRight className="size-4" />}
        </Button>
      </div>

      <div className="scrollable mini flex w-full max-w-[90vw] flex-col-reverse gap-6 p-6 sm:grid sm:grid-cols-2">
        <div className="mx-auto flex w-fit flex-col gap-y-6">
          <div className="group relative">
            <RecapCover
              id="recap-cover"
              dateRange={displayRange}
              fontSize={dateFontSize}
              ref={(el) => {
                refs.current[0] = el;
              }}
            />
            {/* <button
              type="button"
              className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
              onClick={() => handleDownloadSingle(0)}
              title="Download image"
            >
              <ImageIcon className="size-5" />
            </button> */}
            <div className="absolute left-2 top-2 z-10 hidden w-fit items-center gap-2 rounded bg-card/80 p-1 group-hover:flex">
              <input
                type="number"
                min={1}
                step={0.1}
                value={dateFontSize ?? 2.5}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) {
                    setDateFontSize(null);
                  } else {
                    setDateFontSize(value);
                  }
                }}
                className="w-14 text-center"
              />
              {dateFontSize !== null && (
                <button
                  type="button"
                  className="p-1"
                  onClick={() => setDateFontSize(null)}
                  title="Reset font size"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          </div>

          {activeResults?.map((event, index) => {
            const visibleIndex = excludedIds.includes(event._id)
              ? null
              : activeResults
                  .slice(0, index)
                  .filter((e) => !excludedIds.includes(e._id)).length;
            return (
              <div
                className={cn(
                  "group relative",
                  excludedIds.includes(event._id) && "opacity-50 grayscale",
                )}
                key={event._id}
              >
                <RecapPost
                  id={`recap-post-${index + 1}`}
                  ref={(el) => {
                    refs.current[index + 1] = el;
                  }}
                  event={event}
                  index={visibleIndex}
                />
                {/* <button
                  type="button"
                  className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
                  onClick={() => handleDownloadSingle(index + 1)}
                  title="Download image"
                >
                  <ImageIcon className="size-5" />
                </button> */}
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
                  title={
                    excludedIds.includes(event._id)
                      ? "Add to list"
                      : "Remove from list"
                  }
                  onClick={() =>
                    setExcludedIds((prev) =>
                      prev.includes(event._id)
                        ? prev.filter((id) => id !== event._id)
                        : [...prev, event._id],
                    )
                  }
                >
                  {excludedIds.includes(event._id) ? (
                    <EyeOff className="size-5 shrink-0" />
                  ) : (
                    <Eye className="size-5 shrink-0" />
                  )}
                </button>
              </div>
            );
          })}
          {filteredResults && (
            <div className="group relative">
              <RecapLastPage
                id="recap-last-page"
                openCallCount={otherOpenCallCount}
                ref={(el) => {
                  refs.current[filteredResults.length + 1] = el;
                }}
              />
              {/* <button
                type="button"
                className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
                onClick={() => handleDownloadSingle(filteredResults.length + 1)}
                title="Download image"
              >
                <ImageIcon className="size-5" />
              </button> */}
            </div>
          )}
          {filteredResults && (
            <div className="group relative">
              <RecapEndCover
                id="recap-end-cover"
                ref={(el) => {
                  refs.current[filteredResults.length + 2] = el;
                }}
              />
              {/* <button
                type="button"
                className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
                onClick={() => handleDownloadSingle(filteredResults.length + 2)}
                title="Download image"
              >
                <ImageIcon className="size-5" />
              </button> */}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-6 sm:px-4 xl:px-0">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button
              variant="salWithShadowHiddenBg"
              onClick={handleDownloadAll}
              className="flex w-full flex-1 items-center gap-1"
            >
              Download <ImageIcon className="size-4" />
            </Button>
            <Button
              variant="salWithShadowHiddenBg"
              onClick={handleCopyText}
              className="flex w-full flex-1 items-center gap-1"
            >
              {copiedText ? "Copied!" : "Copy Text"}{" "}
              <Clipboard className="size-4" />
            </Button>
            <Button
              variant="salWithShadowHiddenBg"
              onClick={handleCopyAlt}
              className="flex w-full flex-1 items-center gap-1"
            >
              {copiedAlt ? "Copied!" : "Copy Alt"}
              <Clipboard className="size-4" />
            </Button>
          </div>
          <Textarea
            value={captionText}
            onChange={(e) => {
              setCaptionText(e.target.value);
              setCharCount(e.target.value.length);
            }}
            rows={28}
            className="mx-auto max-w-[90vw] whitespace-pre-wrap bg-card font-mono"
          />
          <p className="text-right text-sm text-foreground/60">
            {charCount}/3000 characters
          </p>

          <Textarea
            value={altText}
            onChange={(e) => {
              setAltText(e.target.value);
              setAltCharCount(e.target.value.length);
            }}
            rows={5}
            className="mx-auto max-w-[90vw] whitespace-pre-wrap bg-card font-mono"
          />
          <p className="text-right text-sm text-foreground/60">
            {altCharCount}/100 characters
          </p>
        </div>
      </div>
    </>
  );
};

export default ThisweekRecapPost;
