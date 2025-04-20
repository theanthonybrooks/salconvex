import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";
import * as React from "react";
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
  isDirty?: boolean;
  disabled?: boolean;
  lastSaved?: string | null;
  errorMsg?: string;
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
  isDirty,
  disabled,
  lastSaved,
  errorMsg,
}: StepperProps) {
  const stepArray =
    typeof steps === "number"
      ? Array.from({ length: steps }, (_, i) => ({
          label: `${i + 1}`,
          optional: false,
        }))
      : steps;
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

  return (
    <div
      className={cn(
        "flex h-full max-h-[90dvh] w-full flex-col pt-8 lg:max-h-[85dvh] lg:pb-2 lg:pt-4",
        className,
      )}
    >
      <section
        id="top-bar"
        className="-mt-[20px] flex flex-col gap-4 lg:mt-auto lg:grid lg:grid-cols-[20%_60%_1fr]"
      >
        <p className="mx-auto flex items-center text-lg lg:text-sm">
          <span className="rounded-full text-center lg:min-w-40 lg:border-1.5 lg:bg-salYellow/30 lg:p-2 lg:px-4 lg:font-bold">
            {stepArray[activeStep].label}
          </span>
        </p>

        {/* Custom Stepper Header with Animated Connectors */}
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4">
          {stepArray.map((step, index) => (
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
                  },
                )}
              >
                {activeStep > index ? <Check className="size-6" /> : index + 1}
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
          ))}
        </div>
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
          <div className={cn("flex items-center justify-between gap-x-4")}>
            <section className="flex items-center gap-x-2">
              <div>
                {activeStep >= 1 && (
                  <>
                    <Button
                      variant="salWithShadowHidden"
                      className={cn(
                        "bg-salPinkLtHover opacity-0 hover:bg-salPinkLt lg:hidden",
                        isDirty &&
                          onSave !== undefined &&
                          activeStep >= 1 &&
                          "opacity-100",
                      )}
                      //todo: fix the conditional styling that uses isDirty and onSave
                      disabled={!isDirty}
                      onClick={onSave}
                    >
                      Save
                    </Button>

                    <Button
                      variant="salWithShadowHidden"
                      className={cn(
                        "hidden bg-salPinkLtHover opacity-0 hover:bg-salPinkLt lg:block",
                        isDirty && onSave !== undefined && "opacity-100",
                      )}
                      //todo: fix the conditional styling that uses isDirty and onSave
                      disabled={!isDirty}
                      onClick={onSave}
                    >
                      Save Progress
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
              !errorMsg &&
              !lastSaved &&
              activeStep >= 1 && (
                <p className="hidden text-balance text-sm italic lg:block">
                  You can save at any time and come back to it later.
                </p>
              )}
            {errorMsg && (
              <p className="hidden text-sm italic text-red-600 lg:block">
                {errorMsg}
              </p>
            )}
            <section className="flex min-w-24 items-center justify-end gap-2">
              {lastSaved && activeStep >= 1 && (
                <p className="mr-2 hidden text-xs italic text-muted-foreground lg:block">
                  Last saved: {lastSaved}
                </p>
              )}
              {cancelButton}
              {activeStep !== 0 && (
                <Button
                  variant="salWithShadowHiddenYlw"
                  disabled={activeStep === 0}
                  // onClick={handleBack}
                  onClick={onBackStep ?? handleBack}
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
                variant="salWithShadowHidden"
                className="min-w-32"
                disabled={disabled}
                onClick={
                  activeStep === lastStep
                    ? onFinalSubmit
                    : (onNextStep ?? handleNext)
                }
              >
                {activeStep === stepArray.length - 1 ? (
                  finalLabel ? (
                    <div className="flex items-center gap-1">
                      {finalLabel} <CheckCircle2 className="size-5" />
                    </div>
                  ) : (
                    "Finish"
                  )
                ) : activeStep === 0 ? (
                  "Continue"
                ) : (
                  "Next"
                )}
              </Button>
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
