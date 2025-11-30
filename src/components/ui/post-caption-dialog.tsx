"use client";

import { openCallCategoryFields } from "@/constants/openCallConsts";
import { promoBlock } from "@/constants/socialConsts";

import { OpenCallData } from "@/types/openCallTypes";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Check, Clipboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/helpers/currencyFns";
import { formatEventDates, formatOpenCallDeadline } from "@/helpers/dateFns";
import { formatBudgetCurrency, getEventTags } from "@/helpers/eventFns";
import { getDemonym, getFormattedLocationString } from "@/helpers/locationFns";
import { cn } from "@/helpers/utilsFns";
import { getCallFormatLabel } from "@/lib/openCallFns";

type PostCaptionDialogProps = {
  data: OpenCallData | null;
  className?: string;
  open: boolean;
  setOpenAction: Dispatch<SetStateAction<boolean>>;
};

export const PostCaptionDialog = ({
  data,

  className,
  open,
  setOpenAction,
}: PostCaptionDialogProps) => {
  const copiedStyling = "ring-2 ring-green-300";
  const [copied, setCopied] = useState<"alt" | "caption" | "comment" | null>(
    null,
  );
  const [captionText, setCaptionText] = useState("");
  const [altText, setAltText] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!data) return;
    const { event, openCall, organizer } = data;
    if (!openCall || !organizer || !event) return;

    const hasEvent = event.dates.eventFormat !== "noEvent";
    const eventStart = hasEvent
      ? event.dates.eventDates[0].start
      : event.dates.prodDates?.[0]?.start || "";
    const eventEnd = hasEvent
      ? event.dates.eventDates[event.dates.eventDates.length - 1].end
      : event.dates.prodDates?.[event.dates.prodDates?.length - 1]?.end || "";
    let content = "";
    content += `${event.name} || ${formatEventDates(eventStart, eventEnd, event.dates.eventFormat ?? null)}`;
    content += `\n————————————————————————`;
    content += `\nDeadline: ${formatOpenCallDeadline(openCall.basicInfo.dates.ocEnd || "", openCall.basicInfo.dates.timezone, openCall.basicInfo.callType)}`;
    content += `\nCall Format: ${getCallFormatLabel(openCall.basicInfo.callFormat)}`;
    content += `\nOpen to: ${openCall.eligibility.type === "International" ? "International (all)" : openCall.eligibility.type}`;
    if (
      openCall.eligibility.whom.length === 1 &&
      openCall.eligibility.type === "National"
    ) {
      content += ` -  ${getDemonym(openCall.eligibility.whom[0])} Artists`;
    }
    content += `${openCall.eligibility.details ? "*" : ""}`;

    content += `\n\nProject Info:`;
    content += `\n—————————\n`;
    if (organizer.links?.instagram) {
      content += `Organizer: ${organizer.links.instagram}${event?.links?.instagram ? ` & ${event.links.instagram}` : ""}`;
    } else if (event?.links?.instagram) {
      content += `Organizer: ${event.links.instagram}`;
    } else {
      content += `Organizer: ${organizer.name}`;
    }

    content += `\nWhere: ${getFormattedLocationString(event.location)}`;
    content += `\nWhen: ${formatEventDates(eventStart, eventEnd, event.dates.eventFormat ?? null)}`;
    if (event.blurb) content += `\n\nAbout: ${event.blurb}`;
    if (openCall.compensation) {
      const { budget } = openCall.compensation;

      if (budget?.max) {
        content += `\n\nBudget: ${formatBudgetCurrency(budget.min, budget.max, budget.currency)} ${budget.allInclusive ? " (All-inclusive)" : ""}\n`;
        // if (budget.allInclusive) content += `All-inclusive budget\n`;
      }
      const hasAnyCategoryValue = Object.values(
        openCall.compensation.categories ?? {},
      ).some((v) => (typeof v === "number" ? v > 0 : Boolean(v)));
      if (hasAnyCategoryValue) {
        content += `\nProvided:\n`;
        let i = 1;
        for (const [title, amount] of Object.entries(
          openCall.compensation.categories,
        )) {
          if (typeof amount === "number") {
            content += `${i}. ${
              openCallCategoryFields.find((field) => field.value === title)
                ?.label ?? title
            }: ${formatCurrency(amount, budget.currency)}\n`;
            i++;
          } else if (amount) {
            content += `${i}. ${
              openCallCategoryFields.find((field) => field.value === title)
                ?.label ?? title
            }\n`;
            i++;
          }
        }
      }
    }
    content += `\n🔗 The links and full details for all open calls are on thestreetartlist.com (link in bio). Memberships start at $3/month`;
    content += `\n\nPlease contact the organizers directly with any open call-related questions you may have 💛`;

    content += "\n\n" + promoBlock;

    setCaptionText(content);

    let altContent = "";
    altContent += `All open calls are listed on The Street Art List (www.thestreetartlist.com - link in bio)`;
    altContent += `Tagged: \n${event?.links?.instagram ?? organizer.links.instagram ?? organizer.name}`;
    setAltText(altContent);

    const commentContent = getEventTags({
      type: event.type,
      category: event.category,
    });

    setCommentText(commentContent);
  }, [data]);

  const handleCopyText = (object: "caption" | "alt" | "comment") => {
    navigator.clipboard
      .writeText(
        object === "caption"
          ? captionText
          : object === "alt"
            ? altText
            : commentText,
      )
      .then(() => {
        setCopied(object);
        setTimeout(() => setCopied(null), 2000);
      });
  };
  return (
    <Dialog open={open} onOpenChange={setOpenAction}>
      <DialogContent
        className={cn(
          "w-full bg-card sm:max-h-[80dvh] sm:max-w-[min(64rem,90dvw)]",
          className,
        )}
        overlayClassName="hidden"
      >
        <DialogHeader>
          <DialogTitle>Post Text</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="salWithShadowHiddenBg"
            size="lg"
            className={cn(
              "flex w-40 items-center gap-1",
              copied === "caption" && "border-green-800 bg-green-100",
            )}
            onClick={() => handleCopyText("caption")}
            disabled={captionText.trim().length === 0}
          >
            {copied === "caption" ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="size-4" />
                Copy Caption
              </>
            )}
          </Button>
          <Button
            variant="salWithShadowHiddenBg"
            size="lg"
            className={cn(
              "flex w-40 items-center gap-1",
              copied === "alt" && "border-green-800 bg-green-100",
            )}
            onClick={() => handleCopyText("alt")}
            disabled={altText.trim().length === 0}
          >
            {copied === "alt" ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="size-4" />
                Copy Alt Text
              </>
            )}
          </Button>
          <Button
            variant="salWithShadowHiddenBg"
            size="lg"
            className={cn(
              "flex w-40 items-center gap-1",
              copied === "comment" && "border-green-800 bg-green-100",
            )}
            onClick={() => handleCopyText("comment")}
            disabled={altText.trim().length === 0}
          >
            {copied === "comment" ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="size-4" />
                Copy Comment
              </>
            )}
          </Button>
        </div>
        <div
          className={cn(
            "flex flex-col gap-x-4 gap-y-2 sm:grid sm:grid-cols-[60%_auto]",
          )}
        >
          <DebouncedTextarea
            value={captionText}
            setValue={setCaptionText}
            maxLength={2200}
            className={cn(
              "max-h-[60dvh] font-mono",
              copied === "caption" && copiedStyling,
            )}
          />
          <div className="flex flex-col gap-4">
            <DebouncedTextarea
              value={altText}
              setValue={setAltText}
              maxLength={140}
              className={cn(
                "max-h-25 font-mono",
                copied === "alt" && copiedStyling,
              )}
            />
            <DebouncedTextarea
              value={commentText}
              setValue={setCommentText}
              maxLength={30}
              className={cn(
                "max-h-50 font-mono",
                copied === "comment" && copiedStyling,
              )}
              countMode="word"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
