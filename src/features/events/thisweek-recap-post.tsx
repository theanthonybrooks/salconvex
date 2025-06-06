import { RecapCover } from "@/features/events/ui/thisweek-recap/recap-cover";
import RecapPost from "@/features/events/ui/thisweek-recap/recap-post";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";
import { formatCondensedDateRange } from "@/lib/dateFns";
import { SortOptions } from "@/types/thelist";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveAs } from "file-saver";
import { toJpeg } from "html-to-image";
import JSZip from "jszip";
import { Clipboard, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

interface ThisweekRecapPostProps {
  source: "thisweek" | "nextweek";
}

const ThisweekRecapPost = ({ source }: ThisweekRecapPostProps) => {
  // Inside your component
  const refs = useRef<(HTMLDivElement | null)[]>([]);
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
          "UTC",
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
    saveAs(content, "recap-posts.zip");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(captionText);
  };

  const handleCopyAlt = () => {
    navigator.clipboard.writeText(altText);
  };

  useEffect(() => {
    if (!queryResult?.results?.length) return;

    const grouped: Record<string, string[]> = {};

    for (const event of queryResult.results) {
      const name = event.name;
      const dueDate = event.openCall?.basicInfo.dates?.ocEnd ?? "";
      const dateKey = new Date(dueDate).toISOString().slice(0, 10);
      const instagram = event.links?.instagram;
      const igHandle = instagram
        ? instagram
            .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
            .replace(/\/$/, "")
        : "";
      const organization = igHandle ? `| @${igHandle}` : "";

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(`${name} ${organization}`.trim());
    }

    const sortedDates = Object.keys(grouped).sort();

    let content = `A quick rundown of what's ending in the next 7 days. The links for everything are on The Street Art List website (link in bio).\n`;
    content += `DM or email at hey@thestreetartlist.com with any feedback or things that you think would be useful to include. Also, use the submission form on the site for any open calls that I haven't included!\n\n`;
    content += `P.S. - Any questions related to the events should be asked to the organizers directly. I'm but a messenger and can't help if you ask.\n\n`;

    let counter = 1;
    for (const date of sortedDates) {
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      content += `${formattedDate}:\n`;
      for (const item of grouped[date]) {
        content += `${counter}. ${item}\n`;
        counter++;
      }
      content += "\n";
    }

    content += `Previously, the site was free and I just asked for Patreon/other support when possible. As very few supported and it cost me quite a bit (both time and money), the site is now subscription-based at $3/month. The coding of the site, searching, reading through, addition of open calls, and these IG posts are all done by me @anthonybrooksart.\n\n`;

    content += `#opencall #muralfest #publicartopencall #muralfestival #graffitijam #graffiti #streetartfestival #muralproject #callforartist #streetartopencall #urbanart #arteurbana #muralproject #eoi #callforartist #rfq #rfp #artistopencall\n`;
    content += `#artistopportunities #artistopportunity #streetartopencall #streetartcalls`;

    setCaptionText(content);
    setCharCount(content.length);
  }, [queryResult]);

  useEffect(() => {
    if (!queryResult?.results?.length) return;

    const altText = `Weekly post for ${displayRange}. The links for everything included here are on The Street Art List website (link in bio or www.thestreetartlist.com) and the IG handles are provided for events that have them. `;

    setAltText(altText);
    setAltCharCount(altText.length);
  }, [queryResult, displayRange]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-y-6">
        <div
          ref={(el) => {
            refs.current[0] = el;
          }}
        >
          <RecapCover dateRange={displayRange} />
        </div>
        {queryResult?.results?.map((event, index) => (
          <div
            key={event._id}
            ref={(el) => {
              refs.current[index + 1] = el;
            }}
          >
            <RecapPost key={event._id} event={event} index={index} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="salWithShadowHiddenBg"
            onClick={handleDownloadAll}
            className="flex flex-1 items-center gap-1"
          >
            Download <ImageIcon className="size-4" />
          </Button>
          <Button
            variant="salWithShadowHiddenBg"
            onClick={handleCopyText}
            className="flex flex-1 items-center gap-1"
          >
            Copy Text <Clipboard className="size-4" />
          </Button>
          <Button
            variant="salWithShadowHiddenBg"
            onClick={handleCopyAlt}
            className="flex flex-1 items-center gap-1"
          >
            Copy Alt <Clipboard className="size-4" />
          </Button>
        </div>
        <Textarea
          value={captionText}
          onChange={(e) => {
            setCaptionText(e.target.value);
            setCharCount(e.target.value.length);
          }}
          rows={28}
          className="whitespace-pre-wrap bg-card font-mono"
        />
        <p className="text-sm text-muted-foreground">{charCount} characters</p>

        <Textarea
          value={altText}
          onChange={(e) => {
            setAltText(e.target.value);
            setAltCharCount(e.target.value.length);
          }}
          rows={5}
          className="whitespace-pre-wrap bg-card font-mono"
        />
        <p className="text-sm text-muted-foreground">
          {altCharCount} characters
        </p>
      </div>
    </div>
  );
};

export default ThisweekRecapPost;
