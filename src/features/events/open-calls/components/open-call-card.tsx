import { cn } from "@/lib/utils";
import { CalendarClockIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

import { OpenCall } from "@/types/openCall";

import { Card } from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { LightboxGallery } from "@/components/ui/lightbox-gallery";
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label";
import {
  OpenCallProvided,
  OpenCallProvidedPreview,
} from "@/features/events/open-calls/components/open-call-provided";
import { getOpenCallStatus } from "@/features/events/open-calls/helpers/openCallStatus";
import { hasId, OpenCallFilesTable } from "@/features/files/form-file-list";
import { generateICSFile } from "@/lib/addToCalendar";
import { formatOpenCallDeadline, isValidIsoDate } from "@/lib/dateFns";
import { formatCurrency, formatRate } from "@/lib/eventFns";
import { getFormattedLocationString } from "@/lib/locations";
import { RichTextDisplay } from "@/lib/richTextFns";
import { ArtistFull } from "@/types/artist";
import { EventData } from "@/types/event";
import { UserPref } from "@/types/user";

interface OpenCallCardProps {
  artist?: ArtistFull | null;
  event: EventData;
  openCall: OpenCall;
  userPref: UserPref | null;
  format: "mobile" | "desktop";
  publicPreview?: boolean;
}

const OpenCallCard = ({
  artist,
  event,
  openCall,
  format,
  userPref,
  publicPreview,
}: OpenCallCardProps) => {
  const { category: eventCategory, _id: id, location, dates } = event;

  const { eventDates } = dates;
  const {
    compensation,
    basicInfo,
    eligibility,
    documents,
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

    links: reqsLinks,
  } = requirements;

  const reqsDocs = documents ?? [];

  const catLength = Object.keys(categories).length;
  const hasCategories = catLength > 0;
  const allInclusive = allInclusiveBudget && !hasCategories;

  const { callType, dates: callDates } = basicInfo;
  const { ocStart, ocEnd, timezone } = callDates;
  const userPrefTZ = userPref?.timezone;
  const deadlineTimezone =
    userPref?.timezone && userPrefTZ !== "" ? userPref.timezone : timezone;
  // const artistNationality = artist?.artistNationality ?? [];
  const artistCountries = [
    ...(artist?.artistNationality ?? []),
    ...(artist?.artistResidency?.country
      ? [artist.artistResidency.country]
      : []),
  ];
  // console.log(artistCountries);
  //compare this to the eligibility whom array
  const artistEligible = artistCountries.some((artistCountry) =>
    eligibilityWhom.some(
      (whom) =>
        artistCountry.trim().toLowerCase() === whom.trim().toLowerCase(),
    ),
  );

  const hasBudgetRange = budgetMax && budgetMax > 0 && budgetMax !== budgetMin;
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

  const eventTimeline = event.timeLine;

  const locationString = getFormattedLocationString(location);

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

  const openCallStatus = getOpenCallStatus(
    ocStart ? new Date(ocStart) : null,
    ocEnd ? new Date(ocEnd) : null,
    basicInfo.callType,
  );

  return (
    <>
      {isMobile ? (
        <Card className="w-full rounded-xl border-foreground/20 bg-white/60 p-5">
          <Accordion type="multiple" defaultValue={["Deadline"]}>
            <AccordionItem value="Deadline">
              <AccordionTrigger title="Deadline & Eligibility:" />
              <AccordionContent>
                <div className="flex flex-col gap-y-2">
                  <span>
                    <span className="font-semibold underline underline-offset-2">
                      {openCallStatus === "ended" ? "Ended" : "Deadline"}:
                    </span>
                    <br />{" "}
                    <span className="flex items-center gap-x-2">
                      {formatOpenCallDeadline(
                        ocEnd || "",
                        deadlineTimezone,
                        callType,
                      )}
                      {icsLink && callType === "Fixed" && (
                        <a
                          href={icsLink}
                          download={`${event.name.replace(/\s+/g, "_")}.ics`}
                        >
                          <CalendarClockIcon className="size-5 md:size-4" />
                        </a>
                      )}
                    </span>
                  </span>
                  <span>
                    <span className="font-semibold underline underline-offset-2">
                      Eligible:
                    </span>
                    <br />
                    <span
                      className={cn(
                        "flex items-center gap-2",
                        !artistEligible &&
                          eligibilityType !== "International" &&
                          "text-red-600",
                        artistEligible && "text-emerald-800",
                      )}
                    >
                      <EligibilityLabel
                        type={eligibilityType}
                        whom={eligibilityWhom}
                        format="mobile"
                        eligible={artistEligible}
                        publicView={publicPreview}
                      />
                    </span>
                  </span>
                  {eligibilityDetails && (
                    <div>
                      <span className="font-semibold underline underline-offset-2">
                        More Info:
                      </span>
                      <br />
                      <RichTextDisplay
                        html={eligibilityDetails}
                        className="text-sm"
                      />
                    </div>
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

                    {noBudgetInfo && <p className="text-sm">No Budget Info</p>}
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
                  <div>
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
                  </div>
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
                  <p className="text-center text-xs italic text-muted-foreground">
                    (Items listed are in addition to the main budget)
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

            {/* {reqsDocs && reqsDocs.length > 0 && (
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
            )} */}
            {reqsDocs && reqsDocs.length > 0 && (
              <>
                {reqsDocs.some((doc) =>
                  /\.(pdf|docx?|pptx?)$/i.test(doc.title),
                ) && (
                  <AccordionItem value="Docs">
                    <AccordionTrigger title="Documents:" />
                    <AccordionContent>
                      <OpenCallFilesTable
                        files={(reqsDocs ?? []).filter(hasId)}
                        eventId={event._id}
                        isDraft={false}
                        isAdmin={false}
                        isPublic={true}
                        type="docs"
                        isMobile={true}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {reqsDocs.some((doc) => /\.(jpe?g|png)$/i.test(doc.title)) && (
                  <AccordionItem value="Images">
                    <AccordionTrigger title="Images:" />
                    <AccordionContent>
                      <div className="flex items-center gap-3">
                        <LightboxGallery
                          images={reqsDocs.filter((doc) =>
                            /\.(jpe?g|png)$/i.test(doc.title),
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </>
            )}

            {reqsLinks && reqsLinks.length > 0 && (
              <AccordionItem value="AppLinks">
                <AccordionTrigger title="Links:" />
                <AccordionContent>
                  <ol className="list-outside list-decimal px-4 pl-6">
                    {reqsLinks?.map((link, index) => (
                      <li key={index} className="py-2">
                        <Link href={link.href} target="_blank">
                          {link.title ?? link.href.split("https://").pop()}
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
                  <div className="flex flex-col space-y-3 p-3">
                    <RichTextDisplay
                      html={openCall.requirements.otherInfo}
                      className="text-sm"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {eventTimeline && (
              <AccordionItem value="timeline">
                <AccordionTrigger title="Timeline:" />
                <AccordionContent>
                  <div className="flex flex-col space-y-3 p-3">
                    <RichTextDisplay html={eventTimeline} className="text-sm" />
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
              <div className="flex flex-col gap-y-3 p-3">
                <span>
                  <span className="font-semibold underline underline-offset-2">
                    {openCallStatus === "ended" ? "Ended" : "Deadline"}:
                  </span>
                  <br />{" "}
                  <span className="flex items-center gap-x-2">
                    {formatOpenCallDeadline(
                      ocEnd || "",
                      deadlineTimezone,
                      callType,
                    )}
                    {icsLink && callType === "Fixed" && (
                      <a
                        href={icsLink}
                        download={`${event.name.replace(/\s+/g, "_")}.ics`}
                      >
                        <CalendarClockIcon className="size-7 md:size-4" />
                      </a>
                    )}
                  </span>
                </span>
                <span>
                  <span className="font-semibold underline underline-offset-2">
                    Eligible:
                  </span>
                  <br />
                  <span
                    className={cn(
                      "flex items-center gap-2",
                      !artistEligible &&
                        eligibilityType !== "International" &&
                        "text-red-600",
                      artistEligible && "text-emerald-800",
                    )}
                  >
                    <EligibilityLabel
                      type={eligibilityType}
                      whom={eligibilityWhom}
                      format="desktop"
                      eligible={artistEligible}
                      publicView={publicPreview}
                    />
                  </span>
                </span>
                {eligibilityDetails && (
                  <div>
                    <span className="font-semibold underline underline-offset-2">
                      More Info:
                    </span>
                    <br />
                    <RichTextDisplay
                      html={eligibilityDetails}
                      className="text-sm"
                    />
                  </div>
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
                      {hasBudget && (
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold underline underline-offset-2">
                            {hasBudgetRange ? "Budget Range" : "Budget"}:
                          </span>
                          {formatCurrency(
                            budgetMin,
                            budgetMax,
                            currency,
                            false,
                            allInclusive,
                          )}
                        </div>
                      )}
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
                  {budget.allInclusive && hasBudget && !allInclusive && (
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
                  {!allInclusive && (
                    <p className="mt-2 text-center text-xs italic text-muted-foreground">
                      (Items listed above are in addition to the main budget)
                    </p>
                  )}
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
          {/* 
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
          )} */}
          {reqsDocs && reqsDocs.length > 0 && (
            <>
              {reqsDocs.some((doc) =>
                /\.(pdf|docx?|pptx?)$/i.test(doc.title),
              ) && (
                <AccordionItem
                  value="AppDocs"
                  className="rounded-lg border-2 bg-white/30 px-4"
                >
                  <AccordionTrigger title="Documents:" />
                  <AccordionContent>
                    <OpenCallFilesTable
                      files={(reqsDocs ?? []).filter(hasId)}
                      eventId={event._id}
                      isDraft={false}
                      isAdmin={false}
                      isPublic={true}
                      type="docs"
                      isMobile={false}
                      className="max-w-100"
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              {reqsDocs.some((doc) => /\.(jpe?g|png)$/i.test(doc.title)) && (
                <AccordionItem
                  value="AppImgs"
                  className="rounded-lg border-2 bg-white/30 px-4"
                >
                  <AccordionTrigger title="Images:" />
                  <AccordionContent>
                    <div className="flex items-center gap-3">
                      <LightboxGallery
                        images={reqsDocs.filter((doc) =>
                          /\.(jpe?g|png)$/i.test(doc.title),
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </>
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
                        {link.title ?? link.href.split("https://").pop()}
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
                <div className="flex flex-col space-y-3 p-3">
                  <RichTextDisplay
                    html={openCall.requirements.otherInfo}
                    className="text-sm"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {eventTimeline && (
            <AccordionItem
              value="eventTimeline"
              className="rounded-lg border-2 bg-white/30 px-4"
            >
              <AccordionTrigger title="Timeline:" />
              <AccordionContent>
                <div className="flex flex-col space-y-3 p-3">
                  <RichTextDisplay html={eventTimeline} className="text-sm" />
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
