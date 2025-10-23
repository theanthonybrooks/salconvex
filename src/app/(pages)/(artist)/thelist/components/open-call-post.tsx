import Image from "next/image";
import { PostSettings } from "@/app/(pages)/(artist)/thelist/components/open-call-socials";
import { OpenCallData } from "@/types/openCallTypes";

import EventDates from "@/features/events/components/event-dates";
import { EligibilityLabelServer } from "@/features/events/open-calls/components/eligibilty-label-server";
import { formatOpenCallDeadlineForPost } from "@/helpers/dateFns";
import {
  formatBudgetCurrency,
  formatRate,
  getEventCategoryLabel,
} from "@/helpers/eventFns";
import { getFormattedLocationString } from "@/helpers/locations";
import { cn } from "@/helpers/utilsFns";

import styles from "./OpenCallPostDetail.module.css";

interface OpenCallPostProps {
  data: OpenCallData | null;
  postSettings: PostSettings;
}

export const OpenCallPost = ({ data, postSettings }: OpenCallPostProps) => {
  if (!data) return <p>No Data</p>;
  const { event, openCall, organizer } = data;
  const {
    logo: eventLogo,
    category: eventCategory,

    location,
  } = event;
  void organizer;
  void eventLogo;

  const { basicInfo, eligibility, compensation } = openCall;

  const hasEligibilityDetails = !!(
    typeof eligibility?.details === "string" &&
    eligibility.details.trim().length > 0
  );
  const budget = compensation?.budget;
  const {
    min: budgetMin,
    max: budgetMax,
    rate: budgetRate,
  } = budget || {
    min: 0,
    max: 0,
    rate: 0,
  };

  const hasBudgetRange = budgetMax && budgetMax > 0;
  const hasBudget = !!(budgetMin > 0 || hasBudgetRange);
  const hasRate = !!budgetRate && budgetRate > 0;
  const locationString = getFormattedLocationString(location);

  return (
    <div
      id="post-root"
      className={cn("relative flex h-[625px] w-[500px] flex-col")}
      style={{ background: postSettings.bgColor }}
    >
      <section
        className={cn(
          "flex items-center justify-between px-9 pt-6 font-semibold uppercase",
        )}
      >
        <p>{locationString}</p>
        <EventDates
          event={event}
          format="desktop"
          limit={1}
          preview={true}
          type="event"
        />
      </section>
      <section className="w-full">
        <h1 className={cn("-mt-5 flex gap-4 font-acumin", styles.title)}>
          OPEN <span className={cn(styles.light)}>CALL</span>
        </h1>
      </section>
      <section
        className={cn(
          "mx-8 mb-10 flex flex-1 flex-col divide-y-2.5 overflow-hidden rounded-b-sm rounded-t-3xl border-2.5",
        )}
      >
        <div className={cn("flex items-center divide-x-2.5")}>
          <span
            className={cn(
              "min-w-0 flex-1 break-words px-8 text-center font-acumin font-bold uppercase leading-[1.3]",
            )}
            style={{ fontSize: postSettings.fontSize }}
          >
            {event.name}
          </span>
          <div
            className={cn(
              "flex size-[150px] shrink-0 items-center justify-center bg-foreground p-5",
            )}
          >
            <Image
              src="\logotransparency.png"
              width="150"
              height="150"
              className={cn("h-full w-auto rounded-full bg-card p-1.5")}
              alt="sal logo"
            />
          </div>
        </div>
        <div className={cn("flex w-full flex-col gap-1 bg-card px-6 py-4")}>
          <p className="font-acumin text-sm uppercase">Application Deadline:</p>
          <p className="w-full text-center font-acumin text-6xl font-[725] uppercase">
            {formatOpenCallDeadlineForPost(
              basicInfo.dates?.ocEnd || "",
              basicInfo.dates?.timezone,
              basicInfo.callType,
            )}
          </p>
        </div>
        <div className={cn("flex h-full items-stretch divide-x-2.5")}>
          <div className="flex flex-col items-center justify-center px-4 py-2 font-acumin uppercase">
            <p className={cn("text-sm")}>Call Type:</p>
            <span className={cn("flex flex-col items-center leading-[0.8]")}>
              <p className="text-6xl font-black">
                {getEventCategoryLabel(eventCategory, true).slice(0, 1)}
              </p>
              <p className={cn("text-sm")}>
                {getEventCategoryLabel(eventCategory, true)}
              </p>
            </span>
          </div>
          {postSettings.budget && (
            <div className="flex flex-col items-center justify-center gap-1 px-4 text-[13px]">
              <p className={cn("font-bold")}>Project Budget:</p>
              <span className="items-center gap-x-1">
                {hasBudget &&
                  formatBudgetCurrency(
                    budget.min,
                    budget.max,
                    budget.currency,
                    false,
                    budget.allInclusive,
                  )}
                {hasBudget && hasRate && <p> | </p>}

                {hasRate &&
                  formatRate(budget.rate, budget.unit, budget.currency, true)}
              </span>
            </div>
          )}
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 px-12 text-sm",
              postSettings.budget && "px-4 text-[12px]",
            )}
          >
            <p className={cn("font-bold")}>Be kind to organizers:</p>
            <p className="text-balance text-center">
              Only apply if you&apos;re able to go & have read the requirements
            </p>
          </div>
        </div>
        <div
          className={cn("flex h-max items-center divide-x-2.5 bg-foreground")}
        >
          <div
            className={cn(
              "flex w-full scale-y-90 items-center justify-center gap-1 py-2 text-center text-lg font-bold uppercase text-card",
            )}
          >
            <p>Open To:</p>
            <span>
              <EligibilityLabelServer
                type={eligibility.type}
                whom={eligibility.whom}
                hasDetails={hasEligibilityDetails}
              />
            </span>
          </div>
        </div>
      </section>
      <section className="absolute bottom-1.5 left-10 flex w-[415px] items-center justify-between">
        <p className="text-sm font-bold">www.thestreetartlist.com</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1139.6 1163.91"
          className={cn("size-8 opacity-50")}
        >
          <path
            fill="black"
            className="cls-1"
            d="M1005.5,170.31c.02-6.22.04-12.21-.13-18.2h0c-.09-3.03-2.93-7.62-6.73-7.77-6.31-.21-12.63-.21-19.06-.17h-3.18s0-.03,0-.03h-.11v-29.36h-28.57v-.18h-34.88v.24h-22.2v-.17h-35.25v.08h-22.15v-.1h-34.28c-.3-.06-.59-.23-.88-.24-6.03-.15-12.08-.15-18.25-.12h-10.32v.38h-21.97v-.08h-28.49v-.02h-63.85v.03h-28.38v.14h-28.9v36.31h.3v23.38h-28.67v29.82h-.17v36.61h.03v29.93h.11v29.49c-.1.38-.34.75-.35,1.14-.26,6.15-.24,12.31-.2,18.84l.02,11.02h.38v23h0v36.14h.16v23.65h-22.33v-.08h-34.85v29.86h-.05v30.11h-28.73v29.96h-28.45v.13h-28.77v29.97h-.02v.03h-28.45v29.27h-.19v.34h-28.84v10.46c-.03,6.56-.04,12.97.11,19.39,0,.06.04.12.04.17h-28.31v30.14h-22.12v-.05h-35.32v.07h-22.09v-.19h-.03v-29.79h-28.45v-.14h-28.61v-23.24h.08v-37l-10.3-.02c-6.06,0-11.94-.03-17.81.15-.12,0-.26.09-.38.1v-29.69h0v-29.99h-.12v-30.1h-35.06v.12h-28.65v30.03h-.03v29.73h-.04v36.34h.19v23.64h-.23v30.06h-.13v36.32h.03v29.91h.26v23.34h-.12v36.76h35.08v-.04h21.75v3.73c-.02,6.52-.03,12.92.12,19.3.07,3.05,3.28,6.99,6.81,7.1,4.52.12,9.03.15,13.54.15,1.79,0,3.57,0,5.35,0h3.14s0,29.4,0,29.4h28.78v.24h28.5v29.34c-.06.29-.24.56-.25.86-.19,6.41-.17,12.82-.15,19.25v10.29h28.92v.21h28.71v29.94h28.72v.06h.14v23.39h-.22v36.28h.03v29.99h.19v23.44h-.27v36.37h.06v30.07h34.96v-.06h28.86v-.05h28.49v-36.13h-.08v-30.05h-28.07v-4.26c.04-6.38.08-12.36-.21-18.32-.02-.37-.24-.71-.33-1.07h.12v-.02h28.42v-30.06h28.61v-29.89h.06v-29.81h28.75v-.03h22.01v29.94h.03v29.86h0v30.25h.03v23.35h-.24v30h0v36.32h28.91v.12h35.01v-.3h22.2v.05h28.67v.24h34.88v-36.58h-28.68v-.04h-28.52v-22.91h.47s-.02-12.03-.02-12.03c-.02-5.83-.04-11.25.07-16.67.02-1.13-.18-2.08-.41-3v-28.95h.05v-36h-.22v-29.49c.12-.45.35-.9.36-1.34.22-6.13.2-12.27.17-18.75v-3.97s27.91,0,27.91,0v-.15h28.76v-29.98h.23v-29.99h28.39v-29.31h.06v-.04h3.72c1.93,0,3.85.01,5.73.01,4.04,0,8-.03,11.96-.15.3,0,.63-.18.95-.24h34.59v-29.79h.2v-36.84h-.01v-23.19h28.66v-36.45h-.1v-29.99h-.01v-23.42h.24v-30.13h21.79v.09h28.92v30.03h28.07v.12h35.54v-37h-.1v-22.95h.08v-36.6h-28.76v-.08h-34.87v.2h-22.2v-.06h-28.62v-30.15h-.09v-23.07h28.71v-.21h28.36v-.1h22.43v.29h35.15v-.15h28.45v-36.4h-.25v-29.99h-28.2v-.03h-35.68v.1h-21.54v-23.55h28.48v-.09h21.99v.22h35.25v-.08h28.32v-.11h21.93v.09h35.67v-37.03h-.02v-29.41h-.03v-23.49h.05v-36.04c.01-.11.1-.2.1-.32.24-6.61.22-13.24.2-19.92v-3.61s.04,0,.04,0v-10.63ZM712.6,181.18v23.28h-.11v30.1h-.07v.09h-22.01v-.24h-28.73v-29.97h-.1v-23.27h.24v-.29h22.03v.3h28.73Z"
          />
        </svg>
      </section>
    </div>
  );
};
