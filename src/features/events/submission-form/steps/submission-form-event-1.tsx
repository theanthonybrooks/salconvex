import { MultiSelect } from "@/components/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDatePicker } from "@/components/ui/form-date-pickers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EventNameSearch } from "@/features/events/components/event-search";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import {
  EventCategory,
  eventTypeOptions,
  noEventCategories,
} from "@/types/event";
import { User } from "@/types/user";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";

interface SubmissionFormEventStep1Props {
  user: User | undefined;
  isAdmin: boolean;
  isMobile: boolean;
  existingOrg: Doc<"organizations"> | null;
  existingEvent: Doc<"events"> | null;
  categoryEvent: boolean;
  canNameEvent: boolean;
  formType: number;
}

const SubmissionFormEventStep1 = ({
  user,
  // isAdmin,
  isMobile,
  existingOrg,
  existingEvent,
  categoryEvent,
  canNameEvent,
  formType,
}: SubmissionFormEventStep1Props) => {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<EventOCFormValues>();
  // const currentValues = getValues();

  const [eventNameErrorValue, setEventNameErrorValue] = useState<string | null>(
    null,
  );
  const currentYear = new Date().getFullYear();
  const currentValues = getValues();
  const eventData = watch("event");
  // const initialName = useRef(existingEvent?.name ?? "");
  const eventName = eventData?.name;
  const hasEventName = !!eventName && eventName.trim().length >= 3;
  const eventDates = eventData?.dates?.eventDates;

  const eventEdition = eventData?.dates?.edition;
  const eventState = eventData?.state;
  const archivedEvent = eventState === "archived";
  // console.log(eventData);
  const category = eventData?.category as EventCategory;
  const noEvent = noEventCategories.includes(category);

  // console.log(previousEventNameValid);
  // #region ------------- Queries, Actions, and Mutations --------------
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const lastValidated = useRef<{
    name: string;
    edition: number | undefined;
    orgId: string | undefined;
  } | null>(null);

  const comboChanged =
    !lastValidated.current ||
    lastValidated.current.name !== eventName ||
    lastValidated.current.edition !== eventEdition ||
    lastValidated.current.orgId !== existingOrg?._id;

  const shouldValidate = hasEventName && comboChanged;

  const {
    isSuccess: eventNameValid,
    isError: eventNameExists,
    error: eventNameError,
  } = useQueryWithStatus(
    api.events.event.checkEventNameExists,
    shouldValidate
      ? {
          name: eventName,
          organizationId: existingOrg?._id,
          eventId: existingEvent?._id,
          edition: eventEdition,
        }
      : "skip",
  );

  // console.log(eventNameError);
  // #endregion

  // console.log(eventNameValid);
  const nameValidTrigger = eventNameValid || (!comboChanged && hasEventName);

  const eventNameIsDirty = dirtyFields.event?.name ?? false;
  const hasEventLocation =
    (dirtyFields.event?.location || eventData?.location?.full !== undefined) &&
    nameValidTrigger;
  const isOngoing = eventData?.dates?.eventFormat === "ongoing";
  const eventDatesFormat = eventData?.dates?.eventFormat;
  const hasEventFormat = !!eventData?.dates?.eventFormat;
  const prodDatesFormat = eventData?.dates?.prodFormat;

  const eventDateFormatRequired = !!(
    hasEventFormat &&
    eventDatesFormat &&
    ["setDates", "monthRange", "yearRange", "seasonRange"].includes(
      eventDatesFormat,
    )
  );
  const eventDateFormatNotRequired = !!(
    hasEventFormat &&
    eventDatesFormat &&
    ["noEvent"].includes(eventDatesFormat)
  );

  const prodSameAsEvent = eventData?.dates?.prodFormat === "sameAsEvent";
  const blankEventDates =
    eventDates?.[0]?.start === "" || eventDates?.[0]?.end === "";
  const orgData = watch("organization");
  const isAdmin = user?.role?.includes("admin") || false;
  const eventOnly = formType === 1;

  useEffect(() => {
    if (noEvent && prodDatesFormat !== "noProd") {
      setValue("event.dates.prodFormat", "noProd");
      setValue("event.dates.prodDates", [{ start: "", end: "" }]);
    }
  }, [noEvent, setValue, prodDatesFormat]);

  useEffect(() => {
    if (formType === 1) {
      setValue("event.category", "event");
      // setValue("event.hasOpenCall", "False");
    }
  }, [formType, setValue]);

  useEffect(() => {
    if (eventNameError) {
      if (eventNameError instanceof ConvexError) {
        setEventNameErrorValue(eventNameError.data);
      }
    }
  }, [eventNameError]);

  useEffect(() => {
    if (eventNameValid) {
      lastValidated.current = {
        name: eventName!,
        edition: eventEdition,
        orgId: existingOrg?._id,
      };
    }
  }, [eventNameValid, eventName, eventEdition, existingOrg]);

  return (
    <div
      id="step-1-container"
      className={cn(
        "flex h-full flex-col gap-4 xl:justify-center",
        "mx-auto w-full sm:w-[90%] lg:w-full",
        "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[45%_10%_45%] xl:gap-0",
      )}
    >
      <div
        className={cn(
          "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
          "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
          "mx-auto xl:max-w-full xl:py-10 4xl:my-auto",
          "lg:max-w-[60dvw]",

          // "xl:self-center",
        )}
      >
        {!eventOnly && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
              <p className="lg:text-xs">Category</p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.category" className="sr-only">
                Event Category
              </Label>
              <Controller
                name="event.category"
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      onValueChange={(value: EventCategory) => {
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-12 w-full border bg-card text-center text-base sm:h-[50px]",
                          errors.event?.category && "invalid-field",
                        )}
                      >
                        <SelectValue placeholder="(select one)" />
                      </SelectTrigger>
                      <SelectContent className="min-w-auto">
                        <SelectItem fit value="event">
                          Event
                        </SelectItem>
                        <SelectItem fit value="project">
                          Project
                        </SelectItem>
                        <SelectItem fit value="residency">
                          Residency
                        </SelectItem>
                        <SelectItem fit value="gfund">
                          Grant/Fund
                        </SelectItem>
                        <SelectItem fit value="roster">
                          Artist Roster
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>
          </>
        )}

        {categoryEvent && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">
                Step {eventOnly ? 1 : 2}:
              </p>
              <p className="lg:text-xs">Event Type</p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.type" className="sr-only">
                Event Type
              </Label>
              <Controller
                name="event.type"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    id="event.type"
                    className={cn(
                      "h-12 border bg-card sm:h-[50px]",
                      errors.event?.type && "invalid-field",
                    )}
                    badgeClassName="py-2 lg:py-2 lg:text-sm bg-card"
                    textClassName="text-base"
                    options={[...eventTypeOptions]}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value ?? []}
                    shortResults={isMobile}
                    placeholder="Select up to 2 event types"
                    variant="basic"
                    maxCount={1}
                    limit={2}
                    height={10}
                    shiftOffset={-10}
                    hasSearch={false}
                    selectAll={false}
                    tabIndex={4}
                  />
                )}
              />
            </div>
          </>
        )}
        {canNameEvent && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">
                Step {categoryEvent && !eventOnly ? 3 : 2}:{" "}
              </p>
              <p className="lg:text-xs">
                {getEventCategoryLabelAbbr(category)} Name + Edition
              </p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <div className="flex w-full gap-2">
                <Label htmlFor="event.name" className="sr-only">
                  {getEventCategoryLabelAbbr(category)} Name
                </Label>
                <Controller
                  name="event.name"
                  control={control}
                  render={({ field }) => (
                    <EventNameSearch
                      value={field.value}
                      isExisting={eventNameExists}
                      onChange={field.onChange}
                      className={cn(
                        "border bg-card !text-base sm:h-[50px]",
                        errors.event?.name &&
                          dirtyFields.event?.name &&
                          "invalid-field",
                      )}
                    />
                  )}
                />
                <Label htmlFor="event.dates.edition" className="sr-only">
                  {getEventCategoryLabelAbbr(category)} Edition
                </Label>
                <Controller
                  name="event.dates.edition"
                  control={control}
                  render={({ field }) => (
                    <Input
                      disabled={archivedEvent}
                      type="number"
                      min={2000}
                      max={3000}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value ?? currentYear}
                      className={cn(
                        "h-12 w-25 border border-foreground bg-card !text-base sm:h-[50px]",
                        errors.event?.dates?.edition && "invalid-field",
                      )}
                    />
                  )}
                />
              </div>
              {eventNameExists && eventNameIsDirty && (
                <span className="mt-2 w-full text-center text-sm text-red-600">
                  {/* {category === "event"
                    ? "An event with that name already exists."
                    : `A ${getEventCategoryLabelAbbr(category)} with this name already exists.`} */}
                  {eventNameErrorValue}
                </span>
              )}
            </div>
            {nameValidTrigger && (
              <>
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">
                    Step {categoryEvent && !eventOnly ? 4 : 3}:{" "}
                  </p>
                  <p className="lg:text-xs">Location</p>
                </div>

                <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="event.name" className="sr-only">
                    {getEventCategoryLabelAbbr(category)} Location
                  </Label>

                  <Controller
                    name="event.location"
                    control={control}
                    render={({ field }) => (
                      <MapboxInputFull
                        id="event.location"
                        isEvent
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        reset={eventNameExists}
                        tabIndex={2}
                        placeholder="Event Location (if different from organization)..."
                        className="mb-3 w-full lg:mb-0"
                        inputClassName={cn(
                          "rounded-lg border-foreground disabled:opacity-50 bg-card",
                          errors.event?.location && "invalid-field",
                        )}
                      />
                    )}
                  />
                </div>
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">
                    Step {categoryEvent && !eventOnly ? 5 : 4}:{" "}
                  </p>
                  <p className="lg:text-xs">
                    {getEventCategoryLabelAbbr(category)} Logo
                  </p>
                </div>
                <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="organization.logo" className="sr-only">
                    Event/Project Logo
                  </Label>
                  <Controller
                    name="event.logo"
                    control={control}
                    render={({ field }) => (
                      <AvatarUploader
                        id="event.logo"
                        onChange={(file) => field.onChange(file)}
                        onRemove={() =>
                          field.onChange(orgData?.logo ?? "1.jpg")
                        }
                        reset={eventNameExists}
                        disabled={eventNameExists}
                        initialImage={
                          typeof field.value === "string"
                            ? field.value
                            : undefined
                        }
                        size={72}
                        tabIndex={3}
                        className={cn("pb-3")}
                      />
                    )}
                  />
                </div>
                {canNameEvent && (
                  <>
                    <div className="input-section h-full">
                      <p className="min-w-max font-bold lg:text-xl">
                        Step {categoryEvent && !eventOnly ? 6 : 5}:{" "}
                      </p>
                      <p className="lg:text-xs">
                        {getEventCategoryLabelAbbr(category)} Details/Notes
                      </p>
                    </div>

                    <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:max-w-md lg:min-w-[300px] lg:max-w-md">
                      <Label htmlFor="event.name" className="sr-only">
                        {getEventCategoryLabelAbbr(category)} About
                      </Label>
                      <Controller
                        name="event.about"
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Short blurb about your project/event... "
                            charLimit={2500}
                            noList={true}
                          />
                        )}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      {hasEventLocation && (
        <>
          <Separator
            thickness={2}
            className="mx-auto hidden xl:block"
            orientation="vertical"
          />
          <div
            className={cn(
              "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
              "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
              "mx-auto xl:max-w-full xl:py-10 4xl:my-auto",
              "lg:max-w-[60dvw]",
              // "xl:self-center",
            )}
          >
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">
                Step {categoryEvent && !eventOnly ? 7 : 6}:{" "}
              </p>
              <p className="lg:text-xs">
                {getEventCategoryLabelAbbr(category)} Dates
              </p>
            </div>

            <FormDatePicker
              isAdmin={isAdmin}
              title="Event Dates Format"
              nameBase="event.dates"
              type="event"
              watchPath="event"
            />

            {!isOngoing &&
              !noEvent &&
              hasEventFormat &&
              (!blankEventDates || eventDateFormatNotRequired) && (
                <>
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step {categoryEvent && !eventOnly ? 8 : 7}:{" "}
                    </p>
                    <p className="lg:text-xs">Production Dates</p>
                  </div>

                  <FormDatePicker
                    isAdmin={isAdmin}
                    title="Production Dates Format"
                    nameBase="event.dates"
                    type="production"
                    watchPath="event"
                  />
                  {!prodSameAsEvent && (
                    <label
                      className={cn(
                        "col-start-2 mx-auto flex cursor-pointer items-center gap-2 py-2",
                      )}
                    >
                      <Controller
                        name="event.dates.noProdStart"
                        control={control}
                        render={({ field }) => {
                          return (
                            <Checkbox
                              disabled={
                                isOngoing ||
                                !hasEventFormat ||
                                (blankEventDates && eventDateFormatRequired)
                              }
                              tabIndex={4}
                              id="noProdStart"
                              className="focus-visible:bg-salPink/50 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-salPink focus-visible:ring-offset-1 focus-visible:data-[selected=true]:bg-salPink/50"
                              checked={field.value || false}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  setValue("event.dates.prodDates", [
                                    {
                                      start: "",
                                      end: currentValues.event.dates?.prodDates
                                        ? currentValues.event.dates.prodDates[0]
                                            ?.end
                                        : "",
                                    },
                                  ]);
                                }
                                // if (blankProdStart) {
                                //   setNoProdStart(true);
                                // } else if (hasProdDateAndFormat) {
                                //   setNoProdStart(false);
                                // }
                              }}
                            />
                          );
                        }}
                      />

                      <span className={cn("text-sm")}>
                        The beginning production date is flexible/open
                      </span>
                    </label>
                  )}
                </>
              )}
            {hasEventFormat && (
              <>
                <div className="input-section h-full">
                  <p className="min-w-max font-bold lg:text-xl">
                    Step{" "}
                    {categoryEvent && !eventOnly
                      ? 9
                      : isOngoing || noEvent
                        ? 7
                        : 8}
                    :{" "}
                  </p>
                  <p className="lg:text-xs">
                    {getEventCategoryLabelAbbr(category)} Timeline
                  </p>
                </div>

                <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:max-w-md lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="event.timeline" className="sr-only">
                    {getEventCategoryLabelAbbr(category)} Timeline
                  </Label>
                  <Controller
                    name="event.timeLine"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Important dates: open call, production, judging/selection, etc"
                        charLimit={1000}
                        noList={false}
                      />
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>

    //   )}
  );
};

export default SubmissionFormEventStep1;
