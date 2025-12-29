import { EventCategory } from "@/types/eventTypes";

import React, { useEffect, useRef, useState } from "react";
import { addDays, startOfDay, subYears } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { motion } from "framer-motion";
import {
  Control,
  Controller,
  get,
  Path,
  useController,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import { FaTrashCan } from "react-icons/fa6";

import {
  CustomDatePicker,
  CustomDatePickerProps,
} from "@/components/ui/date-picker/date-picker";
import { DateTimePickerField } from "@/components/ui/date-picker/day-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { eventBase } from "@/features/organizers/schemas/event-add-schema";
import { fromSeason, toSeason, toYear, toYearMonth } from "@/helpers/dateFns";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";

interface FormDatePickerProps<T> {
  isAdmin: boolean;
  className?: string;
  title: string;
  nameBase: Path<T>;
  type: "event" | "production" | "openCall" | "other";
  watchPath: Path<T>;
}

type EventDateRange = {
  start?: string;
  end?: string;
};
type DateArrayKey = "eventDates" | "prodDates";
type DateFieldKey = "start" | "end";

type DateFieldPath<
  K extends DateArrayKey,
  F extends DateFieldKey,
> = `event.dates.${K}.${number}.${F}`;

type DateFieldProps<K extends DateArrayKey, F extends DateFieldKey> = {
  control: Control<EventOCFormValues>;
  name: DateFieldPath<K, F>;
  timeZone: string;
  minDate?: number;
  maxDate?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
};

function DateField<K extends DateArrayKey, F extends DateFieldKey>({
  control,
  name,
  label,
  disabled,
  timeZone,
  minDate,
  maxDate,
  className,
}: DateFieldProps<K, F>) {
  const { field } = useController({
    name,
    control,
  });

  return (
    <DateTimePickerField
      value={field.value ? Date.parse(field.value) : undefined}
      onChange={(date) => {
        if (!date) return;
        field.onChange(fromZonedTime(date, timeZone).toISOString());
      }}
      label={label}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      timeZone={timeZone}
      inputClassName={className}
      withTime={false}
    />
  );
}

const MemoDateField = React.memo(DateField) as typeof DateField;

export const FormDatePicker = <T extends EventOCFormValues>({
  isAdmin,
  className,
  title,
  nameBase,
  type,
  watchPath,
}: FormDatePickerProps<T>) => {
  const {
    control,
    watch,
    setValue,
    unregister,
    // getValues,
    // setError,
    // trigger,
    formState: { errors, dirtyFields },
  } = useFormContext<EventOCFormValues>();
  const isFieldInvalid = (path: keyof EventOCFormValues | string) => {
    return get(errors, path)?.message && get(dirtyFields, path);
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const didInitialRun = useRef(false);
  const initialValue = useRef<string | undefined>(undefined);
  const prevFormatValue = useRef<string | undefined>(undefined);

  const data = watch(watchPath) as z.infer<typeof eventBase.shape.dates>;
  const eventData = watch("event");
  const organizer = watch("organization");
  const orgTimezone =
    organizer?.location?.timezone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const edition = eventData?.dates?.edition;
  // console.log(eventData?.dates);
  const eventFormat = eventData?.dates?.eventFormat;
  const hasEventDates = eventFormat !== "noEvent" && eventFormat !== "ongoing";
  const isEvent = type === "event";
  // const categoryNotEvent = eventData?.category !== "event";
  const isProduction = type === "production";
  //   const isOpenCall = type === "openCall";
  //   const isOther = type === "other";
  const formatBase = type === "event" ? "event" : "prod";
  const formatKey = formatBase === "event" ? "eventDates" : "prodDates";
  const formatField = type === "event" ? "eventFormat" : "prodFormat";
  const formatError = errors.event?.dates?.[formatField];
  const formatDatesError = errors.event?.dates?.[formatKey];

  const formatDatesValue = data?.[formatKey];

  const formatDatesArray = watch(`${nameBase}.${formatKey}` as Path<T>) as
    | EventDateRange[]
    | undefined;
  const formatValue = watch(`${nameBase}.${formatField}` as Path<T>);
  // const isSetDates = formatValue === "setDates";

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${nameBase}.${formatKey}` as
      | "event.dates.eventDates"
      | "event.dates.prodDates",
  });

  const lastIndex = formatDatesArray?.length ? formatDatesArray.length - 1 : 0;
  const lastStart = formatDatesArray?.[lastIndex]?.start ?? "";
  const lastEnd = formatDatesArray?.[lastIndex]?.end ?? "";

  const watchedStart = watch(`${nameBase}.${formatKey}.0.start` as Path<T>);
  const watchedEnd = watch(`${nameBase}.${formatKey}.0.end` as Path<T>);
  const noProdStart =
    watch(`${nameBase}.noProdStart` as Path<T>) && type === "production";
  const canAddMore = lastStart !== "" && lastEnd !== "";

  //   console.log(formatDatesArray);

  //   console.log(formatValue, formatDatesValue);

  //   console.log(formatValue);
  //   console.log(formatDatesArray?.[0]?.end);

  // ...

  function getSequentialMinDate<T>(
    watch: (name: Path<T>) => unknown,
    nameBase: Path<T>,
    formatKey: string,
    index: number,
  ): Date | undefined {
    const getDate = (val?: unknown) =>
      val && typeof val === "string" ? new Date(val) : undefined;

    const currentStart = getDate(
      watch(`${nameBase}.${formatKey}.${index}.start` as Path<T>),
    );
    const prevEnd =
      index > 0
        ? getDate(watch(`${nameBase}.${formatKey}.${index - 1}.end` as Path<T>))
        : undefined;

    if (currentStart && prevEnd) {
      return new Date(Math.max(currentStart.getTime(), prevEnd.getTime()));
    }

    return currentStart || prevEnd;
  }

  useEffect(() => {
    const isFirstRender = !didInitialRun.current;
    if (!initialValue.current) {
      initialValue.current = formatValue as string | undefined;
    }

    const hasFormatChanged = !!(
      formatValue &&
      initialValue.current &&
      initialValue.current !== formatValue
    );

    didInitialRun.current = true;

    // On first render: only proceed if format is not set
    if (isFirstRender && formatValue) return;
    // console.log("first render");

    // On later renders: only proceed if format has changed
    if (!hasFormatChanged && formatValue) return;
    // console.log("format has changed");
    // Update previous format tracker
    prevFormatValue.current = formatValue as string;

    if (type === "production") {
      // console.log(formatValue);
      if (formatValue === "monthRange") {
        // console.log("month range");
        setValue(
          "event.dates.prodDates",
          [{ start: toYearMonth(new Date()), end: "" }],
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );
      } else if (formatValue === "yearRange") {
        // console.log("year range");
        // const y = toYear(new Date());
        const y = String(edition);
        setValue("event.dates.prodDates", [{ start: y, end: y }], {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else if (formatValue === "seasonRange") {
        setValue(
          "event.dates.prodDates",
          [{ start: toSeason(new Date()), end: "" }],
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );
      } else if (formatValue === "setDates") {
        setValue(
          "event.dates.prodDates",
          [{ start: eventData.dates.eventDates[0].start, end: "" }],
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );
      }
    } else if (type === "event") {
      const isOngoing = formatValue === "ongoing";
      if (isOngoing) {
        unregister("event.dates.prodFormat");
        unregister("event.dates.prodDates");
      }
    }
    initialValue.current = formatValue as string | undefined;
  }, [
    formatValue,
    type,
    eventData?.dates?.eventDates,
    setValue,
    unregister,
    edition,
  ]);

  useEffect(() => {
    const isSetDates = formatValue === "setDates";
    const hasNoFields = fields.length === 0;

    if (isSetDates && hasNoFields) {
      append({ start: "", end: "" });
    }
  }, [formatValue, fields.length, append]);

  const prodFormat = useWatch({ name: "event.dates.prodFormat" });
  const eventDatess = useWatch({ name: "event.dates.eventDates" });

  useEffect(() => {
    if (prodFormat === "sameAsEvent" && Array.isArray(eventDatess)) {
      setValue("event.dates.prodDates", [...eventDatess], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [prodFormat, eventDatess, setValue]);

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-2 p-0.5 lg:w-full lg:min-w-[300px] lg:max-w-md",
        className,
      )}
    >
      <Label htmlFor="event.dates.eventFormat" className="sr-only">
        {title}
      </Label>
      <Controller
        key={`${nameBase}.${formatField}` as Path<T>}
        name={`${nameBase}.${formatField}` as Path<T>}
        control={control}
        render={({ field }) => {
          return (
            <Select
              onValueChange={(value: EventCategory) => {
                field.onChange(value);
              }}
              value={String(field.value) ?? ""}
            >
              <SelectTrigger className="h-12 w-full border bg-card text-center text-base placeholder:text-muted-foreground/30 sm:h-[50px]">
                <SelectValue
                  placeholder={
                    isEvent
                      ? `${getEventCategoryLabel(
                          eventData?.category as EventCategory,
                          true,
                        )} Date Format (select one)`
                      : "Production Date Format (select one)"
                  }
                  className="placeholder:text-muted-foreground/70"
                />
              </SelectTrigger>
              <SelectContent className="min-w-auto">
                {isProduction && hasEventDates && (
                  <SelectItem fit value="sameAsEvent">
                    Same as{" "}
                    {getEventCategoryLabel(
                      eventData?.category as EventCategory,
                      true,
                    )}
                  </SelectItem>
                )}
                <SelectItem fit value="setDates">
                  Fixed Dates
                </SelectItem>
                <SelectItem fit value="monthRange">
                  Month Range
                </SelectItem>
                <SelectItem fit value="yearRange">
                  Year Range
                </SelectItem>
                <SelectItem fit value="seasonRange">
                  Season Range
                </SelectItem>

                {!isProduction && (
                  <SelectItem fit value="ongoing">
                    Ongoing
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          );
        }}
      />

      {formatError && formatValue && (
        <span className="mt-2 w-full text-center text-sm text-red-600">
          {formatError?.message ??
            "Please select a date format from the dropdown"}
        </span>
      )}
      {formatValue &&
        formatValue !== "ongoing" &&
        formatValue !== "sameAsEvent" &&
        formatValue !== "noEvent" && (
          <div className="scrollable mini mx-auto flex max-h-52 w-full flex-col gap-2 overflow-y-auto overflow-x-visible p-0.5 lg:min-w-[300px] lg:max-w-md">
            <Label htmlFor="event.dates.eventDates" className="sr-only">
              {type.charAt(0).toUpperCase() + type.slice(1)} Dates
            </Label>

            {formatValue === "setDates" && (
              <>
                {fields.map((field, index) => {
                  const prevEndDate =
                    index > 0
                      ? (watch(
                          `${nameBase}.${formatKey}.${index - 1}.end` as Path<T>,
                        ) as string | undefined)
                      : undefined;
                  // const watchedSetStart = watch(
                  //   `${nameBase}.${formatKey}.${index}.start` as Path<T>,
                  // ) as string | undefined;
                  const watchedSetEnd = watch(
                    `${nameBase}.${formatKey}.${index}.end` as Path<T>,
                  ) as string | undefined;
                  const fiveYearsAgo = subYears(new Date(), 5);

                  return (
                    <div
                      key={field.id}
                      className="relative flex max-w-full items-center gap-x-2"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {index > 0 && (
                        <motion.button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute left-0 z-top -translate-y-1/2 text-red-500 hover:scale-105 hover:text-red-700 active:scale-95"
                          animate={hoveredIndex === index ? "hover" : "rest"}
                          variants={{
                            rest: { opacity: 0, x: -5, scale: 0.8 },
                            hover: { opacity: 1, x: 10, scale: 1 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          aria-label="Remove date range"
                        >
                          <FaTrashCan className="size-4" />
                        </motion.button>
                      )}
                      <MemoDateField
                        control={control}
                        name={`event.dates.${formatKey}.${index}.start`}
                        disabled={noProdStart}
                        label={noProdStart ? "(Flexible/Open)" : undefined}
                        timeZone={orgTimezone}
                        minDate={
                          isAdmin && !prevEndDate
                            ? startOfDay(fiveYearsAgo).getTime()
                            : prevEndDate
                              ? startOfDay(addDays(prevEndDate, 1)).getTime()
                              : undefined
                        }
                        maxDate={
                          watchedSetEnd ? Date.parse(watchedSetEnd) : undefined
                        }
                        className={cn(
                          "h-12 border-foreground bg-card hover:bg-salYellow/20 sm:h-11",
                          isFieldInvalid(
                            `${nameBase}.${formatKey}.${index}.start`,
                          ) && "invalid-field",
                        )}
                      />
                      -
                      <MemoDateField
                        control={control}
                        name={`event.dates.${formatKey}.${index}.end`}
                        timeZone={orgTimezone}
                        minDate={(() => {
                          const sequentialMin = getSequentialMinDate(
                            watch,
                            nameBase,
                            formatKey,
                            index,
                          );
                          return sequentialMin
                            ? startOfDay(sequentialMin).getTime()
                            : undefined;
                        })()}
                        className={cn(
                          "h-12 border-foreground bg-card hover:bg-salYellow/20 sm:h-11",
                          isFieldInvalid(
                            `${nameBase}.${formatKey}.${index}.end`,
                          ) && "invalid-field",
                        )}
                      />
                    </div>
                  );
                })}

                {canAddMore && !noProdStart && (
                  <button
                    type="button"
                    onClick={() => append({ start: "", end: "" })}
                    className={cn(
                      "my-3 text-center text-sm font-medium text-foreground hover:underline lg:my-0",
                    )}
                  >
                    Add More Dates +
                  </button>
                )}
              </>
            )}

            {formatValue === "monthRange" && (
              <div
                className="flex max-w-full items-center gap-x-2"
                key={`monthRange-${nameBase}-${formatKey}-${type}`}
              >
                <Controller
                  name={`${nameBase}.${formatKey}.0.start` as Path<T>}
                  control={control}
                  render={({ field }) => {
                    return (
                      <CustomDatePicker
                        isAdmin={isAdmin}
                        pickerType="month"
                        placeholder={
                          noProdStart ? "(Flexible/Open)" : undefined
                        }
                        disabled={noProdStart}
                        // value={field.value as CustomDatePickerProps["value"]}
                        value={watchedStart as CustomDatePickerProps["value"]}
                        onChange={(date) => field.onChange(toYearMonth(date))}
                        className="w-full rounded border p-2 text-center"
                        inputClassName="h-12"
                        maxDate={formatDatesArray?.[0]?.end}
                      />
                    );
                  }}
                />
                -
                <Controller
                  name={`${nameBase}.${formatKey}.0.end` as Path<T>}
                  control={control}
                  render={({ field }) => {
                    return (
                      <CustomDatePicker
                        isAdmin={isAdmin}
                        pickerType="month"
                        value={watchedEnd as CustomDatePickerProps["value"]}
                        onChange={(date) => field.onChange(toYearMonth(date))}
                        className="w-full rounded border p-2 text-center"
                        inputClassName="h-12"
                        minDate={formatDatesArray?.[0]?.start}
                      />
                    );
                  }}
                />
              </div>
            )}
            {formatValue === "yearRange" && (
              <div
                className="flex max-w-full items-center gap-x-2"
                key={`yearRange-${nameBase}-${formatKey}-${type}`}
              >
                <Controller
                  name={`${nameBase}.${formatKey}.0.start` as Path<T>}
                  control={control}
                  render={({ field }) => {
                    const endPath =
                      `${nameBase}.${formatKey}.0.end` as Path<EventOCFormValues>;

                    return (
                      <CustomDatePicker
                        isAdmin={isAdmin}
                        pickerType="year"
                        value={watchedStart as CustomDatePickerProps["value"]}
                        // onChange={(date) => field.onChange(toYear(date))}
                        placeholder={
                          noProdStart ? "(Flexible/Open)" : undefined
                        }
                        disabled={noProdStart}
                        onChange={(date) => {
                          const y = toYear(date);
                          field.onChange(y);

                          const currentEnd = watch(endPath) as
                            | string
                            | undefined;
                          if (
                            !currentEnd ||
                            parseInt(currentEnd, 10) < parseInt(y, 10)
                          ) {
                            setValue(endPath, y, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        }}
                        className="w-full rounded border p-2 text-center"
                        inputClassName="h-12"
                        // maxDate={formatDatesArray?.[0]?.end}
                      />
                    );
                  }}
                />
                -
                <Controller
                  name={`${nameBase}.${formatKey}.0.end` as Path<T>}
                  control={control}
                  render={({ field }) => {
                    return (
                      <CustomDatePicker
                        isAdmin={isAdmin}
                        pickerType="year"
                        value={watchedEnd as CustomDatePickerProps["value"]}
                        onChange={(date) => field.onChange(toYear(date))}
                        className="w-full rounded border p-2 text-center"
                        inputClassName="h-12"
                        minDate={formatDatesArray?.[0]?.start}
                      />
                    );
                  }}
                />
              </div>
            )}
            {formatValue === "seasonRange" && (
              <div
                className="flex max-w-full items-center gap-x-2"
                key={`seasonRange-${nameBase}-${formatKey}-${type}`}
              >
                <Controller
                  name={`${nameBase}.${formatKey}.0.start` as Path<T>}
                  control={control}
                  render={({ field }) => {
                    const endDate = fromSeason(
                      formatDatesArray?.[0]?.end ?? "",
                    );

                    return (
                      <CustomDatePicker
                        isAdmin={isAdmin}
                        pickerType="season"
                        placeholder={
                          noProdStart ? "(Flexible/Open)" : undefined
                        }
                        disabled={noProdStart}
                        value={watchedStart as CustomDatePickerProps["value"]}
                        onChange={(date) => {
                          field.onChange(toSeason(date));
                        }}
                        className="w-full rounded border p-2 text-center"
                        inputClassName="h-12"
                        minDate={isAdmin ? undefined : new Date()}
                        maxDate={endDate ?? undefined}
                      />
                    );
                  }}
                />
                -
                <Controller
                  name={`${nameBase}.${formatKey}.0.end` as Path<T>}
                  control={control}
                  render={({ field }) => {
                    return (
                      <CustomDatePicker
                        isAdmin={isAdmin}
                        pickerType="season"
                        value={watchedEnd as CustomDatePickerProps["value"]}
                        onChange={(date) => field.onChange(toSeason(date))}
                        className="w-full rounded border p-2 text-center"
                        inputClassName="h-12"
                        minDate={
                          fromSeason(formatDatesArray?.[0]?.start ?? "") ??
                          new Date()
                        }
                      />
                    );
                  }}
                />
              </div>
            )}
            {formatDatesError && formatDatesValue && (
              <span className="mt-2 w-full text-center text-sm text-red-600">
                {formatDatesError?.message ??
                  "Please select a date format from the dropdown"}
              </span>
            )}
          </div>
        )}
    </div>
  );
};
