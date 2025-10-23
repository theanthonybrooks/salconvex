import { DataTable } from "@/components/data-table/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import { Label } from "@/components/ui/label";
import LogoUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { Separator } from "@/components/ui/separator";
import { useStepper } from "@/components/ui/stepper";
import { TooltipSimple } from "@/components/ui/tooltip";
import { supportEmail } from "@/constants/siteInfo";
import {
  Event as EventType,
  getColumns,
} from "@/features/events/components/events-data-table/columns";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { OrgSearch } from "@/features/organizers/components/org-search";
import { cn } from "@/helpers/utilsFns";
import { EnrichedEvent } from "@/types/eventTypes";
import { AnimatePresence, motion } from "framer-motion";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Doc } from "~/convex/_generated/dataModel";

interface SubmissionFormOrgStepProps {
  isAdmin: boolean;
  isMobile: boolean;
  existingOrg: Doc<"organizations"> | null;
  existingEvent: Doc<"events"> | null;
  eventsData: EnrichedEvent[];
  existingOrgs: boolean;
  validOrgWZod: boolean;
  invalidOrgWZod: boolean;
  setExistingOrg: React.Dispatch<
    React.SetStateAction<Doc<"organizations"> | null>
  >;
  setExistingEvent: React.Dispatch<React.SetStateAction<Doc<"events"> | null>>;
  handleReset: () => void;
  orgValidationError: boolean;
  orgNameValid: boolean;
  orgLocationValid: boolean;
  orgDataValid: boolean;
  newOrgEvent: boolean;
  setNewOrgEvent: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRow: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedRow: Record<string, boolean>;
  furthestStep: number;
  preloadFlag?: boolean;
  dashboardView?: boolean;
  isSidebarCollapsed?: boolean;
}

