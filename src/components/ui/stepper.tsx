import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { Check, CheckCircle2, LoaderCircle } from "lucide-react";
import * as React from "react";
import { FaCheckDouble } from "react-icons/fa6";

import { z } from "zod";

interface StepperProps {
  activeStep: number;
  onNextStep?: () => void;
  onBackStep?: () => void;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;

  // setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  skipped?: Set<number>;
  setSkipped?: React.Dispatch<React.SetStateAction<Set<number>>>;
  steps:
    | {
        id: number;
        label: string;
        mobileLabel: string;
        fields?: string[];
        optional?: boolean;
        schema?: z.ZodTypeAny;
      }[]
    | number;
  children?: React.ReactNode;
  className?: string;
  finalLabel?: string;
  onFinalSubmit?: () => void;
  cancelButton?: React.ReactNode;
  onSave?: () => void;
  onPublish?: () => void;
  isDirty?: boolean;
  disabled?: boolean;
  lastSaved?: string | null;
  errorMsg?: string;
  pending?: boolean;
  onCheckSchema?: () => void;
  isAdmin?: boolean;
  isMobile?: boolean;
  adminMode?: boolean;
  formType?: number;
  setFormType?: React.Dispatch<React.SetStateAction<number>>;
  formTypeOptions?: { value: number; Icon: React.ElementType }[];
}

