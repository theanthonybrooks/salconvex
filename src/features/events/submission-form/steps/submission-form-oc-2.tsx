import { openCallCategoryFields } from "@/constants/openCallConsts";
import { siteUrl } from "@/constants/siteInfo";

import { OpenCallCategoryKey } from "@/types/openCallTypes";
import { User } from "@/types/user";

import { useCallback, useEffect, useState } from "react";
import { currencies, Currency } from "@/app/data/currencies";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { registerPlugin } from "react-filepond";
import { Controller, useFormContext } from "react-hook-form";

import { ArrowRight } from "lucide-react";

import { MultiSelect } from "@/components/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { DebouncedControllerNumInput } from "@/components/ui/debounced-form-num-input";
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
import { getCurrencySymbol } from "@/helpers/currencyFns";
import { cn } from "@/helpers/utilsFns";

import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

interface SubmissionFormOC2Props {
  user: User | undefined;
  isAdmin: boolean;
  isMobile: boolean;
  categoryEvent: boolean;
  canNameEvent: boolean;
  handleCheckSchema: () => void;
  formType: number;
  initialFormType?: number;
  pastEvent: boolean;
}

const SubmissionFormOC2 = ({
  // user,
  isAdmin,
  isMobile,

  // categoryEvent,

  handleCheckSchema,
  formType,
  initialFormType,
  pastEvent: pastEventCheck,
}: SubmissionFormOC2Props) => {
  const [priceAlert, setPriceAlert] = useState<string | null>(null);
  const pastEvent = pastEventCheck && !isAdmin;
  const paidCall = formType === 3;
  const { control, watch, setValue } = useFormContext<EventOCFormValues>();

  const currentFormType = watch("event.formType") ?? 0;
  const openCall = watch("openCall");
  const organizer = watch("organization");
  const selectedCategories = watch("openCall.compensation.categories") ?? {};
  const activeCategoryFields = openCallCategoryFields.filter(
    ({ value }) => selectedCategories?.[value],
  );

  const orgCurrency = organizer?.location?.currency;
  const existingHasBudget = openCall?.compensation?.budget?.hasBudget;
  const [hasBudget, setHasBudget] = useState<boolean | undefined>(
    typeof existingHasBudget === "boolean"
      ? existingHasBudget
      : (paidCall ?? undefined),
  );

  const showBudgetInputs = hasBudget;

  const budgetMin = openCall?.compensation?.budget?.min;
  const budgetMax = openCall?.compensation?.budget?.max;

  const budgetRate = openCall?.compensation?.budget?.rate;
  const budgetUnit = openCall?.compensation?.budget?.unit;
  const validBudgetMin =
    typeof budgetMin === "number" && budgetMin > (paidCall ? 1 : 0);
  // const noBudgetMin = typeof budgetMin === "number" && budgetMin === 0;
  const hasBudgetMin = showBudgetInputs && validBudgetMin;
  const noBudget = hasBudget === false;
  const hasRate =
    typeof budgetRate === "number" && budgetRate > 0 && budgetUnit !== "";
  const allInclusive = openCall?.compensation?.budget?.allInclusive;
  const unknownBudget = openCall?.compensation?.budget?.unknownBudget;

  const hasBudgetValues = budgetMin !== 0 || budgetMax !== 0 || allInclusive;

  // const setValueRef = useRef(setValue);

  const handleResetBudget = useCallback(() => {
    setValue("openCall.compensation.budget.min", 0);
    setValue("openCall.compensation.budget.max", 0);
    setValue("openCall.compensation.budget.rate", 0);
  }, [setValue]);

  // useEffect(() => {
  //   if (!paidCall) return;
  //   if (paidCall) {
  //     setHasBudget(true);
  //   }
  // }, [paidCall, setValue]);

  // useEffect(() => {
  //   const formValue = hasBudget;
  //   const shouldBe = validBudgetMin ? true : undefined;
  //   if (!formValue && validBudgetMin) {
  //     setHasBudget(shouldBe);
  //     setValue("openCall.compensation.budget.max", budgetMin);
  //   } else if (!formValue && noBudgetMin) {
  //     setHasBudget(false);
  //   } else if (formValue === false && validBudgetMin) {
  //     handleResetBudget();
  //   }
  // }, [
  //   validBudgetMin,
  //   noBudgetMin,
  //   setValue,
  //   hasBudget,
  //   budgetMin,
  //   handleResetBudget,
  // ]);

  useEffect(() => {
    if (!initialFormType) return;
    if (initialFormType < currentFormType && hasBudget) {
      setPriceAlert(
        "Note: Budgets over $1,000 (USD) will convert this to a paid call",
      );
    } else {
      setPriceAlert(null);
    }
  }, [currentFormType, initialFormType, paidCall, hasBudget]);

  useEffect(() => {
    if (showBudgetInputs || !hasBudgetValues) return;
    if (showBudgetInputs === false && hasBudgetValues) {
      setValue("openCall.compensation.budget.min", 0);
      setValue("openCall.compensation.budget.max", 0);
      setValue("openCall.compensation.budget.rate", 0);
      setValue("openCall.compensation.budget.allInclusive", false);
      setValue(
        "openCall.compensation.budget.currency",
        orgCurrency?.code ?? "USD",
      );
    }
  }, [hasBudgetValues, showBudgetInputs, setValue, orgCurrency]);

  // #endregion

  return (
    <div
      id="step-1-container"
      className={cn(
        "my-auto flex h-fit w-full flex-col gap-4 sm:w-[90%] lg:w-full xl:justify-center",
        "mx-auto",
        "xl:mx-0 xl:grid xl:max-w-none",
        // allInclusive === false &&
        showBudgetInputs && "xl:grid-cols-[45%_10%_45%] xl:gap-0",
        !showBudgetInputs && "my-auto h-fit lg:gap-0",
        // "min-w-[74vw] sm:min-w-full",
      )}
    >
      <div
        className={cn(
          "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
          "[&_.input-section:not(:first-of-type)]:mt-8 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
          "mx-auto xl:max-w-full xl:py-10 4xl:my-auto",
          !showBudgetInputs && "lg:gap-y-4 lg:pb-5 xl:pb-5",
          "lg:max-w-[60dvw]",
          showBudgetInputs && "self-start",

          // "xl:self-center",
        )}
      >
        {pastEvent && (
          <p className="col-span-2 rounded-lg border-2 border-dashed border-foreground/50 bg-salYellow/30 p-3 text-center">
            Past open calls are read-only (archived)
          </p>
        )}
        <div className="input-section">
          <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
          <p className="lg:text-xs">Budget</p>
        </div>

        <div className="mx-auto flex w-full flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
          <Label htmlFor="hasBudget" className="sr-only">
            Project Budget
          </Label>
          {!paidCall && (
            <>
              <Controller
                name="openCall.compensation.budget.hasBudget"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value: "true" | "false") => {
                      field.onChange(value === "true");
                      setHasBudget(value === "true");
                    }}
                    value={String(field.value) ?? ""}
                    disabled={pastEvent}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 w-full min-w-20 border bg-card text-center text-base sm:h-[50px] sm:w-fit",
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
                )}
              />

              <div className="hidden items-center justify-center px-2 sm:flex">
                <ArrowRight
                  className={cn(
                    "invisible size-4 shrink-0 text-foreground/50",
                    showBudgetInputs && "visible",
                  )}
                />
              </div>
            </>
          )}

          <div
            className={cn(
              "flex min-w-50 flex-1 items-center justify-between gap-x-2 rounded border border-foreground bg-card px-3",
              !showBudgetInputs &&
                "border-foreground/30 opacity-50 [@media(max-width:640px)]:hidden",
              pastEvent && "border-foreground/50 opacity-50",
            )}
          >
            <Controller
              name="openCall.compensation.budget.currency"
              control={control}
              render={({ field }) => (
                <SearchMappedSelect<Currency>
                  searchFields={["name", "symbol", "code"]}
                  className="w-40 border-none bg-card py-2 ring-foreground/50 focus-visible:ring-2 sm:h-fit sm:w-40"
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
                  disabled={!showBudgetInputs || pastEvent || unknownBudget}
                />
              )}
            />
            <div className="flex w-full flex-col">
              <div className="flex w-full select-none items-center justify-center gap-1 text-2xs text-foreground/50">
                <p>Minimum - Maximum</p>
              </div>
              <div className="flex w-full gap-1">
                <Controller
                  name="openCall.compensation.budget.min"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerNumInput
                      field={field}
                      value={field.value ?? 0}
                      onChange={(val) => {
                        field.onChange(val);
                        if (typeof val !== "number") return;
                        if (!budgetMax || val > budgetMax)
                          setValue("openCall.compensation.budget.max", val);
                      }}
                      formatNumber={true}
                      min={0}
                      disabled={!showBudgetInputs || pastEvent || unknownBudget}
                      placeholder="Minimum"
                      className={cn(
                        "h-fit border-none !bg-card px-0 py-0 focus:border-none focus:outline-none sm:text-base",
                        !budgetMin &&
                          showBudgetInputs &&
                          !unknownBudget &&
                          "invalid-field",
                        unknownBudget &&
                          showBudgetInputs &&
                          "!bg-foreground/15 text-foreground/50 opacity-50",
                        "text-center",
                        // "text-end"
                      )}
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
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      disabled={
                        !showBudgetInputs ||
                        pastEvent ||
                        !budgetMin ||
                        unknownBudget
                      }
                      formatNumber={true}
                      // field={{
                      //   ...field,
                      //   onChange: (val: string) => {
                      //     const num = parseFloat(val);
                      //     field.onChange(isNaN(num) ? 0 : num);
                      //   },
                      // }}
                      field={field}
                      // min={budgetMin}
                      debounceMs={1500}
                      placeholder="Maximum "
                      className={cn(
                        "arrowless h-fit border-none !bg-card px-0 py-0 focus:border-none focus:outline-none sm:text-base",
                        "text-center",
                        ((!budgetMin && showBudgetInputs) || unknownBudget) &&
                          showBudgetInputs &&
                          "!bg-foreground/15 text-foreground/50 opacity-50",
                        // "text-start"
                      )}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <>
          {isAdmin && showBudgetInputs && (
            <label
              className={cn(
                "col-start-2 mx-auto flex cursor-pointer items-center gap-2 py-2",
              )}
            >
              <Controller
                name="openCall.compensation.budget.unknownBudget"
                control={control}
                render={({ field }) => {
                  return (
                    <Checkbox
                      tabIndex={0}
                      id="noProdStart"
                      className="focus-visible:bg-salPink/50 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-salPink focus-visible:ring-offset-1 focus-visible:data-[selected=true]:bg-salPink/50"
                      checked={field.value || false}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) handleResetBudget();
                      }}
                    />
                  );
                }}
              />
              <span className={cn("text-sm")}>
                The budget amount is unknown (ie. not provided)
              </span>
            </label>
          )}
          {priceAlert && (
            <span className="col-start-2 mt-2 w-full text-center text-sm text-red-600">
              {priceAlert}
            </span>
          )}
          {showBudgetInputs && (
            <>
              <div className="input-section">
                <p className="lg:text-xs">Rate:</p>
                <p className="text-xs">(optional)</p>
              </div>

              <div className="mx-auto flex w-full flex-col gap-2 sm:flex-row lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="hasBudget" className="sr-only">
                  Budget Rate
                </Label>
                <div
                  className={cn(
                    "flex min-w-50 flex-1 items-center justify-between rounded border border-foreground bg-card px-3",
                    !showBudgetInputs &&
                      "opacity-50 [@media(max-width:640px)]:hidden",
                    pastEvent && "border-foreground/50 opacity-50",
                  )}
                >
                  <Controller
                    name="openCall.compensation.budget.currency"
                    control={control}
                    render={({ field }) => (
                      <SearchMappedSelect<Currency>
                        searchFields={["name", "symbol", "code"]}
                        className="w-40 border-none bg-card py-2 ring-foreground/50 focus-visible:ring-2 sm:h-fit sm:w-40"
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
                        disabled={!showBudgetInputs || pastEvent}
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
                            withDecimal
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            min={0}
                            disabled={!showBudgetInputs || pastEvent}
                            placeholder="Rate (ex: 30)"
                            className="h-fit border-none !bg-card p-2 text-center focus:border-none focus:outline-none sm:text-base"
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
                      disabled={pastEvent}
                      // onValueChange={(value: "ft²" | "m²" | "") => {
                      //   setHasRate(value);
                      // }}
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-12 w-full min-w-25 border bg-card text-center text-base sm:h-[50px] sm:w-fit",
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
              <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="event.category" className="sr-only">
                  All inclusive budget selection
                </Label>
                <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                  <span className="mb-2 sm:mb-0">
                    <p className="text-sm text-foreground">
                      {isMobile
                        ? "Is the budget all-inclusive?"
                        : " Is the budget for this open call all-inclusive?"}
                    </p>
                    <p className="text-xs text-foreground/50">
                      What does this mean?{" "}
                      <a
                        href={`${siteUrl[0]}/faq#all-inclusive`}
                        target="_blank"
                        className="underline"
                      >
                        Learn more
                      </a>
                    </p>
                  </span>
                  <Controller
                    name="openCall.compensation.budget.allInclusive"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disabled={pastEvent}
                        onValueChange={(val: string) =>
                          field.onChange(val === "true")
                        }
                        value={String(field.value) ?? ""}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-12 w-full min-w-20 border bg-card text-center text-base sm:h-[50px] sm:w-fit",
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
        </>

        {(hasBudgetMin || hasRate || noBudget || unknownBudget) && (
          <>
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">Step 2: </p>
              <p className="lg:text-xs">Categories</p>
            </div>

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.type" className="sr-only">
                Event Type
              </Label>
              <Controller
                name="openCall.compensation.categories"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    disabled={pastEvent}
                    id="openCall.compensation.categories"
                    className={cn(
                      "h-12 border bg-card sm:h-[50px]",
                      // errors.event?.type && "invalid-field",
                    )}
                    badgeClassName="py-2 lg:py-2 lg:text-sm bg-card"
                    textClassName="text-base"
                    listClassName="max-h-auto"
                    options={[...openCallCategoryFields]}
                    onValueChange={(selected: string[] = []) => {
                      const currentValues = field.value ?? {};

                      const updated = Object.fromEntries(
                        selected.map((key) => {
                          const typedKey = key as OpenCallCategoryKey;
                          const existingValue = currentValues[typedKey];
                          return [
                            typedKey,
                            typeof existingValue === "number"
                              ? existingValue
                              : true,
                          ];
                        }),
                      ) as Record<OpenCallCategoryKey, boolean | number>;

                      field.onChange(updated);
                      handleCheckSchema();
                    }}
                    defaultValue={Object.entries(field.value ?? {})
                      .filter(([, isSelected]) => isSelected)
                      .map(([key]) => key)}
                    shortResults={isMobile}
                    placeholder="Select what's provided"
                    // placeholder={
                    //   isMobile
                    //     ? `Select what's provided${noBudget ? " (min 1)" : ""}`
                    //     : `Select what's provided${noBudget ? " (minimum 1 category)" : ""}`
                    // }
                    variant="basic"
                    maxCount={1}
                    height={10}
                    shiftOffset={-10}
                    hasSearch={false}
                    selectAll={false}
                    tabIndex={0}
                  />
                )}
              />
            </div>
          </>
        )}
      </div>

      {(hasBudgetMin || hasRate || noBudget || unknownBudget) && (
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
              "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-8 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
              "mx-auto xl:max-w-full xl:py-10 4xl:my-auto",
              "lg:max-w-[60dvw]",
              !showBudgetInputs && "lg:gap-y-0 lg:pt-0 xl:pt-0",

              // "xl:self-center",
            )}
          >
            {allInclusive === false &&
              activeCategoryFields.length > 0 &&
              (hasBudgetMin || unknownBudget) && (
                <>
                  <div className="input-section">
                    <p className="lg:text-xs">Categories</p>
                    <p className="lg:text-xs">Continued</p>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label htmlFor="event.type" className="sr-only">
                      Compensation Category Amounts (Optional)
                    </Label>
                    {activeCategoryFields.map(({ label, value }) => (
                      <div
                        key={value}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-md border p-3",
                          pastEvent && "border-foreground/50 opacity-50",
                        )}
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
                                disabled={pastEvent}
                                field={field}
                                value={
                                  (typeof field.value === "number"
                                    ? field.value
                                    : 0) ?? 0
                                }
                                onChange={(val) => {
                                  field.onChange(val ?? true);
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

            <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="event.type" className="sr-only">
                Budget More Info
              </Label>
              <Controller
                name="openCall.compensation.budget.moreInfo"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Please list any other compensation-related info here"
                    charLimit={2000}
                    readOnly={pastEvent}
                    formInputPreview
                    inputPreviewContainerClassName="rounded-lg"
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
