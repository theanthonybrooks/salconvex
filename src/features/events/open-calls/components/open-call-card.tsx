import { cn } from "@/lib/utils";
import { CalendarClockIcon, Download } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

import { OpenCall } from "@/types/openCall";

import { Card } from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import {
  OpenCallProvided,
  OpenCallProvidedPreview,
} from "@/features/events/open-calls/components/open-call-provided";
import { generateICSFile } from "@/lib/addToCalendar";
import { formatOpenCallDeadline, isValidIsoDate } from "@/lib/dateFns";
import { formatCurrency, formatRate } from "@/lib/eventFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { EventData } from "@/types/event";

interface OpenCallCardProps {
  event: EventData;
  openCall: OpenCall;
  format: "mobile" | "desktop";
}

const OpenCallCard = ({ event, openCall, format }: OpenCallCardProps) => {
  const { category: eventCategory, _id: id, location, dates } = event;

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
    min: budgetMin,
    max: budgetMax,
    currency,
    rate: budgetRate,
    moreInfo: budgetMoreInfo,
    allInclusive: allInclusiveBudget,
  } = budget;

  const {
    requirements: reqs,
    more: reqsMore,
    // destination: reqsDestination, //for email submissions?
    documents: reqsDocs,
    links: reqsLinks,
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
          <Accordion type="multiple" defaultValue={["Deadline"]}>
            <AccordionItem value="Deadline">
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
                        : "International (all)"}
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

            <AccordionItem value="BudgetComp">
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

                  <OpenCallProvidedPreview
                    id={id}
                    categories={categories}
                    noBudgetInfo={noBudgetInfo}
                    format="mobile"
                  />
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
                  <p className="mx-auto font-semibold underline underline-offset-2">
                    Compensation Includes:
                  </p>

                  {/*/~ <li>Must have liability insurance</li> */
                  /* Note-to-self: this is something that coold/should be later. These sort of requirements~/
                  </div>*/}
                  <OpenCallProvided
                    categories={categories}
                    allInclusive={allInclusive}
                    noBudgetInfo={noBudgetInfo}
                    currency={currency}
                  />
                  <p className="text-xs italic text-muted-foreground">
                    (Items listed above are in addition to the main budget)
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="AppReqs">
              <AccordionTrigger title="Application Requirements" />
              <AccordionContent>
                <div className="flex flex-col space-y-3 p-3">
                  <RichTextDisplay html={reqs} className="text-sm" />
                </div>
                {reqsMore && (
                  <div className="col-span-full">
                    <Accordion type="multiple">
                      <AccordionItem value="reqsMoreInfo">
                        <AccordionTrigger title="More Info:" className="pb-2" />
                        <AccordionContent>
                          <div className="mb-4 flex flex-col space-y-3 pb-3">
                            <RichTextDisplay
                              html={reqsMore}
                              className="text-sm"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {reqsDocs && reqsDocs.length > 0 && (
              <AccordionItem value="Docs">
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
            )}
            {reqsLinks && reqsLinks.length > 0 && (
              <AccordionItem value="AppLinks">
                <AccordionTrigger title="Links:" />
                <AccordionContent>
                  <ol className="list-outside list-decimal px-4 pl-6">
                    {reqsLinks?.map((link, index) => (
                      <li key={index} className="py-2">
                        <Link href={link.href} target="_blank">
                          {link.href.split("https://").pop()}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            )}

            {openCall?.requirements?.otherInfo && (
              <AccordionItem value="AppOther">
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
          defaultValue={["deadElig", "budgacomp", "appRequirements"]}
          className="space-y-4"
        >
          <AccordionItem
            value="deadElig"
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
                      : "International (all)"}
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
            value="budgacomp"
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
                  <OpenCallProvidedPreview
                    id={id}
                    categories={categories}
                    noBudgetInfo={noBudgetInfo}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <p className="font-semibold underline underline-offset-2">
                    Compensation Includes:
                  </p>

                  <OpenCallProvided
                    categories={categories}
                    allInclusive={allInclusive}
                    noBudgetInfo={noBudgetInfo}
                    currency={currency}
                  />
                  <p className="text-xs italic text-muted-foreground">
                    (Items listed above are in addition to the main budget)
                  </p>
                </div>

                {budgetMoreInfo && (
                  <div className="col-span-full">
                    <Accordion type="multiple">
                      <AccordionItem value="budgetMoreInfo">
                        <AccordionTrigger title="More Info:" className="pb-2" />
                        <AccordionContent>
                          <div className="mb-4 flex flex-col space-y-3 pb-3">
                            <RichTextDisplay
                              html={budgetMoreInfo}
                              className="text-sm"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="appRequirements"
            className="rounded-lg border-2 bg-white/30 px-4"
          >
            <AccordionTrigger title="Application Requirements" />
            <AccordionContent>
              <div className="flex flex-col space-y-3 p-3">
                <RichTextDisplay html={reqs} className="text-sm" />
              </div>
              {reqsMore && (
                <div className="col-span-full">
                  <Accordion type="multiple">
                    <AccordionItem value="reqsMoreInfo">
                      <AccordionTrigger title="More Info:" className="pb-2" />
                      <AccordionContent>
                        <div className="mb-4 flex flex-col space-y-3 pb-3">
                          <RichTextDisplay
                            html={reqsMore}
                            className="text-sm"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {reqsDocs && reqsDocs.length > 0 && (
            <AccordionItem
              value="AppDocs"
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
          )}
          {reqsLinks && reqsLinks.length > 0 && (
            <AccordionItem
              value="ApplicationLinks"
              className="rounded-lg border-2 bg-white/30 px-4"
            >
              <AccordionTrigger title="Links:" />
              <AccordionContent>
                <ol className="list-outside list-decimal px-4 pl-6">
                  {reqsLinks?.map((link, index) => (
                    <li key={index} className="py-2">
                      <Link href={link.href} target="_blank">
                        {/* {link.title} */}
                        {link.href.split("https://").pop()}
                      </Link>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
          {openCall?.requirements?.otherInfo && (
            <AccordionItem value="ApplicationOther">
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
