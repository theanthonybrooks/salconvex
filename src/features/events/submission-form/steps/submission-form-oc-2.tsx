import { currencies, Currency } from "@/app/data/currencies";
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
import { EventOCFormValues } from "@/features/events/event-add-form";
import { autoHttps } from "@/lib/linkFns";
import { sortedGroupedCountries } from "@/lib/locations";
import { cn } from "@/lib/utils";
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
import { FilePondInput } from "@/features/files/filepond";
import { hasId, OpenCallFilesTable } from "@/features/files/form-file-list";
import "filepond/dist/filepond.min.css";
import { Id } from "~/convex/_generated/dataModel";

interface SubmissionFormOC2Props {
  user: User | undefined;
  isAdmin: boolean;
  isMobile: boolean;
  categoryEvent: boolean;
  canNameEvent: boolean;
  handleCheckSchema: () => void;
}

const SubmissionFormOC2 = ({
  // user,
  isAdmin,
  isMobile,

  // categoryEvent,

  handleCheckSchema,
}: SubmissionFormOC2Props) => {
  const {
    control,
    watch,
    setValue,

    // getValues,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();
  const [hasBudget, setHasBudget] = useState<"true" | "false" | "">("");

  const openCall = watch("openCall");
  const organizer = watch("organization");
  const orgCurrency = organizer?.location?.currency;
  const eventName = watch("event.name");
  const eventId = watch("event._id");
  const isDraft = openCall?.state === "draft";
  const orgTimezone = organizer?.location?.timezone;
  const callType = openCall?.basicInfo?.callType;
  const fixedType = callType === "Fixed";
  const ocEligiblityType = openCall?.eligibility?.type;
  const isNational = ocEligiblityType === "National";
  const international = ocEligiblityType === "International";
  const eligDetails = openCall?.eligibility?.details ?? "";
  const showBudgetInputs = hasBudget?.trim() === "true";
  const hasRequiredDetails =
    (eligDetails.trim().length > 10 && !international) || international;
  const budgetMin = openCall?.compensation?.budget?.min;
  const budgetMax = openCall?.compensation?.budget?.max;
  const budgetRate = openCall?.compensation?.budget?.rate;
  const validBudgetMin = typeof budgetMin === "number" && budgetMin > 0;
  const validBudgetRate = typeof budgetRate === "number" && budgetRate > 0;
  // const hasMinOrRateBudget = validBudgetMin || validBudgetRate;
  const noBudgetMin = typeof budgetMin === "number" && budgetMin === 0;
  const ocStart = openCall?.basicInfo?.dates?.ocStart;
  const ocEnd = openCall?.basicInfo?.dates?.ocEnd;
  const noEndRequired = callType && !fixedType;
  const today = new Date();
  const minDate = ocStart && new Date(ocStart) >= today ? ocStart : today;
  // const hasRate = openCall?.compensation?.budget?.unit;
  // #region -------------- UseEffect ---------------

  useEffect(() => {
    if (!fixedType) {
      setValue("openCall.basicInfo.dates.ocEnd", undefined);
      setValue("openCall.basicInfo.dates.ocStart", undefined);
    }
  }, [fixedType, setValue]);

  useEffect(() => {
    const formValue = hasBudget?.trim();
    const shouldBe = validBudgetMin ? "true" : "";

    if (!formValue && validBudgetMin) {
      setHasBudget(shouldBe);
      setValue("openCall.compensation.budget.max", budgetMin);
    } else if (!formValue && noBudgetMin) {
      setHasBudget("false");
    } else if (formValue === "false" && validBudgetRate) {
      setValue("openCall.compensation.budget.min", 0);
      setValue("openCall.compensation.budget.rate", 0);
    }
  }, [
    validBudgetRate,
    validBudgetMin,
    noBudgetMin,
    setValue,
    hasBudget,
    budgetMin,
  ]);

  useEffect(() => {
    const min = budgetMin;
    const max = budgetMax;

    if (typeof min === "number") {
      if (typeof max !== "number" || max < min) {
        setValue("openCall.compensation.budget.max", min);
      }
    }
  }, [budgetMin, budgetMax, setValue]);

  useEffect(() => {
    if (hasBudget === "false" && budgetMin === undefined) {
      setValue("openCall.compensation.budget.min", 0);
      setValue("openCall.compensation.budget.max", 0);
      setValue("openCall.compensation.budget.rate", 0);
    }
  }, [budgetMin, hasBudget, setValue]);

  useEffect(() => {
    if (!ocEligiblityType) return;
    if (!isNational) {
      setValue("openCall.eligibility.whom", []);
    }
  }, [ocEligiblityType, isNational, setValue]);

  // #endregion

  return (
    <div
      id="step-1-container"
      className={cn(
        "flex h-full flex-col gap-4 xl:justify-center",
        "mx-auto max-w-max",
        "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[45%_10%_45%] xl:gap-0",
      )}
    >
      <div
        className={cn(
          "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
          "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
          "lg:pb-10 xl:py-10 4xl:my-auto",

          // "xl:self-center",
        )}
      >
        <div className="input-section">
          <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
          <p className="lg:text-xs">Budget</p>
        </div>

        <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
          <Label htmlFor="hasBudget" className="sr-only">
            Project Budget
          </Label>

          <Select
            onValueChange={(value: "true" | "false" | "") => {
              setHasBudget(value);
            }}
            value={hasBudget}
          >
            <SelectTrigger
              className={cn(
                "h-12 w-full min-w-20 border text-center text-base sm:h-[50px] sm:w-fit",
              )}
            >
              <SelectValue placeholder="Project Budget?*" />
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
                showBudgetInputs && "visible",
              )}
            />
          </div>

          <div
            className={cn(
              "flex min-w-50 flex-1 items-center justify-between rounded border border-foreground px-3",
              !showBudgetInputs &&
                "opacity-50 [@media(max-width:640px)]:hidden",
            )}
          >
            <Controller
              name="openCall.compensation.budget.currency"
              control={control}
              render={({ field }) => (
                <SearchMappedSelect<Currency>
                  searchFields={["name", "symbol", "code"]}
                  className="w-40 border-none py-2 sm:h-fit sm:w-40"
                  value={field.value ?? orgCurrency?.code ?? "USD"}
                  onChange={(code) => {
                    const selected = Object.values(currencies[0])
                      .flat()
                      .find((cur) => cur.code === code);

                    if (selected) field.onChange(selected.code);
                  }}
                  data={currencies[0]}
                  getItemLabel={(c) => `${c.symbol} (${c.code}) - ${c.name}`}
                  getItemDisplay={(c) => `(${c.code}) ${c.symbol}`}
                  getItemValue={(c) => c.code}
                  disabled={!showBudgetInputs}
                />
              )}
            />
            <div className="flex w-full flex-col">
              <div className="flex w-full select-none items-center justify-center gap-1 text-2xs text-foreground/50">
                <p>Minimum - Maximum</p>
              </div>
              <div className="flex w-full items-center gap-1">
                <Controller
                  name="openCall.compensation.budget.min"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerNumInput
                      field={field}
                      formatNumber={true}
                      min={0}
                      disabled={!showBudgetInputs}
                      placeholder="Minimum"
                      className="h-fit border-none pb-2 pr-0 pt-0 text-end focus:border-none focus:outline-none sm:text-base"
                    />
                  )}
                />
                <p className="pb-2">{" - "}</p>
                <Controller
                  name="openCall.compensation.budget.max"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerNumInput
                      // min={budgetMin}
                      // type="number"
                      disabled={!showBudgetInputs}
                      formatNumber={true}
                      field={{
                        ...field,
                        onChange: (val: string) => {
                          const num = parseFloat(val);
                          field.onChange(isNaN(num) ? 0 : num);
                        },
                      }}
                      placeholder="Maximum "
                      className="arrowless h-fit border-none pb-2 pl-0 pt-0 text-left focus:border-none focus:outline-none sm:text-base"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        {validBudgetMin && (
          <>
            <div className="input-section">
              <p className="lg:text-xs">Rate:</p>
              <p className="text-xs">(optional)</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="hasBudget" className="sr-only">
                Budget Rate
              </Label>
              <div
                className={cn(
                  "flex min-w-50 flex-1 items-center justify-between rounded border border-foreground px-3",
                  !showBudgetInputs &&
                    "opacity-50 [@media(max-width:640px)]:hidden",
                )}
              >
                <Controller
                  name="openCall.compensation.budget.currency"
                  control={control}
                  render={({ field }) => (
                    <SearchMappedSelect<Currency>
                      searchFields={["name", "symbol", "code"]}
                      className="w-40 border-none py-2 sm:h-fit sm:w-40"
                      value={field.value ?? orgCurrency?.code ?? "USD"}
                      onChange={(code) => {
                        const selected = Object.values(currencies[0])
                          .flat()
                          .find((cur) => cur.code === code);

                        if (selected) field.onChange(selected.code);
                      }}
                      data={currencies[0]}
                      getItemLabel={(c) =>
                        `${c.symbol} (${c.code}) - ${c.name}`
                      }
                      getItemDisplay={(c) => `(${c.code}) ${c.symbol}`}
                      getItemValue={(c) => c.code}
                      disabled={!showBudgetInputs}
                    />
                  )}
                />
                <div className="flex w-full flex-col">
                  <div className="flex w-full items-center gap-1">
                    <Controller
                      name="openCall.compensation.budget.rate"
                      control={control}
                      render={({ field }) => (
                        <DebouncedControllerNumInput
                          field={field}
                          formatNumber={true}
                          min={0}
                          disabled={!showBudgetInputs}
                          placeholder="Rate (ex: $30/ft²)"
                          className="h-fit border-none p-2 text-center focus:border-none focus:outline-none sm:text-base"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <p className="m-auto px-2"> per </p>

              <Controller
                name="openCall.compensation.budget.unit"
                control={control}
                render={({ field }) => (
                  <Select
                    // onValueChange={(value: "ft²" | "m²" | "") => {
                    //   setHasRate(value);
                    // }}
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 w-full min-w-20 border text-center text-base sm:h-[50px] sm:w-fit",
                      )}
                    >
                      <SelectValue placeholder="Rate Unit" />
                    </SelectTrigger>
                    <SelectContent className="min-w-auto">
                      <SelectItem fit value="ft²">
                        ft²
                      </SelectItem>
                      <SelectItem fit value="m²">
                        m²
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </>
        )}

        {validBudgetMin && (
          <>
            <div className="input-section">
              <p className="lg:text-xs">All inclusive</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.category" className="sr-only">
                All inclusive budget selection
              </Label>
              <div className="flex items-center justify-between">
                <span>
                  <p className="text-sm text-foreground">
                    Is the budget for this open call all-inclusive?
                  </p>
                  <p className="text-xs text-foreground/50">
                    What does this mean?{" "}
                    <a
                      href="https://support.streetartlist.com/hc/en-us/articles/1500000466818-What-does-all-inclusive-mean-"
                      target="_blank"
                      className="underline"
                    >
                      Learn more
                    </a>
                    {/* TODO: Add a popover modal or link to the FAQ page for more information on call formats */}
                  </p>
                </span>
                <Controller
                  name="openCall.compensation.budget.allInclusive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val: string) =>
                        field.onChange(val === "true")
                      }
                      // value={String(field.value) ?? ""}
                      value={String(field.value)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-12 w-full min-w-20 border text-center text-base sm:h-[50px] sm:w-fit",
                        )}
                      >
                        <SelectValue placeholder="All Inclusive Budget?" />
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
                  )}
                />
              </div>
            </div>
          </>
        )}
        {ocEligiblityType === "National" && (
          <>
            <div className="input-section self-start">
              <p className="lg:text-xs">Eligible Nationalities</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.category" className="sr-only">
                Open Call Eligibility
              </Label>

              <Controller
                name="openCall.eligibility.whom"
                control={control}
                render={({ field }) => (
                  <SearchMappedMultiSelect<Country>
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
                    tabIndex={2}
                    className="h-12 min-h-12 border border-foreground bg-card text-base hover:bg-card"
                  />
                )}
              />
            </div>
          </>
        )}
        {validBudgetMin && (
          <>
            <div className="input-section self-start">
              <p className="lg:text-xs">More Info</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.type" className="sr-only">
                Eligibility Continued... (if not &quot;International&quot;)
              </Label>
              <Controller
                name="openCall.compensation.budget.moreInfo"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Please list any other compensation-related info here (limit 1000 characters)"
                    charLimit={1000}
                  />
                )}
              />
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
            "lg:pt-10 xl:py-10 4xl:my-auto",
            // "xl:self-center",
          )}
        >
          {" "}
          {fixedType &&
            ocEligiblityType &&
            hasRequiredDetails &&
            typeof budgetMin === "number" && (
              <>
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">Step 4:</p>
                  <p className="lg:text-xs">Open Call Dates</p>
                </div>

                <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="openCall.basicInfo.dates" className="sr-only">
                    Open Call Dates
                  </Label>
                  <Controller
                    name="openCall.basicInfo.dates.ocStart"
                    control={control}
                    render={({ field }) => (
                      <OcCustomDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        pickerType="start"
                        className="hansel min-h-12"
                        placeholder="Start Date"
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
                        value={field.value}
                        onChange={field.onChange}
                        pickerType="end"
                        className="gretel min-h-12"
                        minDate={minDate}
                        ocEnd={ocEnd}
                        orgTimezone={orgTimezone}
                        placeholder="Deadline"
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
                  Step {fixedType ? 5 : 4}:
                </p>
                <p className="lg:text-xs">Application Requirements</p>
              </div>
              <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="event.type" className="sr-only">
                  Application Requirements
                </Label>
                <Controller
                  name="openCall.requirements.requirements"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Please be as specific as possible (limit 2000 characters)"
                      charLimit={3000}
                      purpose="openCall"
                      asModal={true}
                      title={eventName}
                      subtitle="Application Requirements"
                    />
                  )}
                />
              </div>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">
                  Step {fixedType ? 6 : 5}:
                </p>
                <p className="lg:text-xs">Application Link</p>
                {/* TODO: when internal applications are implemented, add this back in */}
                {/* <p className="lg:text-xs">(If external)</p> */}
              </div>
              <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                <Label
                  htmlFor="openCall.requirements.applicationLink"
                  className="sr-only"
                >
                  Application Link
                </Label>
                <Controller
                  name="openCall.requirements.applicationLink"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerInput
                      field={field}
                      placeholder="Link to external application form"
                      className={cn(
                        "w-full rounded border-foreground",
                        errors?.openCall?.requirements?.applicationLink &&
                          "invalid-field",
                      )}
                      transform={autoHttps}
                      tabIndex={2}
                      onBlur={() => {
                        field.onBlur?.();
                        handleCheckSchema?.();
                        // console.log("Blur me", field + type)
                      }}
                    />
                  )}
                />
              </div>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">
                  Step {fixedType ? 7 : 6}:
                </p>
                <p className="lg:text-xs">Application Docs</p>
              </div>
              <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
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
                    />
                  )}
              </div>
            </>
          )}
        </div>
      </>
    </div>

    //   )}
  );
};

export default SubmissionFormOC2;
