import { currencies, Currency } from "@/app/data/currencies";
import { Link } from "@/components/ui/custom-link";
import { OcCustomDatePicker } from "@/components/ui/date-picker/oc-date-picker";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { Label } from "@/components/ui/label";
import { SearchMappedSelect } from "@/components/ui/mapped-select";
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { siteUrl } from "@/constants/siteInfo";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { sortedGroupedCountries } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { CallFormat, EligibilityType } from "@/types/openCall";
import { User } from "@/types/user";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { registerPlugin } from "react-filepond";
import { Controller, useFormContext } from "react-hook-form";
import { Country } from "world-countries";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

import { DebouncedControllerNumInput } from "@/components/ui/debounced-form-num-input";
import { ExternalLinksInput } from "@/features/events/open-calls/components/external-links-input";
import { FilePondInput } from "@/features/files/filepond";
import { hasId, OpenCallFilesTable } from "@/features/files/form-file-list";
import { autoHttps } from "@/lib/linkFns";
import "filepond/dist/filepond.min.css";
import { Id } from "~/convex/_generated/dataModel";

interface SubmissionFormOC1Props {
  user: User | undefined;
  isAdmin: boolean;
  isMobile: boolean;
  categoryEvent: boolean;
  canNameEvent: boolean;
  handleCheckSchema: () => void;
  formType: number;
  pastEvent: boolean;
}