const SubmissionFormOrgStep = ({
  isAdmin,
  isMobile,
  existingOrgs,
  existingOrg,
  // existingEvent,
  eventsData,
  validOrgWZod,
  invalidOrgWZod,
  setExistingOrg,
  handleReset,
  orgValidationError,
  orgNameValid,
  orgLocationValid,
  orgDataValid,
  newOrgEvent,
  setNewOrgEvent,
  setExistingEvent,
  setSelectedRow,
  selectedRow,
  furthestStep,
  preloadFlag,
  dashboardView,
  isSidebarCollapsed,
}: SubmissionFormOrgStepProps) => {
  const {
    control,
    watch,

    // unregister,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();

  // const currentValues = getValues();
  const [firstColVisible, setFirstColVisible] = useState(true);
  const [reset, setReset] = useState(false);
  const orgData = watch("organization");
  const eventName = watch("event.name");

  const orgName = orgData?.name ?? "";
  const bottomRef = useRef<HTMLParagraphElement | null>(null);
  const scrollTrigger = orgDataValid && existingOrg && furthestStep === 0;
  const { scrollRef } = useStepper();
  const sidebarCollapsed = !!isSidebarCollapsed;

  useEffect(() => {
    if (scrollTrigger && scrollRef.current) {
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        el?.scrollTo({ top: el?.scrollHeight, behavior: "smooth" });
      });
    }
  }, [scrollTrigger, scrollRef]);

  const handleRowSelect = (
    event: EventType | null,
    selection: Record<string, boolean>,
  ) => {
    const shouldBeNew = Object.keys(selection).length === 0;
    if (newOrgEvent !== shouldBeNew) {
      setNewOrgEvent(shouldBeNew);
    }
    setExistingEvent(event as EnrichedEvent);
    setSelectedRow(selection);
  };

  return (
    <div
      id="step-1-container"
      className={cn(
        "mx-auto flex h-full w-full flex-col gap-4 sm:w-[90%] lg:w-full xl:justify-center",
        existingOrg && "xl:grid xl:grid-cols-[40%_10%_50%] xl:gap-0",
        !firstColVisible && "xl:grid-cols-[0_10%_1fr] xl:gap-0",
      )}
    >
      <section
        id="first-section"
        className={cn(
          "mx-auto flex w-full flex-col items-center gap-y-6 self-start lg:self-center xl:justify-center",
          !firstColVisible && "invisible",
          !orgDataValid && "my-auto",
        )}
      >
        <section className="flex flex-col items-center justify-center">
          {!isAdmin && !dashboardView && (
            <>
              <div
                id="welcome-text"
                className="font-tanker text-[2.5em] lowercase tracking-wide text-foreground lg:text-[4em]"
              >
                Welcome{" "}
                <AnimatePresence>
                  {existingOrgs && validOrgWZod && (
                    <motion.span
                      key="back-text"
                      initial={{ opacity: 0, rotate: -10 }}
                      animate={{
                        opacity: 1,
                        rotate: [0, -10, 10, -8, 8, -5, 5, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      className="inline-block"
                    >
                      Back
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="hidden text-balance text-center text-xl lg:block lg:text-base">
                To start, select from an existing organization or create a new
                one!
              </p>
            </>
          )}
        </section>
        <div
          className={cn(
            "flex w-full grid-cols-[20%_auto] flex-col items-center lg:mx-auto lg:grid lg:max-w-[500px] lg:gap-6 lg:gap-x-4",
            "[&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
          )}
        >
          <div className="input-section">
            <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
            <p className="lg:text-xs">Organization</p>
          </div>
          <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
            <Label htmlFor="organization.name" className="sr-only">
              Organization Name
            </Label>
            <Controller
              name="organization.name"
              control={control}
              render={({ field }) => (
                <OrgSearch
                  id="organization.name"
                  value={field.value}
                  onChange={field.onChange}
                  isValid={validOrgWZod}
                  validationError={invalidOrgWZod}
                  onLoadClick={setExistingOrg}
                  onReset={() => {
                    handleReset();

                    setReset(true);
                    setTimeout(() => {
                      setReset(false);
                    }, 0);
                  }}
                  placeholder={
                    isMobile
                      ? "Search or enter new"
                      : "Search or enter new name"
                  }
                  className="mb-3 h-12 lg:mb-0 lg:h-20"
                  inputClassName="rounded-lg py-2 text-base lg:text-xl"
                />
              )}
            />
            {(orgValidationError ||
              (errors.organization?.name && orgName.length > 3)) && (
              <span className="mt-2 w-full text-center text-sm text-red-600">
                {errors.organization?.name?.message || (
                  <p>
                    Organization already exists.{" "}
                    <Link
                      href={`mailto:${supportEmail}?subject=${orgName} Access`}
                      className="underline"
                    >
                      Contact support
                    </Link>{" "}
                    for assistance and/or access.
                  </p>
                )}
              </span>
            )}
          </div>

          {(orgNameValid || isAdmin) && (
            <>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">Step 2: </p>
                <p className="lg:text-xs">Location</p>
              </div>
              <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="organization.location" className="sr-only">
                  Organization Location
                </Label>
                <Controller
                  name="organization.location"
                  control={control}
                  shouldUnregister={false}
                  render={({ field }) => (
                    <MapboxInputFull
                      id="organization.location"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      reset={reset}
                      disabled={!orgNameValid}
                      placeholder="Organization Location (city, state, country, etc)..."
                      className="mb-3 w-full lg:mb-0"
                      inputClassName="rounded-lg border-foreground "
                    />
                  )}
                />
                {errors.organization?.location && orgData?.location && (
                  <span className="mt-2 w-full text-center text-sm text-red-600">
                    {errors.organization?.location?.country?.message
                      ? errors.organization?.location?.country?.message
                      : errors.organization?.location?.full?.message
                        ? errors.organization?.location?.full?.message
                        : "Please select a location from the dropdown"}
                  </span>
                )}
              </div>
            </>
          )}

          {(orgLocationValid || isAdmin) && (
            <>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">Step 3: </p>
                <p className="lg:text-xs">Logo</p>
              </div>
              <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="organization.logo" className="sr-only">
                  Organization Logo
                </Label>
                <Controller
                  name="organization.logo"
                  control={control}
                  render={({ field }) => (
                    <LogoUploader
                      id="organization.logo"
                      onChangeAction={(file) => field.onChange(file)}
                      onRemoveAction={() => field.onChange(undefined)}
                      reset={reset}
                      disabled={!orgNameValid}
                      initialImage={existingOrg?.logo}
                      size={72}
                    />
                  )}
                />
              </div>
            </>
          )}
        </div>
      </section>
      {/* second half of first page */}
      {orgDataValid && existingOrg && (
        <>
          <Separator thickness={2} className="my-4 xl:hidden" />
          {existingOrg && (
            <div
              className="hidden w-full flex-col items-center gap-3 xl:flex"
              onClick={() => setFirstColVisible((prev) => !prev)}
            >
              <Separator
                thickness={2}
                className="mx-auto hidden h-[45%] hover:cursor-pointer xl:block"
                orientation="vertical"
              />
              <TooltipSimple content="Toggle full-width" side="right">
                {firstColVisible ? (
                  <LucideChevronLeft className="size-6 shrink-0 text-foreground/50 hover:scale-105 hover:cursor-pointer active:scale-95" />
                ) : (
                  <LucideChevronRight className="size-6 shrink-0 text-foreground/50 hover:scale-105 hover:cursor-pointer active:scale-95" />
                )}
              </TooltipSimple>
              <Separator
                thickness={2}
                className="mx-auto hidden h-[40%] hover:cursor-pointer xl:block"
                orientation="vertical"
              />
            </div>
          )}
          <section className="flex flex-col items-center justify-center gap-4">
            <div
              id="event-header"
              className="mb-2 flex w-full flex-col items-center justify-center gap-2 sm:flex-row"
            >
              <p className="font-tanker text-xl lowercase tracking-wide text-foreground sm:text-2xl">
                Select an existing Event/Project
              </p>
              <p className="text-sm italic text-muted-foreground">
                (or continue a draft)
              </p>
            </div>
            {!(dashboardView && !isAdmin) && (
              <div className="w-full rounded-lg border-2 border-dashed border-foreground/50 bg-salYellow/30 p-5">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2 md:items-center",
                    // existingEvent !== null &&
                    //   "pointer-events-none opacity-50 hover:cursor-default",
                  )}
                >
                  <Checkbox
                    // disabled={existingEvent !== null}
                    tabIndex={4} //todo: update this to check if user has existing events and if so, direct them to the search input on the data table
                    id="newEvent"
                    className="focus-visible:bg-salPink/50 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-salPink focus-visible:ring-offset-1 focus-visible:data-[selected=true]:bg-salPink/50"
                    checked={eventsData?.length === 0 ? true : newOrgEvent}
                    // onCheckedChange={(checked) => {
                    //   setExistingEvent(null);
                    //   if (eventsData?.length === 0) {
                    //     setNewOrgEvent(true);
                    //   } else {
                    //     setNewOrgEvent(!!checked);
                    //   }
                    // }}
                    onCheckedChange={(checked) => {
                      setExistingEvent(null);
                      const newValue =
                        eventsData?.length === 0 ? true : !!checked;
                      if (newValue !== newOrgEvent) {
                        setNewOrgEvent(newValue);
                      }
                    }}
                  />

                  <span className="hidden text-sm sm:block">
                    I&apos;d like to create a new event/project
                  </span>
                  <span className="text-sm sm:hidden">
                    Add a new event/project
                  </span>
                </label>
              </div>
            )}
            <DataTable
              columns={getColumns(false)}
              data={eventsData}
              defaultVisibility={{
                _id: false,
                type: false,
                category: false,
                lastEditedAt: false,
                submissionState: false,
                // dates_edition: false,
                state: false,
                openCallState: false,
              }}
              minimalView={
                dashboardView && firstColVisible && !sidebarCollapsed
              }
              initialSearchTerm={preloadFlag ? eventName : undefined}
              onRowSelect={handleRowSelect}
              selectedRow={selectedRow}
              className="w-full overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn(
                "lg:hidden",
                newOrgEvent && "opacity-80",
                dashboardView ? "max-w-full" : "max-w-[74dvw] sm:max-w-full",
              )}
              tableType="events"
              pageType="form"
              defaultSort={{ id: "lastEditedAt", desc: true }}
              pageSize={5}
              adminActions={{ isAdmin }}
            />
            <DataTable
              columns={getColumns(false)}
              data={eventsData}
              minimalView={
                dashboardView && firstColVisible && !sidebarCollapsed
              }
              initialSearchTerm={preloadFlag ? eventName : undefined}
              onRowSelect={handleRowSelect}
              selectedRow={selectedRow}
              className="flex w-full max-w-[90vw] overflow-x-auto"
              tableClassName="sm:max-h-52"
              outerContainerClassName={cn(
                "hidden lg:block xl:hidden  ",
                newOrgEvent && "opacity-80",
              )}
              tableType="events"
              pageType="form"
              defaultSort={{ id: "lastEditedAt", desc: true }}
              adminActions={{ isAdmin }}
              defaultVisibility={{
                _id: false,
                submissionState: false,
                lastEditedAt: sidebarCollapsed,
                category: sidebarCollapsed,
                type: sidebarCollapsed,
              }}
            />
            <DataTable
              columns={getColumns(false)}
              data={eventsData}
              minimalView={
                dashboardView && firstColVisible && !sidebarCollapsed
              }
              initialSearchTerm={preloadFlag ? eventName : undefined}
              onRowSelect={handleRowSelect}
              selectedRow={selectedRow}
              defaultVisibility={{
                _id: false,
                submissionState: false,
                category: !firstColVisible && sidebarCollapsed,
                type: !firstColVisible && sidebarCollapsed,
                lastEditedAt: !firstColVisible && sidebarCollapsed,
              }}
              className={cn(
                "flex w-full max-w-[45vw] overflow-x-auto",
                !firstColVisible && "max-w-full",
              )}
              tableClassName="sm:max-h-52"
              outerContainerClassName={cn(
                "hidden xl:block ",
                newOrgEvent && "opacity-80",
              )}
              tableType="events"
              pageType="form"
              defaultSort={{ id: "lastEditedAt", desc: true }}
              adminActions={{ isAdmin }}
            />

            <p
              ref={bottomRef}
              className="mt-2 text-pretty text-center text-xs italic text-muted-foreground"
            >
              Past events are no longer editable but are still viewable and able
              to be used as a template for new events.
            </p>
          </section>
        </>
      )}
    </div>

    //   )}
  );
};

export default SubmissionFormOrgStep;
