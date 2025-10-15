// TODO: Add the terms of service checkboxes

"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import { LinkList } from "@/components/ui/link-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import EventDates from "@/features/events/components/event-dates";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label-client";
import { OpenCallProvided } from "@/features/events/open-calls/components/open-call-provided";
import { hasId, OpenCallFilesTable } from "@/features/files/form-file-list";
import { OrganizerCardLogoName } from "@/features/organizers/components/organizer-logo-name-card";
import {
  OrganizerMainContact,
  OrgContactProps,
} from "@/features/organizers/components/organizer-main-contact";
import { formatOpenCallDeadline } from "@/lib/dateFns";
import {
  formatBudgetCurrency,
  formatRate,
  getCallTypeLabel,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns";
import { getCallFormatLabel } from "@/lib/openCallFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import { EligibilityType } from "@/types/openCall";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Id } from "~/convex/_generated/dataModel";

interface SubmissionFormRecapMobileProps {
  formType: number;
  isAdmin: boolean;
  setAcceptedTerms: (value: boolean) => void;

  acceptedTerms: boolean;
  isEligibleForFree: boolean;
  submissionCost: number | undefined;
  alreadyPaid: boolean;
}

export const SubmissionFormRecapMobile = ({
  formType,
  isAdmin,
  setAcceptedTerms,

  acceptedTerms,
  submissionCost,
  isEligibleForFree,
  alreadyPaid,
}: SubmissionFormRecapMobileProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  const eventOnly = formType === 1;
  const paidCall = formType === 3;
  const {
    // getValues,
    watch,
  } = useFormContext<EventOCFormValues>();
  // const currentValues = getValues();
  const eventData = watch("event");
  const ocData = watch("openCall");
  const orgData = watch("organization");
  const tabList = [
    { id: "organizer", label: "Organizer" },
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

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="flex h-full flex-col justify-between gap-y-8 lg:hidden">
      <Tabs
        onValueChange={(value) => setActiveTab(value)}
        value={activeTab}
        defaultValue={activeTab}
        className="flex w-full flex-col justify-center"
      >
        <TabsList
          className={cn(
            "relative flex h-12 w-full justify-around rounded-xl border-1.5 border-foreground bg-salYellow/20",
            isAdmin && "scrollable invis max-w-[75dvw]",
          )}
        >
          {tabList.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium",
                activeTab === tab.id ? "text-black" : "text-muted-foreground",
              )}
            >
              {hasMounted && activeTab === tab.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 z-0 rounded-md border-1.5 border-foreground bg-background shadow-sm"
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10">
                {tab.id === "organizer" && "Organizer"}
                {tab.id === "event" &&
                  getEventCategoryLabel(eventData.category)}
                {!eventOnly && tab.id === "openCall" && "Open Call"}
                {isAdmin && tab.id === "admin" && "Admin"}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="organizer">
          <div id="organizer">
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
                    <th className="pr-4 align-top font-medium">Primary</th>
                    <td>
                      <OrganizerMainContact
                        organizer={orgData as OrgContactProps}
                        linkOnly
                      />
                    </td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Links</th>
                    <td>
                      <LinkList organizer={orgData} purpose="recap" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="event">
          <div id="event">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
              <table className="w-full table-auto border-separate border-spacing-y-2 self-start text-left text-sm">
                <tbody>
                  <tr>
                    <th className="first-child pr-4 align-top font-medium">
                      Logo
                    </th>
                    <td className="first-child">
                      {typeof eventData.logo === "string" && (
                        <Image
                          src={eventData.logo}
                          alt="Event Logo"
                          width={80}
                          height={80}
                          className={cn("size-20 rounded-full border-2")}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="pr-4 align-top font-medium">Name</th>
                    <td>{eventData.name}</td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Location</th>
                    <td>{eventData.location?.full}</td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Category</th>
                    <td>{getEventCategoryLabel(eventData.category)}</td>
                  </tr>

                  {eventData.type && eventData.type?.length > 0 && (
                    <tr>
                      <th className="pr-4 align-top font-medium">Type</th>
                      <td>
                        {Array.isArray(eventData.type)
                          ? getEventTypeLabel(eventData.type)
                          : getEventTypeLabel([eventData.type])}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <th className="pr-4 align-top font-medium">Dates</th>
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

                  {eventData.dates?.prodFormat !== "sameAsEvent" &&
                    eventData.dates?.eventFormat !== "ongoing" && (
                      <tr>
                        <th className="pr-4 align-top font-medium">
                          Production
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
                      Links
                    </th>
                    <td className="last-child">
                      <LinkList event={eventData} purpose="recap" />
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* <Separator
                thickness={2}
                orientation="vertical"
                className="my-4 mx-auto border-foreground/"
              /> */}
              <div className="space-y-6 pt-2">
                <Accordion type="multiple" defaultValue={[]}>
                  {eventData.about && (
                    <AccordionItem value="About">
                      {/* <p className="mb-1 text-sm font-medium">About</p> */}
                      <AccordionTrigger title="About" />
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
                      <AccordionTrigger title="Timeline" />
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
                      <AccordionTrigger title="Other Info" />
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
        </TabsContent>
        <TabsContent value="openCall">
          {!eventOnly && (
            <div id="openCall" className="text-sm">
              <div className="mt-4 flex flex-col gap-6">
                <section className="flex flex-col gap-3">
                  <span className="first-child pr-4 align-top font-medium">
                    Type:
                  </span>
                  <span className="first-child">
                    {getCallTypeLabel(eventData?.hasOpenCall ?? "")}
                  </span>
                </section>

                <section className="flex flex-col gap-3">
                  <span className="pr-4 align-top font-medium">Format</span>
                  <span>
                    {getCallFormatLabel(ocData?.basicInfo?.callFormat ?? "")}
                  </span>
                </section>

                <section className="flex flex-col gap-3">
                  <span className="pr-4 align-top font-medium">Deadline</span>
                  <span>
                    {eventData?.hasOpenCall !== "Rolling" ? (
                      formatOpenCallDeadline(
                        ocData?.basicInfo?.dates?.ocEnd || "",
                        ocData?.basicInfo?.dates?.timezone || "Europe/Berlin",
                        eventData?.hasOpenCall,
                      )
                    ) : (
                      <p className="italic">N/A</p>
                    )}
                  </span>
                </section>
                <section className="flex flex-col gap-3">
                  <span className="pr-4 align-top font-medium">
                    Eligibility
                  </span>
                  <span>
                    <EligibilityLabel
                      type={
                        (ocData?.eligibility?.type as EligibilityType) ?? null
                      }
                      whom={ocData?.eligibility?.whom ?? []}
                    />
                  </span>
                </section>
                {ocData?.selectionCriteria && (
                  <section className="flex flex-col gap-3">
                    <span className="pr-4 align-top font-medium">
                      Selection Criteria
                    </span>
                    <span>{ocData.selectionCriteria}</span>
                  </section>
                )}

                {typeof ocData?.basicInfo?.appFee === "number" &&
                  ocData?.basicInfo?.appFee > 0 && (
                    <section className="flex flex-col gap-3">
                      <span className="pr-4 align-top font-medium">
                        App Fee
                      </span>
                      <span>{`$${ocData?.basicInfo?.appFee}`}</span>
                    </section>
                  )}

                <section className="flex flex-col gap-3">
                  <span className="pr-4 align-top font-medium">Budget</span>
                  <span>
                    {hasBudget &&
                      formatBudgetCurrency(
                        ocData?.compensation?.budget?.min,
                        ocData?.compensation?.budget?.max,
                        ocData?.compensation?.budget?.currency,
                        false,
                        ocData?.compensation?.budget?.allInclusive,
                      )}

                    {hasRate &&
                      formatRate(
                        ocData?.compensation?.budget?.rate,
                        ocData?.compensation?.budget?.unit,
                        ocData?.compensation?.budget?.currency,
                        true,
                      )}
                    {!hasBudget && !hasRate && <em>No Budget Provided</em>}
                  </span>
                </section>
                <div className="space-y-6 pt-2">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium">Application Link:</p>
                    <Link href={outputAppLink ?? "/thelist"} target="_blank">
                      {appLink}
                    </Link>
                    {mailLink && mailSubject && (
                      <p className="text-sm">Subject: {mailSubject}</p>
                    )}
                  </div>
                  <Accordion type="multiple" defaultValue={[]}>
                    <AccordionItem value="compensation">
                      <AccordionTrigger title="Compensation" />

                      <AccordionContent>
                        <span>
                          <OpenCallProvided
                            categories={ocData?.compensation?.categories}
                            allInclusive={
                              ocData?.compensation?.budget?.allInclusive
                            }
                            noBudgetInfo={!hasBudget}
                            currency={ocData?.compensation?.budget?.currency}
                          />
                          {ocData?.compensation?.budget?.moreInfo && (
                            <section className="flex flex-col gap-3">
                              <span className="last-child pr-4 align-top font-medium">
                                <p>Compensation</p> <p>(more info)</p>
                              </span>
                              <span className="last-child">
                                <RichTextDisplay
                                  html={
                                    ocData.compensation.budget.moreInfo || ""
                                  }
                                  className="text-sm"
                                />
                              </span>
                            </section>
                          )}
                        </span>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="multiple" defaultValue={[]}>
                    <AccordionItem value="Reqs">
                      <AccordionTrigger title="Requirements" />
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
                            isMobile={false}
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
        </TabsContent>
        <TabsContent value="admin">
          <Accordion
            type="multiple"
            defaultValue={["Organizer", "Event", "OpenCall"]}
          >
            <AccordionItem value="Organizer">
              <AccordionTrigger title="Organizer Data:" />
              <AccordionContent>
                <pre className="scrollable mini max-w-[74dvw] text-wrap text-sm text-foreground">
                  {JSON.stringify(orgData, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="Event">
              <AccordionTrigger title="Event Data:" />
              <AccordionContent>
                <pre className="scrollable mini max-w-[74dvw] text-wrap text-sm text-foreground">
                  {JSON.stringify(eventData, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="OpenCall">
              <AccordionTrigger title="Open Call Data:" />
              <AccordionContent>
                <pre className="scrollable mini max-w-[74dvw] text-wrap text-sm text-foreground">
                  {JSON.stringify(ocData, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
      <div className="flex flex-col gap-8">
        {!alreadyPaid && (
          <div className="flex items-start gap-3">
            <Checkbox
              size="size-5"
              checkSize="size-4"
              name="terms"
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(value) => {
                setAcceptedTerms(value === true);
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm text-foreground hover:cursor-pointer"
            >
              I have read and agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-sm underline underline-offset-2 hover:underline"
              >
                Terms and Conditions
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
        )}
        {submissionCost && !alreadyPaid && paidCall && (
          <div className="mt-4 flex w-full justify-end">
            <span className="items-baseline gap-2 text-right text-base font-medium text-foreground">
              Submission cost for this open call is:
              <span className={cn("flex items-start justify-end gap-2")}>
                (USD){" "}
                <span
                  className={cn("mr-5 flex items-center text-4xl font-bold")}
                >
                  <p className={cn(isEligibleForFree && "text-emerald-600")}>
                    ${isEligibleForFree ? 0 : submissionCost}
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
