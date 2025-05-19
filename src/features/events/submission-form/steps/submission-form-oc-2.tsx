import { currencies, Currency } from "@/app/data/currencies";
import { Label } from "@/components/ui/label";
import { SearchMappedSelect } from "@/components/ui/mapped-select";
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
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { registerPlugin } from "react-filepond";
import { Controller, useFormContext } from "react-hook-form";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

import { MultiSelect } from "@/components/multi-select";
import { DebouncedControllerNumInput } from "@/components/ui/debounced-form-num-input";
import { getCurrencySymbol } from "@/lib/currencyFns";
import { openCallCategoryFields } from "@/types/openCall";
import "filepond/dist/filepond.min.css";

type CategoryKey = (typeof openCallCategoryFields)[number]["value"];

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
  // isAdmin,
  isMobile,

  // categoryEvent,

  handleCheckSchema,
}: SubmissionFormOC2Props) => {
  const {
    control,
    watch,
    setValue,

    // getValues,
    // formState: { errors },
  } = useFormContext<EventOCFormValues>();
  const [hasBudget, setHasBudget] = useState<"true" | "false" | "">("");

  const openCall = watch("openCall");
  const organizer = watch("organization");
  const selectedCategories = watch("openCall.compensation.categories") ?? {};
  const activeCategoryFields = openCallCategoryFields.filter(
    ({ value }) => selectedCategories?.[value],
  );

  const orgCurrency = organizer?.location?.currency;
  // const eventName = watch("event.name");
  // const eventId = watch("event._id");
  const showBudgetInputs = hasBudget?.trim() === "true";

  const budgetMin = openCall?.compensation?.budget?.min;
  const budgetMax = openCall?.compensation?.budget?.max;
  // const budgetRate = openCall?.compensation?.budget?.rate;
  const validBudgetMin = typeof budgetMin === "number" && budgetMin > 0;
  // const validBudgetRate = typeof budgetRate === "number" && budgetRate > 0;
  // const hasMinOrRateBudget = validBudgetMin || validBudgetRate;
  const noBudgetMin = typeof budgetMin === "number" && budgetMin === 0;
  const hasBudgetMin = hasBudget?.trim() === "true" && validBudgetMin;
  const noBudget = hasBudget?.trim() === "false";
  const allInclusive = openCall?.compensation?.budget?.allInclusive;
  const prevBudgetMaxRef = useRef<number | undefined>(undefined);
  const budgetMaxRef = useRef(budgetMax);

  const setValueRef = useRef(setValue);
  // const noBudget

  // const hasRate = openCall?.compensation?.budget?.unit;
  // #region -------------- UseEffect ---------------

  useEffect(() => {
    const formValue = hasBudget?.trim();
    const shouldBe = validBudgetMin ? "true" : "";

    if (!formValue && validBudgetMin) {
      setHasBudget(shouldBe);
      setValue("openCall.compensation.budget.max", budgetMin);
    } else if (!formValue && noBudgetMin) {
      setHasBudget("false");
    } else if (formValue === "false" && validBudgetMin) {
      setValue("openCall.compensation.budget.min", 0);
      setValue("openCall.compensation.budget.max", 0);
      setValue("openCall.compensation.budget.rate", 0);
    }
  }, [validBudgetMin, noBudgetMin, setValue, hasBudget, budgetMin]);

  useEffect(() => {
    const isValidNumber = typeof budgetMax === "number" && !isNaN(budgetMax);

    if (
      budgetMax === prevBudgetMaxRef.current ||
      (!isValidNumber && typeof budgetMax !== "undefined")
    ) {
      return;
    }

    prevBudgetMaxRef.current = budgetMax;

    const timeout = setTimeout(() => {
      handleCheckSchema(); 
    }, 300);

    return () => clearTimeout(timeout);
  }, [budgetMax, handleCheckSchema]);

  // // Keep refs in sync
  // useEffect(() => {
  //   budgetMaxRef.current = budgetMax;
  //   handleCheckSchema();
  // }, [budgetMax, handleCheckSchema]);

  useEffect(() => {
    setValueRef.current = setValue;
  }, [setValue]);

  useEffect(() => {
    const min = budgetMin;
    const max = budgetMaxRef.current;

    if (typeof min !== "number") return;
    if (typeof max === "number" && max >= min) return;

    const timeout = setTimeout(() => {
      const setVal = setValueRef.current;
      setVal("openCall.compensation.budget.max", min);
    }, 400);

    return () => clearTimeout(timeout);
  }, [budgetMin]);

  // useEffect(() => {
  //   const min = budgetMin;
  //   const max = budgetMax;

  //   if (typeof min === "number") {
  //     if (typeof max !== "number" || max < min) {
  //       setValue("openCall.compensation.budget.max", min);
  //     }
  //   }
  // }, [budgetMin, budgetMax, setValue]);

  useEffect(() => {
    if (hasBudget === "false" && budgetMin === undefined) {
      setValue("openCall.compensation.budget.min", 0);
      setValue("openCall.compensation.budget.max", 0);
      setValue("openCall.compensation.budget.rate", 0);
    }
  }, [budgetMin, hasBudget, setValue]);

  // #endregion

  return (
    <div
      id="step-1-container"
      className={cn(
        "flex h-full flex-col gap-4 xl:justify-center",
        "mx-auto max-w-max",
        "xl:mx-0 xl:grid xl:max-w-none",
        allInclusive === false &&
          showBudgetInputs &&
          "xl:grid-cols-[45%_10%_45%] xl:gap-0",
        !showBudgetInputs && "lg:gap-0",
      )}
    >
      <div
        className={cn(
          "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
          "[&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
          "lg:pb-10 xl:py-10 4xl:my-auto",
          !showBudgetInputs && "lg:gap-y-0 lg:pb-0 xl:pb-0",
          showBudgetInputs && "self-start",

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
                "border-foreground/30 opacity-50 [@media(max-width:640px)]:hidden",
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
                      className="h-fit border-none px-0 pb-2 pt-0 text-end focus:border-none focus:outline-none sm:text-base"
                    />
                  )}
                />
                <p className={cn("pb-2", !showBudgetInputs && "opacity-40")}>
                  {" - "}
                </p>
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
                      className="arrowless h-fit border-none px-0 pb-2 pt-0 text-left focus:border-none focus:outline-none sm:text-base"
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
                          value={field.value ?? 0}
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
                        "h-12 w-full min-w-25 border text-center text-base sm:h-[50px] sm:w-fit",
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
                      value={String(field.value) ?? ""}
                      // value={field.value ? String(field.value) : ""}
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
        {(hasBudgetMin || noBudget) && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">Step 2: </p>
              <p className="lg:text-xs">Categories</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.type" className="sr-only">
                Event Type
              </Label>
              <Controller
                name="openCall.compensation.categories"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    id="openCall.compensation.categories"
                    className={cn(
                      "h-12 border sm:h-[50px]",
                      // errors.event?.type && "invalid-field",
                    )}
                    badgeClassName="py-2 lg:py-2 lg:text-sm "
                    textClassName="text-base"
                    options={[...openCallCategoryFields]}
                    onValueChange={(selected: string[] = []) => {
                      const currentValues = field.value ?? {};

                      const updated = Object.fromEntries(
                        selected.map((key) => {
                          const typedKey = key as CategoryKey;
                          const existingValue = currentValues[typedKey];
                          return [
                            typedKey,
                            typeof existingValue === "number"
                              ? existingValue
                              : true,
                          ];
                        }),
                      ) as Record<CategoryKey, boolean | number>;

                      field.onChange(updated);
                      handleCheckSchema();
                    }}
                    defaultValue={Object.entries(field.value ?? {})
                      .filter(([, isSelected]) => isSelected)
                      .map(([key]) => key)}
                    shortResults={isMobile}
                    placeholder="Select what's provided"
                    variant="basic"
                    maxCount={1}
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
      </div>

      {allInclusive === false && (hasBudgetMin || noBudget) && (
        <>
          {showBudgetInputs && (
            <Separator
              thickness={2}
              className="mx-auto hidden xl:block"
              orientation="vertical"
            />
          )}
          <div
            className={cn(
              "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
              "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
              "lg:pt-10 xl:py-10 4xl:my-auto",
              !showBudgetInputs && "lg:gap-y-0 lg:pt-0 xl:pt-0",

              // "xl:self-center",
            )}
          >
            {activeCategoryFields.length > 0 && hasBudgetMin && (
              <>
                <div className="input-section">
                  <p className="lg:text-xs">Categories</p>
                  <p className="lg:text-xs">Continued</p>
                </div>

                <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="event.type" className="sr-only">
                    Compensation Category Amounts (Optional)
                  </Label>
                  {activeCategoryFields.map(({ label, value }) => (
                    <div
                      key={value}
                      className="flex items-center justify-between gap-4 rounded-md border p-3"
                    >
                      {/* Optional: Replace with an icon specific to each category if needed */}
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        {getCurrencySymbol(
                          openCall?.compensation?.budget?.currency ?? "USD",
                        )}
                        <Controller
                          name={`openCall.compensation.categories.${value}`}
                          control={control}
                          render={({ field }) => (
                            <DebouncedControllerNumInput
                              field={{
                                ...field,
                                onChange: (val) => {
                                  console.log(val);
                                  const num = parseFloat(val);
                                  field.onChange(isNaN(num) ? true : num);
                                },
                              }}
                              min={0}
                              formatNumber={true}
                              placeholder="ex. 250"
                              className="w-25 text-right"
                            />
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="input-section self-start">
              <p className="min-w-max font-bold lg:text-xl">Step 3: </p>
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
                    placeholder="Please list any other compensation-related info here"
                    charLimit={1000}
                  />
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>

    //   )}
  );
};

export default SubmissionFormOC2;
