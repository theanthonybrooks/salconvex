import {
  RecapCover,
  RecapEndCover,
} from "@/features/events/ui/thisweek-recap/recap-cover";
import RecapPost from "@/features/events/ui/thisweek-recap/recap-post";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";
import { formatCondensedDateRange } from "@/lib/dateFns";
import { SortOptions } from "@/types/thelist";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatInTimeZone } from "date-fns-tz";
import { saveAs } from "file-saver";
import { toJpeg } from "html-to-image";
import JSZip from "jszip";
import {
  ArrowLeft,
  ArrowRight,
  Clipboard,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ThisweekRecapPostProps {
  source: "thisweek" | "nextweek";
}

const ThisweekRecapPost = ({ source }: ThisweekRecapPostProps) => {
  const router = useRouter();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  const [captionText, setCaptionText] = useState("");
  const [altText, setAltText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [altCharCount, setAltCharCount] = useState(0);

  const sortOptions = useMemo<SortOptions>(
    () => ({
      sortBy: "openCall",
      sortDirection: "asc",
    }),
    [],
  );

  const queryResult = useFilteredEventsQuery(
    {
      showHidden: false,
      bookmarkedOnly: false,
      limit: 20,
      eventTypes: [],
      eventCategories: [],
    },
    sortOptions,
    { page: 1 },
    source,
  );

  const displayRange =
    queryResult?.weekStartISO && queryResult?.weekEndISO
      ? formatCondensedDateRange(
          queryResult.weekStartISO,
          queryResult.weekEndISO,
        )
      : "";
  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder(displayRange ?? "Recap Images");

    if (!folder) return;

    const nodes = refs.current.filter(Boolean); // clean nulls
    for (let i = 0; i < nodes.length; i++) {
      try {
        const dataUrl = await toJpeg(nodes[i]!, { quality: 0.95 });
        const base64 = dataUrl.split(",")[1]; // strip header
        folder.file(`${i + 1}.jpg`, base64, { base64: true });
      } catch (err) {
        console.error(`Error rendering node ${i}`, err);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${displayRange}-recap.zip`);
  };

  const handleDownloadSingle = async (index: number) => {
    const node = refs.current[index];
    if (!node) return;
    try {
      const dataUrl = await toJpeg(node, { quality: 0.95 });
      saveAs(dataUrl, `${displayRange}-recap-${index + 1}.jpg`);
    } catch (err) {
      console.error(`Error rendering node ${index}`, err);
    }
  };

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
    if (!queryResult?.results?.length) return;

    const grouped: Record<string, { events: string[]; timeZone: string }> = {};

    for (const event of queryResult.results) {
      const name = event.name;
      const dueDate = event.openCall?.basicInfo.dates?.ocEnd ?? "";
      const timeZone =
        event?.openCall?.basicInfo?.dates?.timezone ?? "Europe/Berlin";
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

    let content = `A quick rundown of what's ending in the next 7 days. The links for everything are on The Street Art List website (link in bio).\n\n`;
    content += `DM or email at hey@thestreetartlist.com with any feedback or things that you think would be useful to include. Also, use the submission form on the site for any open calls that I haven't included!\n\n`;
    content += `P.S. - Any questions related to the events should be asked to the organizers directly. I'm but a messenger and can't help if you ask.\n\n`;

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
  }, [queryResult]);

  useEffect(() => {
    if (!queryResult?.results?.length) return;

    const altText = `Weekly post for ${displayRange}. The links are on The Street Art List website (thestreetartlist.com)`;

    setAltText(altText);
    setAltCharCount(altText.length);
  }, [queryResult, displayRange]);

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

      <div className="scrollable mini flex w-full max-w-[90vw] flex-col-reverse gap-6 py-6 sm:grid sm:grid-cols-2">
        <div className="mx-auto flex w-fit flex-col gap-y-6">
          <div className="group relative">
            <RecapCover
              dateRange={displayRange}
              ref={(el) => {
                refs.current[0] = el;
              }}
            />
            <button
              type="button"
              className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
              onClick={() => handleDownloadSingle(0)}
              title="Download image"
            >
              <ImageIcon className="size-5" />
            </button>
          </div>

          {queryResult?.results
            ?.slice()
            .sort((a, b) => {
              const aDate = new Date(
                a.openCall?.basicInfo?.dates?.ocEnd ?? 0,
              ).getTime();
              const bDate = new Date(
                b.openCall?.basicInfo?.dates?.ocEnd ?? 0,
              ).getTime();
              return aDate - bDate;
            })
            .map((event, index) => (
              <div className="group relative" key={event._id}>
                <RecapPost
                  ref={(el) => {
                    refs.current[index + 1] = el;
                  }}
                  event={event}
                  index={index}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
                  onClick={() => handleDownloadSingle(index + 1)}
                  title="Download image"
                >
                  <ImageIcon className="size-5" />
                </button>
              </div>
            ))}
          {queryResult?.results && (
            <div className="group relative">
              <RecapEndCover
                ref={(el) => {
                  refs.current[queryResult.results.length + 1] = el;
                }}
              />
              <button
                type="button"
                className="absolute right-2 top-2 z-10 hidden rounded bg-card/80 p-1 group-hover:block"
                onClick={() =>
                  handleDownloadSingle(queryResult.results.length + 1)
                }
                title="Download image"
              >
                <ImageIcon className="size-5" />
              </button>
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
