{
  /*import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/features/artists/applications/data-table/data-table";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { OrgSearch } from "@/features/organizers/components/org-search";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Controller, useFormContext } from "react-hook-form";
import { Doc } from "~/convex/_generated/dataModel";

interface SubmissionFormOrgStepProps {
  activeStep: number;
  existingOrg: Doc<"organizations"> | null;
}

const SubmissionFormOrgStep = ({
  activeStep,
  existingOrg,
}: SubmissionFormOrgStepProps) => {
  const {
    control,
    watch,
    setValue,
    getValues,
    setError,
    trigger,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();
  return (
    //   {activeStep === 0 && ( //pass this from the parent, not here
    <>
      <div
        id="step-1-container"
        className={cn(
          "flex h-full flex-col gap-4 xl:justify-center",
          existingOrg && "xl:grid xl:grid-cols-[40%_10%_50%] xl:gap-0",
        )}
      >
        <section
          id="first-section"
          className="mx-auto flex flex-col items-center gap-y-6 self-start xl:justify-center xl:self-center"
        >
          <section className="flex flex-col items-center justify-center">
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
                    onReset={handleReset}
                    placeholder="Search or enter new name"
                    className="mb-3 h-12 lg:mb-0 lg:h-20"
                    inputClassName="rounded-lg py-2 text-base lg:text-xl"
                    tabIndex={1}
                  />
                )}
              />
              {(orgValidationError ||
                (errors.organization?.name && orgName.length > 3)) && (
                <span className="mt-2 w-full text-center text-sm text-red-600">
                  {errors.organization?.name?.message ||
                    "Organization already exists. Contact support for assistance"}
                </span>
              )}
            </div>

            {orgNameValid && (
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
                    render={({ field }) => (
                      <MapboxInputFull
                        id="organization.location"
                        value={field.value}
                        onChange={field.onChange}
                        reset={!validOrgWZod}
                        tabIndex={2}
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

            {orgLocationValid && (
              <>
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">Step 3: </p>
                  <p className="lg:text-xs">Logo</p>
                </div>
                <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="organization.logo" className="sr-only">
                    Organization Logo
                    /~ <span className="text-xs italic text-muted-foreground">
                            {required ? "(required)" : "(optional)"}
                          </span> ~/
                  </Label>
                  <Controller
                    name="organization.logo"
                    control={control}
                    render={({ field }) => (
                      <AvatarUploader
                        id="organization.logo"
                        onChange={(file) => field.onChange(file)}
                        onRemove={() => field.onChange(undefined)}
                        reset={!validOrgWZod}
                        disabled={!orgNameValid}
                        initialImage={existingOrg?.logo}
                        size={72}
                        tabIndex={3}
                      />
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </section>
        /~ second half of first page ~/
        {orgDataValid && existingOrg && (
          <>
            <Separator thickness={2} className="my-4 xl:hidden" />
            {existingOrg && (
              <Separator
                thickness={2}
                className="mx-auto hidden xl:block"
                orientation="vertical"
              />
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
              <DataTable
                columns={columns}
                data={eventsData}
                defaultVisibility={{
                  eventCategory: false,
                  lastEditedAt: false,
                }}
                onRowSelect={(event, selection) => {
                  if (newOrgEvent) {
                    setNewOrgEvent(false);
                  }
                  setExistingEvent(event as Doc<"events">);
                  setSelectedRow(selection);
                }}
                selectedRow={selectedRow}
                className="w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
                containerClassName={cn(
                  "lg:hidden",
                  newOrgEvent && "opacity-50",
                )}
              />
              <DataTable
                columns={columns}
                data={eventsData}
                onRowSelect={(event, selection) => {
                  if (newOrgEvent) {
                    setNewOrgEvent(false);
                  }
                  setExistingEvent(event as Doc<"events">);
                  setSelectedRow(selection);
                }}
                selectedRow={selectedRow}
                className="flex w-full max-w-[90vw] overflow-x-auto"
                containerClassName={cn(
                  "hidden lg:block xl:hidden  ",
                  newOrgEvent && "opacity-50",
                )}
              />
              <DataTable
                columns={columns}
                data={eventsData}
                onRowSelect={(event, selection) => {
                  if (newOrgEvent) {
                    setNewOrgEvent(false);
                  }
                  setExistingEvent(event as Doc<"events">);
                  setSelectedRow(selection);
                }}
                selectedRow={selectedRow}
                defaultVisibility={{
                  eventCategory: false,
                  // lastEditedAt: false,
                }}
                className="flex w-full max-w-[90vw] overflow-x-auto"
                containerClassName={cn(
                  "hidden xl:block ",
                  newOrgEvent && "opacity-50 pointer-events-none",
                )}
              />
              /~ 
                          <span>or</span> ~/
              /~ <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setExistingEvent(null);
                            }}
                          >
                            Create New Event
                          </Button> ~/

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 md:items-center",
                  existingEvent !== null &&
                    "pointer-events-none opacity-50 hover:cursor-default",
                )}
              >
                <Checkbox
                  disabled={existingEvent !== null}
                  tabIndex={4} //todo: update this to check if user has existing events and if so, direct them to the search input on the data table
                  id="newEvent"
                  className="focus-visible:bg-salPink/50 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-salPink focus-visible:ring-offset-1 focus-visible:data-[selected=true]:bg-salPink/50"
                  checked={eventsData?.length === 0 ? true : newOrgEvent}
                  onCheckedChange={(checked) => {
                    setExistingEvent(null);
                    if (eventsData?.length === 0) {
                      setNewOrgEvent(true);
                    } else {
                      setNewOrgEvent(!!checked);
                    }
                  }}
                />
                {eventsData?.length > 0 ? (
                  <span className={cn("text-sm")}>
                    No thanks, I&apos;d like to create a new event/project
                  </span>
                ) : (
                  <span className="text-sm">
                    I&apos;d like to create a new event/project
                  </span>
                )}
              </label>
              <p className="mt-2 text-center text-xs italic text-muted-foreground">
                Past events are no longer editable but are still viewable and
                able to be used as a template for new events.
              </p>
            </section>
          </>
        )}
      </div>
    </>
    //   )}
  );
};

export default SubmissionFormOrgStep;
*/
}