export default function HorizontalLinearStepper({
  activeStep,
  onNextStep,
  onBackStep,
  setActiveStep,
  skipped,
  setSkipped,
  children,
  className,
  steps,
  finalLabel,
  onFinalSubmit,
  cancelButton,
  onSave,
  onPublish,
  isDirty,
  disabled,
  lastSaved,
  errorMsg,
  pending,
  onCheckSchema,
  isAdmin,
  isMobile,
  adminMode,
  formType,
  setFormType,
  formTypeOptions,
}: StepperProps) {
  // console.log(errorMsg);
  // console.log(disabled);
  const stepArray =
    typeof steps === "number"
      ? Array.from({ length: steps }, (_, i) => ({
          label: `${i + 1}`,
          mobileLabel: `${i + 1}`,
          optional: false,
        }))
      : steps;
  const adminFinalStep = isAdmin && activeStep === stepArray.length - 1;
  const finalStep = activeStep === stepArray.length - 1;
  const handleNext = () => {
    if (skipped && setSkipped) {
      if (skipped.has(activeStep)) {
        const newSkipped = new Set(skipped);
        newSkipped.delete(activeStep);
        setSkipped(newSkipped);
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleSkip = () => {
    if (!stepArray[activeStep].optional) {
      throw new Error("You can't skip a step that isn't optional.");
    }
    if (setSkipped) {
      setSkipped((prev) => new Set(prev).add(activeStep));
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleReset = () => setActiveStep(0);
  const lastStep = stepArray.length - 1;
  const firstStep = activeStep === 0;
  return (
    <div
      className={cn(
        "flex h-full max-h-[90dvh] w-full flex-col pt-8 lg:pb-2 lg:pt-4 xl:max-h-[85dvh]",
        className,
      )}
    >
      <section
        id="top-bar"
        className="-mt-[20px] flex flex-col gap-4 lg:mt-auto lg:grid lg:grid-cols-[20%_60%_1fr]"
      >
        <p className="mx-auto flex items-center text-lg lg:text-sm">
          <span className="hidden rounded-full text-center sm:block lg:min-w-40 lg:border-1.5 lg:bg-salYellow/30 lg:p-2 lg:px-4 lg:font-bold">
            {stepArray[activeStep].label}
          </span>
          <span className="rounded-full text-center text-sm sm:hidden">
            {stepArray[activeStep].mobileLabel}
          </span>
        </p>

        {/* Custom Stepper Header with Animated Connectors */}
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4">
          {stepArray.map((step, index) => {
            if (skipped?.has(index)) {
              return null;
            }
            const skippedBefore = [...(skipped ?? [])].filter(
              (skippedIndex) => skippedIndex < index,
            ).length;
            const displayNumber = index + 1 - skippedBefore;

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full items-center",
                  index === lastStep && "w-auto",
                )}
              >
                <div
                  className={cn(
                    "z-10 flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold",
                    {
                      "border-salPinkDark bg-white text-salPinkDark":
                        activeStep === index,
                      "border-salPinkDark bg-salPinkDark text-white ring-4 ring-salPinkLtHover ring-offset-2":
                        activeStep > index,

                      "border-foreground/30 bg-white text-foreground/50":
                        activeStep < index,
                      "opacity-50": skipped?.has(index),
                    },
                    isAdmin && "cursor-pointer hover:scale-105 active:scale-95",
                  )}
                  onClick={() => {
                    if (!isAdmin) return;
                    setActiveStep(index);
                  }}
                >
                  {activeStep > index && !skipped?.has(index) ? (
                    <Check className="size-6" />
                  ) : (
                    displayNumber
                  )}
                </div>

                {/* Animated Line */}
                {index < stepArray.length - 1 && (
                  <motion.div className="relative mx-2 h-1 flex-1 overflow-hidden rounded bg-gray-300">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-salPinkDark"
                      initial={{ width: 0 }}
                      animate={{
                        width: activeStep > index ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {adminMode &&
          typeof formType === "number" &&
          setFormType &&
          ((isMobile && firstStep) || !isMobile) && (
            <div className="relative inset-y-0 z-10 mx-auto mt-3 flex w-40 items-center justify-between overflow-hidden rounded-full border bg-card p-2 shadow-inner lg:mt-0 lg:w-28 lg:p-0">
              {/* Thumb indicator */}
              <div
                className={cn(
                  "absolute left-0 top-0 z-1 h-full w-1/3 bg-background transition-all duration-200 ease-out",
                  formType === 1 && "translate-x-0",
                  formType === 2 && "translate-x-full bg-orange-200",
                  formType === 3 && "translate-x-[200%] bg-emerald-200",
                )}
              />

              {/* Icon buttons */}
              {formTypeOptions?.map(({ value, Icon }) => (
                <button
                  key={value}
                  onClick={() => setFormType(value)}
                  className={cn(
                    "relative z-10 flex w-1/3 items-center justify-center rounded-full px-2 py-1 text-muted-foreground transition-colors hover:text-foreground",
                    formType === value && "text-foreground",
                  )}
                  type="button"
                >
                  <Icon className="size-6 shrink-0 lg:size-4" />
                </button>
              ))}
            </div>
          )}
      </section>

      {/* Scrollable Content */}
      <div className="scrollable justy mini darkbar my-4 h-full flex-1">
        {children}
      </div>

      {/* Buttons */}
      {activeStep === stepArray.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <div className="flex justify-end pt-2">
            <Button onClick={handleReset}>Reset</Button>
          </div>
        </>
      ) : (
        <>
          {errorMsg &&
            errorMsg !== "Required" &&
            errorMsg !== "Invalid input" && (
              <p className="py-4 text-center text-sm italic text-red-600 lg:hidden">
                {errorMsg}
              </p>
            )}
          <div className={cn("flex items-center justify-between gap-x-4")}>
            <section className="hidden items-center gap-x-2 lg:flex">
              <div>
                {activeStep >= 1 && activeStep !== stepArray.length - 1 && (
                  <>
                    {/* <Button
                      variant="salWithShadowHidden"
                      className={cn(
                        "bg-salPinkLtHover opacity-0 hover:bg-salPinkLt lg:hidden",
                        isDirty &&
                          onSave !== undefined &&
                          activeStep >= 1 &&
                          "opacity-100",
                      )}
                      //todo: fix the conditional styling that uses isDirty and onSave
                      disabled={!isDirty || disabled}
                      onClick={onSave}
                    >
                      Save
                    </Button> */}

                    <Button
                      variant="salWithShadowHidden"
                      className={cn(
                        "hidden items-center gap-2 bg-salPinkLtHover opacity-0 hover:bg-salPinkLt disabled:opacity-40 lg:flex",
                        isDirty && onSave !== undefined && "opacity-100",
                      )}
                      //todo: fix the conditional styling that uses isDirty and onSave
                      disabled={!isDirty || disabled}
                      onClick={onSave}
                    >
                      {pending
                        ? "Saving"
                        : !isDirty || disabled
                          ? "Saved"
                          : "Save Progress"}
                      {pending && (
                        <LoaderCircle className="size-4 animate-spin" />
                      )}
                    </Button>
                  </>
                )}
              </div>
              {/* {lastSaved && activeStep >= 1 && (
                <p className="hidden text-xs italic text-muted-foreground lg:block">
                  Last saved: {lastSaved}
                </p>
              )} */}
            </section>
            {onSave !== undefined &&
              (!errorMsg ||
                errorMsg === "Required" ||
                errorMsg === "Invalid input") &&
              !lastSaved &&
              activeStep >= 1 && (
                <p className="hidden text-balance text-sm italic lg:block">
                  You can save at any time and come back to it later.
                </p>
              )}

            {errorMsg &&
              errorMsg !== "Required" &&
              errorMsg !== "Invalid input" && (
                <p className="hidden text-sm italic text-red-600 lg:block">
                  {errorMsg}
                </p>
              )}

            <section
              className={cn(
                "flex min-w-24 items-center justify-end gap-2",
                adminFinalStep &&
                  "w-full flex-col justify-center sm:w-auto sm:flex-row sm:justify-end",
                firstStep && isMobile && "w-full",
              )}
            >
              {lastSaved && activeStep >= 1 && (
                <p className="mr-2 hidden text-xs italic text-muted-foreground lg:block">
                  Last saved: {lastSaved}
                </p>
              )}
              {isAdmin &&
                onCheckSchema &&
                activeStep !== stepArray.length - 1 &&
                isDirty && (
                  <Button
                    variant="salWithShadowHiddenYlw"
                    onClick={onCheckSchema}
                    className="hidden items-center gap-1 sm:flex"
                  >
                    {pending ? "Pending..." : "Check Schema"}
                    {pending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                  </Button>
                )}

              {!lastStep && cancelButton}
              {activeStep !== 0 && (
                <Button
                  variant="salWithShadowHiddenYlw"
                  disabled={activeStep === 0 || pending}
                  // onClick={handleBack}
                  onClick={onBackStep ?? handleBack}
                  className={cn(adminFinalStep && "hidden sm:flex")}
                >
                  Back
                </Button>
              )}

              {stepArray[activeStep].optional && (
                <Button variant="salWithShadowHidden" onClick={handleSkip}>
                  Skip
                </Button>
              )}

              <Button
                variant={
                  disabled || pending
                    ? "salWithoutShadow"
                    : "salWithShadowHidden"
                }
                className={cn(
                  "flex min-w-32 items-center gap-2",
                  firstStep && isMobile && "flex-1",
                  finalStep && "w-full sm:w-auto",
                  finalStep &&
                    !(disabled || pending) &&
                    "translate-x-[3px] translate-y-[-3px] shadow-slg",
                )}
                disabled={disabled || pending}
                onClick={finalStep ? onFinalSubmit : (onNextStep ?? handleNext)}
              >
                {finalStep ? (
                  finalLabel ? (
                    <div className="flex items-center gap-1">
                      {finalLabel}
                      {!pending && <CheckCircle2 className="size-5" />}
                    </div>
                  ) : (
                    "Finish"
                  )
                ) : firstStep ? (
                  "Continue"
                ) : (
                  "Next"
                )}
                {pending && <LoaderCircle className="size-4 animate-spin" />}
              </Button>
              {adminFinalStep && onPublish && (
                <Button
                  variant="salWithShadowHiddenYlw"
                  onClick={onPublish}
                  className={cn(
                    "flex items-center gap-1",
                    adminFinalStep && "w-full sm:w-auto",
                  )}
                >
                  <div className="flex items-center gap-1">
                    {pending ? "Publishing..." : "Publish"}{" "}
                    {!pending && <FaCheckDouble className="size-5" />}
                  </div>

                  {pending && <LoaderCircle className="size-4 animate-spin" />}
                </Button>
              )}
              {adminFinalStep && (
                <Button
                  variant="salWithShadowHiddenYlw"
                  disabled={pending}
                  onClick={onBackStep ?? handleBack}
                  className={cn(adminFinalStep && "w-full sm:hidden")}
                >
                  Back
                </Button>
              )}
            </section>
          </div>

          <div className="mt-4 hidden gap-2 text-center lg:hidden">
            {lastSaved && (
              <p className="text-xs italic text-muted-foreground">
                Last saved: {lastSaved}
              </p>
            )}
            {onSave !== undefined && !lastSaved && activeStep !== 0 && (
              <p className="text-balance text-sm italic">
                (Form will autosave any new info after 1 minute)
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
