import { cn } from "@/lib/utils";
import { CalendarClockIcon, Download } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

import { FaPaintRoller, FaRegCommentDots } from "react-icons/fa6";
import { IoAirplane } from "react-icons/io5";
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi";

import { TbStairs } from "react-icons/tb";

import { OpenCall } from "@/types/openCall";

import { Card } from "@/components/ui/card";
import { generateICSFile } from "@/lib/addToCalendar";
import { formatOpenCallDeadline, isValidIsoDate } from "@/lib/dateFns";
import { formatCurrency, formatRate } from "@/lib/eventFns";
import { EventData } from "@/types/event";

interface OpenCallCardProps {
  event: EventData;
  openCall: OpenCall;
  format: "mobile" | "desktop";
}

const OpenCallCard = ({ event, openCall, format }: OpenCallCardProps) => {
  const {
    eventCategory,

    location,
    dates,
  } = event;

  const { locale, city, stateAbbr, country, countryAbbr } = location;
  const { eventDates } = dates;
  const {
    compensation,
    basicInfo,
    eligibility,
    requirements,
    _id: openCallId,
  } = openCall;

  const {
    type: eligibilityType,
    whom: eligibilityWhom,
    details: eligibilityDetails,
  } = eligibility;
  const { budget, categories } = compensation;
  const {
    designFee,
    accommodation,
    food,
    travelCosts,
    materials,
    equipment,
    other: otherCat,
  } = categories;

  const {
    min: budgetMin,
    max: budgetMax,
    currency,
    rate: budgetRate,

    allInclusive: allInclusiveBudget,
  } = budget;

  const {
    requirements: reqs,
    more: reqsMore,
    destination: reqsDestination,
    documents: reqsDocs,
  } = requirements;

  const catLength = Object.keys(categories).length;
  const hasCategories = catLength > 0;
  const allInclusive = allInclusiveBudget && !hasCategories;

  const { callType, dates: callDates } = basicInfo;
  const { ocStart, ocEnd, timezone } = callDates;

  const hasBudgetRange = budgetMax && budgetMax > 0;
  const hasBudget = !!(budgetMin > 0 || hasBudgetRange);
  const hasRate = !!budgetRate && budgetRate > 0;
  const noBudgetInfo = !hasBudget && !hasRate;
  const eventStart = eventDates[0].start;
  const eventEnd = eventDates[0].end;

  const hasEventDates =
    eventStart &&
    isValidIsoDate(eventStart) &&
    eventEnd &&
    isValidIsoDate(eventEnd);

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`;

  const icsLink =
    callType === "Fixed" && isValidIsoDate(ocStart) && isValidIsoDate(ocEnd)
      ? generateICSFile(
          event.name,
          ocStart,
          ocEnd,
          locationString,
          event.about ?? "",
          eventCategory,
          true,
          hasEventDates ? eventStart! : "",
          hasEventDates ? eventEnd! : "",
          `${openCallId}`,
        )
      : null;

  const isMobile = format === "mobile";

  return (
    <>
      {isMobile ? (
        <Card className="w-full rounded-xl border-foreground/20 bg-white/60 p-5">
          <Accordion type="multiple" defaultValue={["item-1"]}>
            <AccordionItem value="item-1">
              <AccordionTrigger title="Deadline & Eligibility:" />
              <AccordionContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold underline underline-offset-2">
                      Deadline:
                    </span>
                    <br />{" "}
                    <span className="flex items-center gap-x-2">
                      {formatOpenCallDeadline(ocEnd || "", timezone, callType)}
                      {icsLink && callType === "Fixed" && (
                        <a
                          href={icsLink}
                          download={`${event.name.replace(/\s+/g, "_")}.ics`}
                        >
                          <CalendarClockIcon className="size-7 md:size-4" />
                        </a>
                      )}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold underline underline-offset-2">
                      Eligible:
                    </span>
                    <br />
                    <span
                      className={cn(
                        eligibilityType !== "International" && "text-red-600",
                      )}
                    >
                      {eligibilityType !== "International"
                        ? `${eligibilityType}: ${eligibilityWhom
                            .map((whom) => whom)
                            .join("/ ")} Artists*`
                        : eligibilityWhom}
                    </span>
                  </p>
                  {eligibilityDetails && (
                    <p>
                      <span className="font-semibold underline underline-offset-2">
                        More Info:
                      </span>
                      <br /> {eligibilityDetails}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger
                title=" Budget & Compensation:"
                hasPreview
                hidePreview
                className="w-full"
              >
                <section className="flex w-full flex-col items-center justify-center gap-y-3 pt-2">
                  <div className="flex justify-start gap-2">
                    {hasBudget &&
                      formatCurrency(
                        budgetMin,
                        budgetMax,
                        currency,
                        false,
                        allInclusive,
                      )}

                    {hasBudget && hasRate && (
                      <span className="text-sm"> | </span>
                    )}

                    {hasRate &&
                      formatRate(
                        budget.rate,
                        budget.unit,
                        budget.currency,
                        true,
                      )}

                    {noBudgetInfo && <p className="text-sm">No Info</p>}
                  </div>

                  <div
                    id="budget-icons-${id}"
                    className="col-span-2 flex max-w-full items-center justify-center gap-x-3"
                  >
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        designFee
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <PiPencilLineFill size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        accommodation
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <PiHouseLineFill size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        food
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <PiForkKnifeFill size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        materials
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <FaPaintRoller size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        travelCosts
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <IoAirplane size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        equipment
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <TbStairs size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        otherCat
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <FaRegCommentDots size={18} />
                    </span>
                  </div>
                </section>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mb-4 flex flex-col space-y-3 pb-3">
                  <p>
                    <span className="font-semibold underline underline-offset-2">
                      Budget:
                    </span>
                    <br />
                    {hasBudget &&
                      formatCurrency(
                        budgetMin,
                        budgetMax,
                        currency,
                        false,
                        allInclusive,
                      )}

                    {hasBudget && hasRate && (
                      <span className="text-sm"> | </span>
                    )}

                    {hasRate &&
                      formatRate(
                        budget.rate,
                        budget.unit,
                        budget.currency,
                        true,
                      )}

                    {noBudgetInfo && <p className="text-sm">No Info</p>}
                  </p>
                  <p className="font-semibold underline underline-offset-2">
                    Compensation Includes:
                  </p>
                  {/* NOTE: How to better display this? It's a bit jarring at the moment
            when viewing it. */}
                  <div className="flex flex-col justify-between gap-y-3 pr-[1px]">
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Design Fee:</p>
                      <p className="text-right">
                        {designFee && !allInclusive ? (
                          //todo: format the currency and possibly allow a union of either number or string for these. Then use typeof to determine which display method is used
                          // formatCurrency(designFee, null, currency)
                          designFee
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "No Info"}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Accommodation:</p>
                      <p className="text-right">
                        {accommodation && !allInclusive ? (
                          accommodation
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Food:</p>
                      <p className="text-right">
                        {food && !allInclusive ? (
                          food
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Travel Costs:</p>
                      <p className="text-right">
                        {travelCosts && !allInclusive ? (
                          travelCosts
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Materials:</p>
                      {materials && !allInclusive ? (
                        materials
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo && "text-muted-foreground",
                          )}
                        >
                          {!allInclusive ? "(not provided)" : "-"}
                        </span>
                      )}
                    </div>
                    {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Equipment:</p>
                      <p className="text-right">
                        {equipment && !allInclusive ? (
                          equipment
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    {categories && otherCat && (
                      <div className="flex flex-col items-start justify-between gap-y-2">
                        <p className="font-medium">Other:</p>
                        <p>{otherCat && !allInclusive && otherCat}</p>
                      </div>
                    )}
                    {/* <li>Must have liability insurance</li> */
                    /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger title="Application Requirements" />
              <AccordionContent>
                <div className="mb-4 flex flex-col space-y-3 pb-3">
                  <ol className="list-inside list-decimal px-4">
                    {reqs.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}

                    {/* <li>Must have liability insurance</li> */
                    /* TODO: this is something that could/should be later. These sort of requirements*/}
                  </ol>
                  <p className="text-sm">
                    {reqsMore.map((requirement, index) => (
                      <span key={index} className="mr-1 py-1">
                        {requirement}
                      </span>
                    ))}
                  </p>
                  <p className="">
                    Send applications to
                    <a
                      href={`mailto:${reqsDestination}?subject=${event.name} Open Call`}
                      className="mx-1 underline"
                    >
                      {reqsDestination}
                    </a>
                    and feel free to reach out with any questions
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger title="Documents:" />
              <AccordionContent>
                <ol className="list-outside list-decimal px-4 pl-6">
                  {reqsDocs?.map((document, index) => (
                    <li key={index} className="py-2">
                      <div className="flex items-center gap-x-2">
                        {document.title}
                        <a href={document.href} download={document.title}>
                          <Download className="size-5 hover:scale-110" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
            {openCall?.requirements?.otherInfo && (
              <AccordionItem value="item-5">
                <AccordionTrigger title="Other info:" />
                <AccordionContent>
                  <div className="mb-4 grid grid-cols-[1fr_auto] border-foreground/20 pb-3">
                    <ol className="list-inside list-decimal px-4">
                      {openCall?.requirements?.otherInfo?.map((info, index) => (
                        <li key={index} className="py-1">
                          {info}
                        </li>
                      ))}
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={["item-1", "item-2", "item-3"]}
          className="space-y-4"
        >
          <AccordionItem
            value="item-1"
            className="rounded-lg border-2 bg-white/30 px-4"
          >
            <AccordionTrigger title="Deadline & Eligibility:" />
            <AccordionContent>
              <div className="space-y-2 p-3">
                <p>
                  <span className="font-semibold underline underline-offset-2">
                    Deadline:
                  </span>
                  <br />{" "}
                  <span className="flex items-center gap-x-2">
                    {formatOpenCallDeadline(ocEnd || "", timezone, callType)}
                    {icsLink && callType === "Fixed" && (
                      <a
                        href={icsLink}
                        download={`${event.name.replace(/\s+/g, "_")}.ics`}
                      >
                        <CalendarClockIcon className="size-7 md:size-4" />
                      </a>
                    )}
                  </span>
                </p>
                <p>
                  <span className="font-semibold underline underline-offset-2">
                    Eligible:
                  </span>
                  <br />
                  <span
                    className={cn(
                      eligibilityType !== "International" && "text-red-600",
                    )}
                  >
                    {eligibilityType !== "International"
                      ? `${eligibilityType}: ${eligibilityWhom
                          .map((whom) => whom)
                          .join("/ ")} Artists*`
                      : eligibilityWhom}
                  </span>
                </p>
                {eligibilityDetails && (
                  <p>
                    <span className="font-semibold underline underline-offset-2">
                      More Info:
                    </span>
                    <br /> {eligibilityDetails}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="rounded-lg border-2 bg-white/30 px-4"
          >
            <AccordionTrigger
              title=" Budget & Compensation:"
              // hasPreview
              // hidePreview
              className="w-full"
            >
              {/* ----------------- Preview Section ------------------/ */}
              {/*todo: add functionality for cases where no budget/no info is present*/}
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-4 grid grid-cols-2 gap-y-4 p-3">
                <div className="flex flex-col gap-2">
                  {!noBudgetInfo && (
                    <>
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold underline underline-offset-2">
                          {hasBudgetRange ? "Budget Range" : "Budget"}:
                        </span>
                        {hasBudget &&
                          formatCurrency(
                            budgetMin,
                            budgetMax,
                            currency,
                            false,
                            allInclusive,
                          )}
                      </div>
                      {hasRate && (
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold underline underline-offset-2">
                            Rate:
                          </span>
                          {formatRate(
                            budget.rate,
                            budget.unit,
                            budget.currency,
                            true,
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {noBudgetInfo && <p className="text-sm">No Info</p>}
                  {budget.allInclusive && hasBudget && !hasCategories && (
                    <span className="text-sm font-bold italic text-red-600">
                      All-inclusive budget (no additional compensation)
                    </span>
                  )}
                  <div
                    id="budget-icons-${id}"
                    className="mt-2 flex max-w-full items-center gap-x-3"
                  >
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        designFee
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <PiPencilLineFill size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        accommodation
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <PiHouseLineFill size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        food
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <PiForkKnifeFill size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        materials
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <FaPaintRoller size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        travelCosts
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <IoAirplane size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        equipment
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <TbStairs size={18} />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border-1.5 p-1",
                        otherCat
                          ? "border-emerald-500 text-emerald-500"
                          : "border-foreground/20 text-foreground/20",
                      )}
                    >
                      <FaRegCommentDots size={18} />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <p className="font-semibold underline underline-offset-2">
                    Compensation Includes:
                  </p>
                  {/* NOTE: How to better display this? It's a bit jarring at the moment
              when viewing it. */}
                  <div className="flex flex-col justify-between gap-y-3 pr-[1px]">
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Design Fee:</p>
                      <p className="text-right">
                        {designFee && !allInclusive ? (
                          //todo: format the currency and possibly allow a union of either number or string for these. Then use typeof to determine which display method is used
                          // formatCurrency(designFee, null, currency)
                          designFee
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Accommodation:</p>
                      <p className="text-right">
                        {accommodation && !allInclusive ? (
                          accommodation
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Food:</p>
                      <p className="text-right">
                        {food && !allInclusive ? (
                          food
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Travel Costs:</p>
                      <p className="text-right">
                        {travelCosts && !allInclusive ? (
                          travelCosts
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Materials:</p>
                      {materials && !allInclusive ? (
                        materials
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo && "text-muted-foreground",
                          )}
                        >
                          {!allInclusive ? "(not provided)" : "-"}
                        </span>
                      )}
                    </div>
                    {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
                    <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                      <p className="font-medium">Equipment:</p>
                      <p className="text-right">
                        {equipment && !allInclusive ? (
                          equipment
                        ) : (
                          <span
                            className={cn(
                              "italic text-red-500",
                              noBudgetInfo && "text-muted-foreground",
                            )}
                          >
                            {!allInclusive ? "(not provided)" : "-"}
                          </span>
                        )}
                      </p>
                    </div>
                    {hasCategories && otherCat && (
                      <div className="flex flex-col items-start justify-between gap-y-2">
                        <p className="font-medium">Other:</p>
                        <p>{otherCat && !allInclusive && otherCat}</p>
                      </div>
                    )}
                    {/* <li>Must have liability insurance</li> */
                    /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold underline underline-offset-2">
                      More Info:
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="rounded-lg border-2 bg-white/30 px-4"
          >
            <AccordionTrigger title="Application Requirements" />
            <AccordionContent>
              <div className="mb-4 flex flex-col space-y-3 p-3">
                <ol className="list-inside list-decimal px-4">
                  {reqs.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}

                  {/* <li>Must have liability insurance</li> */
                  /* TODO: this is something that could/should be later. These sort of requirements*/}
                </ol>
                <p className="text-sm">
                  {reqsMore.map((requirement, index) => (
                    <span key={index} className="mr-1 py-1">
                      {requirement}
                    </span>
                  ))}
                </p>
                <p className="">
                  Send applications to
                  <a
                    href={`mailto:${reqsDestination}?subject=${event.name} Open Call`}
                    className="mx-1 underline"
                  >
                    {reqsDestination}
                  </a>
                  and feel free to reach out with any questions
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-4"
            className="rounded-lg border-2 bg-white/30 px-4"
          >
            <AccordionTrigger title="Documents:" />
            <AccordionContent>
              <ol className="list-outside list-decimal px-4 pl-6">
                {reqsDocs?.map((document, index) => (
                  <li key={index} className="py-2">
                    <div className="flex items-center gap-x-2">
                      {document.title}
                      <a href={document.href} download={document.title}>
                        <Download className="size-5 hover:scale-110" />
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
          {openCall?.requirements?.otherInfo && (
            <AccordionItem value="item-5">
              <AccordionTrigger title="Other info:" />
              <AccordionContent>
                <div className="mb-4 grid grid-cols-[1fr_auto] border-foreground/20 pb-3">
                  <ol className="list-inside list-decimal px-4">
                    {openCall?.requirements?.otherInfo?.map((info, index) => (
                      <li key={index} className="py-1">
                        {info}
                      </li>
                    ))}
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </>
  );
};

export default OpenCallCard;
