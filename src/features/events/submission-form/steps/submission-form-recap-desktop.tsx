// TODO: Add the terms of service checkboxes

"use client";

import { EligibilityType } from "@/types/openCallTypes";

import { useState } from "react";
import { capitalize } from "lodash";
import { useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import { LinkList } from "@/components/ui/link-list";
import NavTabs from "@/components/ui/nav-tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import EventDates from "@/features/events/components/event-dates";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label-client";
import { OpenCallProvided } from "@/features/events/open-calls/components/open-call-provided";
import { hasId, OpenCallFilesTable } from "@/features/files/form-file-list";
import { OrganizerCardLogoName } from "@/features/organizers/components/organizer-logo-name-card";
import { formatOpenCallDeadline } from "@/helpers/dateFns";
import {
  formatBudgetCurrency,
  formatRate,
  getCallTypeLabel,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/helpers/eventFns";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { cn } from "@/helpers/utilsFns";
import { getCallFormatLabel } from "@/lib/openCallFns";
import { useUserInfo } from "@/providers/user-info-provider";

import { Id } from "~/convex/_generated/dataModel";

interface SubmissionFormRecapDesktopProps {
  formType: number;
  isAdmin: boolean;
  setAcceptedTerms: (value: boolean) => void;
  acceptedTerms: boolean;
  isEligibleForFree: boolean;
  submissionCost: number | undefined;
  alreadyPaid: boolean;
}

export const SubmissionFormRecapDesktop = ({
  formType,
  isAdmin,
  setAcceptedTerms,
  acceptedTerms,
  submissionCost,
  isEligibleForFree,
  alreadyPaid,
}: SubmissionFormRecapDesktopProps) => {
  const { currency } = useUserInfo();
  const outputCurrency = currency === "usd" ? "USD" : "EUR";
  const eventOnly = formType === 1;
  const paidCall = formType === 3;
  const {
    // getValues,
    watch,
    // formState: { errors },
  } = useFormContext<EventOCFormValues>();
  const eventData = watch("event");
  const ocData = watch("openCall");
  const orgData = watch("organization");
  const tabList = [
    // { id: "application", label: "My Application" },
    { id: "organizer", label: "Organizer" },
    // { id: "openCall", label: "Open Call" },
    { id: "event", label: getEventCategoryLabel(eventData.category) },
    ...(!eventOnly ? [{ id: "openCall", label: "Open Call" }] : []),
    ...(isAdmin ? [{ id: "admin", label: "Admin" }] : []),
  ];
  const [activeTab, setActiveTab] = useState("organizer");

  const hasBudget =
    typeof ocData?.compensation?.budget?.min === "number" &&
    ocData?.compensation?.budget?.min > 0;
  const hasRate =
    typeof ocData?.compensation?.budget?.rate === "number" &&
    ocData?.compensation?.budget?.rate > 0;
  const appLink = ocData?.requirements?.applicationLink;
  const appLinkFormat = ocData?.requirements?.applicationLinkFormat;
  const mailLink = appLinkFormat === "mailto:";
  const mailSubject = ocData?.requirements?.applicationLinkSubject;
  const outputAppLink = mailLink
    ? `mailto:${appLink}${mailSubject ? `?subject=${mailSubject}` : ""}`
    : appLink;

  return (
    <div className="hidden h-full flex-col justify-between gap-y-8 lg:flex">
      <NavTabs
        tabs={tabList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="form-recap"
      >
        <div id="organizer" className="px-4">
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
            <table className="w-full table-auto border-separate border-spacing-y-2 self-start text-left text-sm">
              <tbody>
                <tr>
                  <th className="first-child pr-4 align-top font-medium">
                    Organizer:
                  </th>
                  <td className="first-child">
                    <OrganizerCardLogoName
                      organizer={{
                        ...orgData,
                        logo: orgData.logo as string,
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <th className="pr-4 align-top font-medium">
                    Primary Contact:
                  </th>
                  <td>
                    <p className="capitalize">
                      <span className="font-medium">Preferred Method - </span>{" "}
                      {capitalize(orgData?.contact?.primaryContact)}
                    </p>{" "}
                    {orgData?.contact?.organizer && (
                      <span className="flex gap-1">
                        <span className="font-medium">Contact:</span>{" "}
                        <div>
                          <p>{orgData?.contact?.organizer}</p>
                          {orgData?.contact?.organizerTitle && (
                            <p>- {orgData?.contact?.organizerTitle}</p>
                          )}
                        </div>
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <th className="pr-4 align-top font-medium">Links:</th>
                  <td>
                    <LinkList organizer={orgData} purpose="recap" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="event" className="px-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
            <table className="w-full table-auto border-separate border-spacing-y-2 self-start text-left text-sm">
              <tbody>
                <tr>
                  <th className="first-child pr-4 align-top font-medium">
                    Logo:
                  </th>
                  <td className="first-child">
                    {typeof eventData.logo === "string" && (
                      <EventOrgLogo
                        imgSrc={eventData.logo}
                        type="event"
                        size="large"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="pr-4 align-top font-medium">Name:</th>
                  <td>{eventData.name}</td>
                </tr>

                <tr>
                  <th className="pr-4 align-top font-medium">Location:</th>
                  <td>{eventData.location?.full}</td>
                </tr>

                <tr>
                  <th className="pr-4 align-top font-medium">Category:</th>
                  <td>{getEventCategoryLabel(eventData.category)}</td>
                </tr>

                {eventData.type && eventData.type?.length > 0 && (
                  <tr>
                    <th className="pr-4 align-top font-medium">Type:</th>
                    <td>
                      {Array.isArray(eventData.type)
                        ? getEventTypeLabel(eventData.type)
                        : getEventTypeLabel([eventData.type])}
                    </td>
                  </tr>
                )}
                {eventOnly && eventData.hasOpenCall === "Invite" && (
                  <tr>
                    <th className="pr-4 align-top font-medium">Invite Only:</th>
                    <td>Yes</td>
                  </tr>
                )}

                {eventData.category === "event" && (
                  <tr>
                    <th className="pr-4 align-top font-medium">Event Dates:</th>
                    <td>
                      <EventDates
                        event={{
                          dates: {
                            ...eventData.dates,
                            eventFormat:
                              eventData.dates?.eventFormat === ""
                                ? undefined
                                : eventData.dates?.eventFormat,
                            prodFormat:
                              eventData.dates?.prodFormat === ""
                                ? undefined
                                : eventData.dates?.prodFormat,
                          },
                        }}
                        format="desktop"
                        limit={0}
                        type="event"
                      />
                    </td>
                  </tr>
                )}

                {(eventData.category === "event" ||
                  eventData.category === "project") &&
                  eventData.dates?.prodFormat !== "sameAsEvent" &&
                  eventData.dates?.eventFormat !== "ongoing" && (
                    <tr>
                      <th className="pr-4 align-top font-medium">
                        Production Dates:
                      </th>
                      <td>
                        <EventDates
                          event={{
                            dates: {
                              ...eventData.dates,
                              eventFormat:
                                eventData.dates?.eventFormat === ""
                                  ? undefined
                                  : eventData.dates?.eventFormat,
                              prodFormat:
                                eventData.dates?.prodFormat === ""
                                  ? undefined
                                  : eventData.dates?.prodFormat,
                            },
                          }}
                          format="desktop"
                          limit={0}
                          type="production"
                        />
                      </td>
                    </tr>
                  )}

                <tr>
                  <th className="last-child pr-4 align-top font-medium">
                    Links:
                  </th>
                  <td className="last-child">
                    <LinkList
                      event={eventData}
                      organizer={orgData}
                      purpose="recap"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            {/* <Separator
                thickness={2}
                orientation="vertical"
                className="my-4 mx-auto border-foreground/"
              /> */}
            <div className="space-y-6 border-l-2 border-foreground/10 px-8 pt-2">
              <Accordion
                type="multiple"
                defaultValue={["About", "OtherInfo", "Timeline"]}
              >
                {eventData.about && (
                  <AccordionItem value="About">
                    {/* <p className="mb-1 text-sm font-medium">About</p> */}
                    <AccordionTrigger title="About:" />
                    <AccordionContent>
                      <RichTextDisplay
                        html={eventData.about || ""}
                        className="text-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}
                {eventData.timeLine && (
                  <AccordionItem value="Timeline">
                    <AccordionTrigger title="Timeline:" />
                    <AccordionContent>
                      <RichTextDisplay
                        html={eventData.timeLine || ""}
                        className="text-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}
                {eventData.otherInfo && (
                  <AccordionItem value="OtherInfo">
                    {/* <p className="mb-1 text-sm font-medium">About</p> */}
                    <AccordionTrigger title="Other Info:" />
                    <AccordionContent>
                      <RichTextDisplay
                        html={eventData.otherInfo || ""}
                        className="text-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>
        </div>

        {!eventOnly && (
          <div id="openCall" className="px-4">
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
              <table className="w-full table-auto border-separate border-spacing-y-2 self-start text-left text-sm">
                <tbody>
                  <tr>
                    <th className="first-child pr-4 align-top font-medium">
                      Type:
                    </th>
                    <td className="first-child">
                      {getCallTypeLabel(eventData?.hasOpenCall ?? "")}
                    </td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Format:</th>
                    <td>
                      {getCallFormatLabel(ocData?.basicInfo?.callFormat ?? "")}
                    </td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Deadline:</th>
                    <td>
                      {eventData?.hasOpenCall !== "Rolling" ? (
                        formatOpenCallDeadline(
                          ocData?.basicInfo?.dates?.ocEnd || "",
                          ocData?.basicInfo?.dates?.timezone || "Europe/Berlin",
                          eventData?.hasOpenCall,
                        )
                      ) : (
                        <p className="italic">N/A</p>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Eligibility:</th>
                    <td>
                      <EligibilityLabel
                        type={
                          (ocData?.eligibility?.type as EligibilityType) ?? null
                        }
                        whom={ocData?.eligibility?.whom ?? []}
                        format="desktop"
                      />
                    </td>
                  </tr>
                  {ocData?.selectionCriteria && (
                    <tr>
                      <th className="pr-4 align-top font-medium">
                        Selection Criteria:
                      </th>
                      <td>
                        <RichTextDisplay html={ocData.selectionCriteria} />
                      </td>
                    </tr>
                  )}

                  {typeof ocData?.basicInfo?.appFee === "number" &&
                    ocData?.basicInfo?.appFee > 0 && (
                      <tr>
                        <th className="pr-4 align-top font-medium">App Fee:</th>
                        <td>{`$${ocData?.basicInfo?.appFee}`}</td>
                      </tr>
                    )}

                  <tr>
                    <th className="pr-4 align-top font-medium">Budget:</th>
                    <td>
                      <div className="flex items-center gap-2">
                        {hasBudget &&
                          formatBudgetCurrency(
                            ocData?.compensation?.budget?.min,
                            ocData?.compensation?.budget?.max,
                            ocData?.compensation?.budget?.currency,
                            false,
                            ocData?.compensation?.budget?.allInclusive,
                          )}
                        {hasRate && hasBudget && <p>&</p>}
                        {hasRate &&
                          formatRate(
                            ocData?.compensation?.budget?.rate,
                            ocData?.compensation?.budget?.unit,
                            ocData?.compensation?.budget?.currency,
                            true,
                          )}
                        {!hasBudget && !hasRate && <em>No Budget Provided</em>}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="last-child pr-4 align-top font-medium">
                      Compensation:
                    </th>
                    <td className="last-child">
                      <OpenCallProvided
                        categories={ocData?.compensation?.categories}
                        allInclusive={
                          ocData?.compensation?.budget?.allInclusive
                        }
                        noBudgetInfo={!hasBudget}
                        currency={ocData?.compensation?.budget?.currency}
                      />
                    </td>
                  </tr>
                  {ocData?.compensation?.budget?.moreInfo && (
                    <tr>
                      <th className="last-child pr-4 align-top font-medium">
                        <p>Compensation</p> <p>(more info):</p>
                      </th>
                      <td className="last-child">
                        <RichTextDisplay
                          html={ocData.compensation.budget.moreInfo || ""}
                          className="text-sm"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* <Separator
                thickness={2}
                orientation="vertical"
                className="my-4 mx-auto border-foreground/"
              /> */}
              <div className="space-y-6 border-l-2 border-foreground/10 px-8 pt-2">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">Application Link:</p>
                  <Link href={outputAppLink ?? "/thelist"} target="_blank">
                    {appLink}
                  </Link>
                  {mailLink && mailSubject && (
                    <p className="text-sm">Subject: {mailSubject}</p>
                  )}
                </div>
                <Accordion
                  type="multiple"
                  defaultValue={["Reqs", "Docs", "links"]}
                >
                  <AccordionItem value="Reqs">
                    <AccordionTrigger title="Requirements:" />
                    <AccordionContent>
                      <RichTextDisplay
                        html={ocData?.requirements?.requirements || ""}
                        className="text-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>
                  {ocData?.documents && ocData?.documents?.length > 0 && (
                    <AccordionItem value="Docs">
                      <AccordionTrigger title="Documents" />
                      <AccordionContent>
                        <OpenCallFilesTable
                          files={ocData.documents.filter(hasId)}
                          eventId={eventData._id as Id<"events">}
                          isDraft={true}
                          isAdmin={isAdmin}
                          recap={true}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {ocData?.requirements?.links &&
                    ocData?.requirements?.links?.length > 0 && (
                      <AccordionItem value="links">
                        <AccordionTrigger title="Links" />
                        <AccordionContent>
                          <ol className="list-outside list-decimal px-4 pl-6">
                            {ocData.requirements.links.map((link, index) => (
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
                </Accordion>
              </div>
            </div>
          </div>
        )}
        {isAdmin && (
          <div id="admin" className="px-4">
            <Accordion
              type="multiple"
              defaultValue={["Organizer", "Event", "OpenCall"]}
            >
              <AccordionItem value="Organizer">
                <AccordionTrigger title="Organizer Data:" />
                <AccordionContent>
                  <pre className="scrollable mini text-wrap text-sm text-foreground">
                    {JSON.stringify(orgData, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="Event">
                <AccordionTrigger title="Event Data:" />
                <AccordionContent>
                  <pre className="scrollable mini text-wrap text-sm text-foreground">
                    {JSON.stringify(eventData, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="OpenCall">
                <AccordionTrigger title="Open Call Data:" />
                <AccordionContent>
                  <pre className="scrollable mini text-wrap text-sm text-foreground">
                    {JSON.stringify(ocData, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </NavTabs>
      <div className="space-y-6 sm:mb-6">
        {!alreadyPaid && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                name="info"
                id="info"
                checked={acceptedTerms}
                onCheckedChange={(value) => setAcceptedTerms(value === true)}
              />
              <label
                htmlFor="info"
                className="text-sm text-foreground hover:cursor-pointer"
              >
                I have read and agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-sm underline underline-offset-2 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-sm underline underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                and confirm that all information provided is accurate and
                complete.
              </label>
            </div>
          </div>
        )}
        {submissionCost && !alreadyPaid && paidCall && (
          <div className="mt-4 flex w-full justify-end">
            <span className="items-baseline gap-2 text-lg font-semibold text-foreground">
              Submission cost for this event/open call is:
              <span className={cn("flex items-start justify-end gap-2")}>
                ({outputCurrency}){" "}
                <span
                  className={cn("mr-5 flex items-center text-4xl font-bold")}
                >
                  <p className={cn(isEligibleForFree && "text-emerald-600")}>
                    {outputCurrency === "USD" ? "$" : ""}
                    {isEligibleForFree ? 0 : submissionCost}
                    {outputCurrency === "EUR" ? "€" : ""}
                  </p>
                </span>
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
