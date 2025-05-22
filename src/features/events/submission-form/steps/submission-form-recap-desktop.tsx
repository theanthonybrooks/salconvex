// TODO: Add the terms of service checkboxes

"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
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
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label";
import { OpenCallProvided } from "@/features/events/open-calls/components/open-call-provided";
import { hasId, OpenCallFilesTable } from "@/features/files/form-file-list";
import { OrganizerCardLogoName } from "@/features/organizers/components/organizer-logo-name-card";
import {
  OrganizerMainContact,
  OrgContactProps,
} from "@/features/organizers/components/organizer-main-contact";
import { formatOpenCallDeadline } from "@/lib/dateFns";
import {
  formatCurrency,
  formatRate,
  getCallTypeLabel,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns";
import { getCallFormatLabel } from "@/lib/openCallFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import { EligibilityType } from "@/types/openCall";
import Image from "next/image";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Id } from "~/convex/_generated/dataModel";

interface SubmissionFormRecapDesktopProps {
  formType: number;
  isAdmin: boolean;
  setAcceptedTerms: (value: boolean) => void;
  setInfoVerified: (value: boolean) => void;
  infoVerified: boolean;
  acceptedTerms: boolean;
  isEligibleForFree: boolean;
  submissionCost: number | undefined;
  alreadyPaid: boolean;
}

export const SubmissionFormRecapDesktop = ({
  formType,
  isAdmin,
  setAcceptedTerms,
  setInfoVerified,
  infoVerified,
  acceptedTerms,
  submissionCost,
  isEligibleForFree,
  alreadyPaid,
}: SubmissionFormRecapDesktopProps) => {
  const eventOnly = formType === 1;
  const paidCall = formType === 3;
  const {
    // getValues,
    watch,
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
  ];
  const [activeTab, setActiveTab] = useState("organizer");
  const hasBudget =
    typeof ocData?.compensation?.budget?.min === "number" &&
    ocData?.compensation?.budget?.min > 0;
  const hasRate =
    typeof ocData?.compensation?.budget?.rate === "number" &&
    ocData?.compensation?.budget?.rate > 0;

  return (
    <div className="flex flex-col gap-y-8">
      <NavTabs
        tabs={tabList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="form-recap hidden lg:block"
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
                    Primary Contact
                  </th>
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
            {!alreadyPaid && (
              <div className="space-y-6 border-l-2 border-foreground/10 px-8">
                <div className="flex h-full w-full justify-end">
                  <div className="flex h-full flex-col items-end justify-center gap-4">
                    <p className="text-sm text-foreground">
                      By continuing, you confirm that you have read and agree to
                      the{" "}
                      <Link
                        href="/terms"
                        className="underline underline-offset-2 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="underline underline-offset-2 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </p>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
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
                          I agree and would like to post my event and/or open
                          call.
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          name="info"
                          id="info"
                          checked={infoVerified}
                          onCheckedChange={(value) =>
                            setInfoVerified(value === true)
                          }
                        />
                        <label
                          htmlFor="info"
                          className="text-sm text-foreground hover:cursor-pointer"
                        >
                          I verify that all information provided is accurate and
                          complete.
                          {/* I verify that all information provided is accurate and
                          complete and that I have permission to submit this as
                          the organizer (or other person with the necessary
                          authority). */}
                        </label>
                        {/* <pre className="text-sm text-foreground">
                          {JSON.stringify(ocData, null, 2)}
                        </pre> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div id="event" className="px-4">
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
                  <th className="pr-4 align-top font-medium">Event Dates</th>
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
                        Production Dates
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
            <div className="space-y-6 border-l-2 border-foreground/10 px-8 pt-2">
              <Accordion type="multiple" defaultValue={["About", "OtherInfo"]}>
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
                    <th className="pr-4 align-top font-medium">Format</th>
                    <td>
                      {getCallFormatLabel(ocData?.basicInfo?.callFormat ?? "")}
                    </td>
                  </tr>

                  <tr>
                    <th className="pr-4 align-top font-medium">Deadline</th>
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
                    <th className="pr-4 align-top font-medium">Eligibility</th>
                    <td>
                      <EligibilityLabel
                        type={ocData?.eligibility?.type as EligibilityType}
                        whom={ocData?.eligibility?.whom ?? []}
                      />
                    </td>
                  </tr>

                  {typeof ocData?.basicInfo?.appFee === "number" &&
                    ocData?.basicInfo?.appFee > 0 && (
                      <tr>
                        <th className="pr-4 align-top font-medium">App Fee</th>
                        <td>{`$${ocData?.basicInfo?.appFee}`}</td>
                      </tr>
                    )}

                  <tr>
                    <th className="pr-4 align-top font-medium">Budget</th>
                    <td>
                      {hasBudget &&
                        formatCurrency(
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
                      {!hasBudget && <em>No Budget Provided</em>}
                    </td>
                  </tr>
                  <tr>
                    <th className="last-child pr-4 align-top font-medium">
                      Compensation
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
                        <p>Compensation</p> <p>(more info)</p>
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
                  <Link
                    href={ocData?.requirements?.applicationLink ?? "/thelist"}
                    target="_blank"
                  >
                    {ocData?.requirements?.applicationLink}
                  </Link>
                </div>
                <Accordion
                  type="multiple"
                  defaultValue={["Reqs", "Docs", "links"]}
                >
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
      </NavTabs>
      {submissionCost && !alreadyPaid && paidCall && (
        <div className="mt-4 flex w-full justify-end">
          <span className="items-baseline gap-2 text-lg font-semibold text-foreground">
            Submission cost for this event/open call is:
            <span className={cn("flex items-start justify-end gap-2")}>
              (USD){" "}
              <p
                className={cn(
                  isEligibleForFree && "line-through",
                  "text-4xl font-bold",
                )}
              >
                ${submissionCost}
              </p>
              {isEligibleForFree ? 0 : ""}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