const SubmissionFormOC1 = ({
  // user,
  isAdmin,
  isMobile,
  formType,

  // categoryEvent,

  handleCheckSchema,
  pastEvent: pastEventCheck,
}: SubmissionFormOC1Props) => {
  const {
    control,
    watch,
    setValue,
    register,

    // getValues,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();
  const appLinkFormat =
    watch("openCall.requirements.applicationLinkFormat") ?? "https://";

  const pastEvent = pastEventCheck && !isAdmin;
  const freeCall = formType === 2;
  const [hasAppFee, setHasAppFee] = useState<"true" | "false" | "">("");

  const openCall = watch("openCall");
  const organizer = watch("organization");
  const eventName = watch("event.name");
  const eventId = watch("event._id");
  const eventType = watch("event.type");
  const callType = watch("event.hasOpenCall");

  const pupstick = eventType?.includes("pup");
  const isDraft = openCall?.state === "draft";
  const orgTimezone = organizer?.location?.timezone;
  const callFormat = openCall?.basicInfo?.callFormat;
  const fixedType = callType === "Fixed";
  const emailType = callType === "Email";
  const ocEligiblityType = openCall?.eligibility?.type;
  const ocEligibilityWhom = openCall?.eligibility?.whom;
  const isNational = ocEligiblityType === "National";
  const isInternational = ocEligiblityType === "International";
  const eligDetails = openCall?.eligibility?.details ?? "";
  const appDetails = openCall?.requirements?.requirements ?? "";
  const showAppFeeInput = hasAppFee?.trim() === "true";
  const hasRequiredDetails =
    eligDetails.trim().length > 10 || isInternational || isNational;
  const hasAppRequiredDetails = appDetails?.trim().length > 10 || isAdmin;
  const appLink = openCall?.requirements?.applicationLink ?? "";

  const hasAppLink = appLink?.trim().length > 10;
  const appFee = openCall?.basicInfo?.appFee;
  const validAppFeeAmount = typeof appFee === "number" && appFee > 0;
  const noAppFeeAmount = typeof appFee === "number" && appFee === 0;
  const ocStart = openCall?.basicInfo?.dates?.ocStart;
  const ocEnd = openCall?.basicInfo?.dates?.ocEnd;
  const noEndRequired = callType && !fixedType;
  const today = new Date();
  const minDate = ocStart && new Date(ocStart) >= today ? ocStart : today;

  // console.log(ocEligibilityWhom);

  // #region -------------- UseEffect ---------------

  // useEffect(() => {
  //   if (callType === "Email") {
  //     setValue("openCall.requirements.applicationLinkFormat", "mailto:");
  //   }
  // }, [callType, setValue]);

  useEffect(() => {
    // You could also check if it's NOT already mailto
    if (callType === "Email" && appLinkFormat !== "mailto:") {
      setValue("openCall.requirements.applicationLinkFormat", "mailto:");
    }
  }, [callType, setValue, appLinkFormat]);

  useEffect(() => {
    if (ocEligibilityWhom !== undefined) return;
    register("openCall.eligibility.whom");
  }, [register, ocEligibilityWhom]);

  useEffect(() => {
    if (!callType || fixedType) return;
    if (!fixedType) {
      setValue("openCall.basicInfo.dates.ocEnd", "");
      setValue("openCall.basicInfo.dates.ocStart", "");
      setValue("openCall.basicInfo.appFee", 0);
      // setHasAppFee("false")
    }
  }, [fixedType, setValue, callType]);

  useEffect(() => {
    const formValue = hasAppFee?.trim();
    const shouldBe = validAppFeeAmount ? "true" : "";

    if (!formValue && validAppFeeAmount) {
      setHasAppFee(shouldBe);
    } else if (!formValue && noAppFeeAmount) {
      setHasAppFee("false");
    } else if (formValue === "false" && validAppFeeAmount) {
      setValue("openCall.basicInfo.appFee", 0);
    }
  }, [validAppFeeAmount, noAppFeeAmount, setValue, hasAppFee]);

  useEffect(() => {
    if (hasAppFee === "false" && appFee === undefined) {
      setValue("openCall.basicInfo.appFee", 0);
    }
  }, [appFee, hasAppFee, setValue]);

  useEffect(() => {
    if (!freeCall) return;
    if (freeCall) {
      // setValue("openCall.eligibility.whom", []);
      setValue("openCall.basicInfo.appFee", 0);
    }
  }, [freeCall, setValue]);

  // #endregion
  // console.log("Open Call", openCall);

  return (
    <div
      id="step-1-container"
      className={cn(
        "flex h-full w-full flex-col gap-4 sm:w-[90%] lg:w-full xl:justify-center",
        "mx-auto",
        "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[40%_10%_50%] xl:gap-0",
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
        <div className="input-section">
          <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
          <p className="lg:text-xs">Call Format</p>
        </div>

        <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
          <Label htmlFor="event.category" className="sr-only">
            Open Call Format
          </Label>
          <Controller
            name="openCall.basicInfo.callFormat"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  disabled={pastEvent}
                  onValueChange={(value: CallFormat) => {
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                >
                  <SelectTrigger
                    className={cn(
                      "h-12 w-full border bg-card text-center text-base sm:h-[50px]",
                    )}
                    tabIndex={1}
                  >
                    <SelectValue placeholder="Call Format (select one)" />
                  </SelectTrigger>
                  <SelectContent className="min-w-auto">
                    <SelectItem fit value="RFQ">
                      RFQ (Request for Qualifications)
                    </SelectItem>
                    <SelectItem fit value="RFP">
                      RFP (Request for Proposals)
                    </SelectItem>
                    {pupstick && (
                      <SelectItem fit value="RFA">
                        RFA (Request for Artworks)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>
        <div />
        {/* TODO: Add a popover modal or link to the FAQ page for more information on call formats */}
        <p className="mt-1 text-balance text-center text-xs italic">
          For more information on Open Call Formats, check out the{" "}
          <Link
            href={`${siteUrl[0]}/faq#call-formats`}
            target="_blank"
            className="font-bold"
          >
            FAQ
          </Link>
        </p>
        {callFormat && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">Step 2: </p>
              <p className="lg:text-xs">Eligibility</p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.category" className="sr-only">
                Open Call Eligibility
              </Label>
              <Controller
                name="openCall.eligibility.type"
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      disabled={pastEvent}
                      onValueChange={(value: EligibilityType) => {
                        field.onChange(value);
                        if (value !== "National") {
                          setValue("openCall.eligibility.whom", []);
                        }
                      }}
                      value={field.value || ""}
                    >
                      <SelectTrigger
                        tabIndex={2}
                        className={cn(
                          "h-12 w-full border bg-card text-center text-base sm:h-[50px]",
                        )}
                      >
                        <SelectValue placeholder="Eligiblity type (select one)" />
                      </SelectTrigger>
                      <SelectContent className="min-w-auto">
                        <SelectItem fit value="International">
                          International Artists (All)
                        </SelectItem>
                        <SelectItem fit value="National">
                          National Artists
                        </SelectItem>
                        <SelectItem fit value="Regional/Local">
                          Regional/Local Artists
                        </SelectItem>
                        <SelectItem fit value="Other">
                          Other (specify below - Required)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>
          </>
        )}
        {ocEligiblityType === "National" && (
          <>
            <div className="input-section self-start">
              <p className="lg:text-xs">Eligible Nationalities</p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.category" className="sr-only">
                Open Call Eligibility
              </Label>

              <Controller
                name="openCall.eligibility.whom"
                control={control}
                render={({ field }) => (
                  <SearchMappedMultiSelect<Country>
                    disabled={pastEvent}
                    values={field.value ?? []}
                    onChange={field.onChange}
                    data={sortedGroupedCountries}
                    placeholder="Select eligible nationalities"
                    getItemLabel={(country) => country.name.common}
                    getItemValue={(country) => country.name.common}
                    displayLimit={isMobile ? 1 : 2}
                    // getItemValue={(country) => country.name.common}
                    searchFields={[
                      "name.common",
                      "name.official",
                      "cca3",
                      "altSpellings",
                    ]}
                    tabIndex={3}
                    className="h-12 min-h-12 border border-foreground bg-card text-base hover:bg-card"
                  />
                )}
              />
            </div>
          </>
        )}

        {ocEligiblityType && (
          <>
            <div className="input-section self-start">
              <p className="lg:text-xs">More Info</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:max-w-md lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.type" className="sr-only">
                Eligibility Continued... (if not &quot;International&quot;)
              </Label>
              <Controller
                name="openCall.eligibility.details"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    tabIndex={4}
                    readOnly={pastEvent}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    // onChange={(val) => {
                    //   field.onChange(val);
                    //   // handleCheckSchema();
                    // }}
                    onBlur={field.onBlur}
                    placeholder="Please be as specific as possible"
                    charLimit={1200}
                    inputPreviewClassName={cn(
                      errors?.openCall?.eligibility?.details && "invalid-field",
                    )}
                  />
                )}
              />
            </div>
          </>
        )}

        {hasRequiredDetails && !freeCall && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">Step 3:</p>
              <p className="lg:text-xs">App Fee</p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="hasAppFee" className="sr-only">
                Application Fee
              </Label>

              <Select
                disabled={pastEvent}
                onValueChange={(value: "true" | "false" | "") => {
                  setHasAppFee(value);
                }}
                value={hasAppFee}
              >
                <SelectTrigger
                  className={cn(
                    "h-12 w-full min-w-20 border bg-card text-center text-base sm:h-[50px] sm:w-fit",
                  )}
                  tabIndex={5}
                >
                  <SelectValue placeholder="Select One" />
                </SelectTrigger>
                <SelectContent className="min-w-auto">
                  <SelectItem fit value="true">
                    Yes
                  </SelectItem>
                  <SelectItem fit value="false">
                    No
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden items-center justify-center px-2 sm:flex">
                <ArrowRight
                  className={cn(
                    "invisible size-4 shrink-0 text-foreground/50",
                    showAppFeeInput && "visible",
                  )}
                />
              </div>

              <div
                className={cn(
                  "flex min-w-50 flex-1 items-center justify-between rounded border border-foreground bg-card px-3",
                  !showAppFeeInput &&
                    "border-foreground/30 opacity-50 [@media(max-width:640px)]:hidden",
                )}
              >
                <Controller
                  name="organization.location.currency"
                  control={control}
                  render={({ field }) => (
                    <SearchMappedSelect<Currency>
                      tabIndex={
                        ocEligiblityType === "National" && showAppFeeInput
                          ? 6
                          : -1
                      }
                      searchFields={["name", "symbol", "code"]}
                      className="max-w-28 border-none bg-card py-2 sm:h-fit"
                      value={field.value?.code ?? "USD"}
                      onChange={(code) => {
                        const selected = Object.values(currencies[0])
                          .flat()
                          .find((cur) => cur.code === code);

                        if (selected) field.onChange(selected);
                      }}
                      data={currencies[0]}
                      getItemLabel={(c) =>
                        `${c.symbol} (${c.code}) - ${c.name}`
                      }
                      getItemDisplay={(c) => `(${c.code}) ${c.symbol}`}
                      getItemValue={(c) => c.code}
                      disabled={!showAppFeeInput || pastEvent}
                    />
                  )}
                />
                <Controller
                  name="openCall.basicInfo.appFee"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerNumInput
                      disabled={!showAppFeeInput || pastEvent}
                      field={{
                        ...field,
                        onChange: (val: string) => {
                          const num = parseFloat(val);
                          field.onChange(isNaN(num) ? true : num);
                        },
                      }}
                      min={0}
                      formatNumber={true}
                      tabIndex={
                        ocEligiblityType === "National" && showAppFeeInput
                          ? 7
                          : -1
                      }
                      // field={field}
                      placeholder={hasAppFee ? "Amount" : ""}
                      className="h-fit border-none bg-card py-2 text-center focus:border-none focus:outline-none sm:text-base"
                    />
                  )}
                />
              </div>
            </div>
          </>
        )}
      </div>

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
            "mx-auto xl:max-w-full xl:py-10 4xl:my-auto", // "xl:self-center",
            "lg:max-w-[60dvw]",
          )}
        >
          {" "}
          {fixedType &&
            ocEligiblityType &&
            hasRequiredDetails &&
            typeof appFee === "number" && (
              <>
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">
                    Step {freeCall ? 3 : 4}:
                  </p>
                  <p className="lg:text-xs">Open Call Dates</p>
                </div>

                <div className="mx-auto flex w-full flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="openCall.basicInfo.dates" className="sr-only">
                    Open Call Dates
                  </Label>
                  <Controller
                    name="openCall.basicInfo.dates.ocStart"
                    control={control}
                    render={({ field }) => (
                      <OcCustomDatePicker
                        disabled={pastEvent}
                        value={field.value}
                        onChange={field.onChange}
                        pickerType="start"
                        className="hansel min-h-12"
                        placeholder="Start Date"
                        orgTimezone={orgTimezone}
                        showTimeZone={false}
                        isAdmin={isAdmin}
                        tabIndex={8}
                      />
                    )}
                  />

                  <div className="hidden items-center justify-center px-2 sm:flex">
                    <ArrowRight
                      className={cn("size-4 shrink-0 text-foreground/50")}
                    />
                  </div>

                  <Controller
                    name="openCall.basicInfo.dates.ocEnd"
                    control={control}
                    render={({ field }) => (
                      <OcCustomDatePicker
                        disabled={pastEvent}
                        value={field.value}
                        onChange={field.onChange}
                        pickerType="end"
                        className="gretel min-h-12"
                        minDate={minDate}
                        ocEnd={ocEnd}
                        orgTimezone={orgTimezone}
                        placeholder="Deadline"
                        isAdmin={isAdmin}
                        tabIndex={9}
                      />
                    )}
                  />
                </div>
              </>
            )}
          {(ocEnd || noEndRequired) && hasRequiredDetails && (
            <>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">
                  Step{" "}
                  {fixedType && !freeCall ? 5 : !fixedType && !freeCall ? 3 : 4}
                  :
                </p>
                <p className="lg:text-xs">Application Requirements</p>
              </div>
              <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:max-w-md lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="event.type" className="sr-only">
                  Application Requirements
                </Label>
                <Controller
                  name="openCall.requirements.requirements"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      readOnly={pastEvent}
                      value={field.value ?? ""}
                      // onChange={field.onChange}
                      onChange={(val) => {
                        field.onChange(val);
                      }}
                      onBlur={field.onBlur}
                      placeholder={`Please be as specific as possible
                        ${emailType ? " on what you would like for artists to include in their email submissions." : ""}`}
                      charLimit={5000}
                      purpose="openCall"
                      asModal={true}
                      title={eventName}
                      subtitle="Application Requirements"
                      inputPreviewClassName={cn(
                        errors?.openCall?.requirements?.requirements &&
                          "invalid-field",
                      )}
                      tabIndex={10}
                    />
                  )}
                />
              </div>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">
                  Step{" "}
                  {fixedType && !freeCall ? 6 : !fixedType && !freeCall ? 4 : 5}
                  :
                </p>
                <p className="lg:text-xs">Other Info</p>
              </div>
              <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:max-w-md lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="event.type" className="sr-only">
                  Other Info
                </Label>
                <Controller
                  name="openCall.requirements.otherInfo"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      readOnly={pastEvent}
                      value={field.value ?? ""}
                      onChange={(val) => {
                        field.onChange(val);
                      }}
                      onBlur={field.onBlur}
                      placeholder="Include any other info pertaining to the open call and production requirements"
                      charLimit={5000}
                      purpose="openCall"
                      asModal={true}
                      title={eventName}
                      subtitle="Other Info"
                      inputPreviewClassName={cn(
                        errors?.openCall?.requirements?.otherInfo &&
                          "invalid-field",
                      )}
                      tabIndex={11}
                    />
                  )}
                />
              </div>

              {hasAppRequiredDetails && (
                <>
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step{" "}
                      {fixedType && !freeCall
                        ? 7
                        : !fixedType && !freeCall
                          ? 5
                          : 6}
                      :
                    </p>
                    <p className="lg:text-xs">
                      Application {emailType ? "Email" : "Link"}
                    </p>
                    {/* TODO: when internal applications are implemented, add this back in */}
                    {/* <p className="lg:text-xs">(If external)</p> */}
                  </div>
                  <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label
                      htmlFor="openCall.requirements.applicationLink"
                      className="sr-only"
                    >
                      Application Link
                    </Label>
                    <div className="flex items-center gap-2">
                      <Controller
                        name="openCall.requirements.applicationLinkFormat"
                        control={control}
                        render={({ field }) => {
                          return (
                            <Select
                              disabled={pastEvent}
                              onValueChange={(
                                value: "mailto:" | "https://",
                              ) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                            >
                              <SelectTrigger
                                tabIndex={11}
                                className={cn(
                                  "w-24 rounded border bg-card text-center text-base sm:h-11",
                                  emailType && "hidden",
                                )}
                              >
                                <SelectValue placeholder="(Type)" />
                              </SelectTrigger>
                              <SelectContent className="min-w-auto">
                                <SelectItem fit value="mailto:">
                                  Email
                                </SelectItem>
                                <SelectItem fit value="https://">
                                  URL
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          );
                        }}
                      />
                      <Controller
                        name="openCall.requirements.applicationLink"
                        control={control}
                        render={({ field }) => {
                          const urlLink = appLinkFormat === "https://";
                          return (
                            <DebouncedControllerInput
                              transform={urlLink ? autoHttps : undefined}
                              disabled={pastEvent}
                              field={field}
                              placeholder={
                                urlLink
                                  ? "Link to application form"
                                  : "Email Address"
                              }
                              className={cn(
                                "w-full rounded border-foreground",
                                errors?.openCall?.requirements
                                  ?.applicationLink && "invalid-field",
                              )}
                              debounceMs={50}
                              tabIndex={12}
                              onBlur={() => {
                                field.onBlur?.();
                                handleCheckSchema?.();
                                field.onChange(field.value || "");
                                // console.log("Blur me", field + type)
                              }}
                            />
                          );
                        }}
                      />
                    </div>
                    {appLinkFormat === "mailto:" && (
                      <Controller
                        name="openCall.requirements.applicationLinkSubject"
                        control={control}
                        render={({ field }) => (
                          <DebouncedControllerInput
                            disabled={pastEvent}
                            field={field}
                            placeholder="Email Subject (optional)"
                            className={cn("w-full rounded border-foreground")}
                            debounceMs={50}
                            tabIndex={12}
                            onBlur={() => {
                              field.onBlur?.();
                              handleCheckSchema?.();
                              field.onChange(field.value);
                              // console.log("Blur me", field + type)
                            }}
                          />
                        )}
                      />
                    )}
                  </div>
                </>
              )}
              {hasAppLink && (
                <>
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step{" "}
                      {fixedType && !freeCall
                        ? 8
                        : !fixedType && !freeCall
                          ? 6
                          : 7}
                      :
                    </p>
                    <p className="lg:text-xs">Application Docs</p>
                  </div>
                  <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label htmlFor="openCall.tempFiles" className="sr-only">
                      Application Documents
                    </Label>
                    <Controller
                      name="openCall.tempFiles"
                      control={control}
                      render={({ field }) => (
                        <FilePondInput
                          value={field.value ?? []}
                          onChange={field.onChange}
                          purpose="both"
                          maxFileSize="5MB"
                          maxFiles={10}
                          disabled={pastEvent}
                          currentFileList={openCall?.documents?.map(
                            (doc) => doc.title,
                          )}
                        />
                      )}
                    />
                    {Array.isArray(openCall?.documents) &&
                      openCall.documents.length > 0 && (
                        <OpenCallFilesTable
                          isMobile={isMobile}
                          files={openCall.documents.filter(hasId)}
                          eventId={eventId as Id<"events">}
                          isDraft={isDraft}
                          isAdmin={isAdmin}
                          disabled={pastEvent}
                        />
                      )}
                  </div>
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step{" "}
                      {fixedType && !freeCall
                        ? 9
                        : !fixedType && !freeCall
                          ? 7
                          : 8}
                      :
                    </p>
                    <p className="lg:text-xs">External Links</p>
                  </div>
                  <ExternalLinksInput
                    name="openCall.requirements.links"
                    handleCheckSchema={handleCheckSchema}
                    disabled={pastEvent}
                  />
                </>
              )}
            </>
          )}
        </div>
      </>
    </div>

    //   )}
  );
};

export default SubmissionFormOC1;
