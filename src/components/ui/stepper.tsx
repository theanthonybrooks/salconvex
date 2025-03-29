import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Typography from "@mui/material/Typography"
import { motion } from "framer-motion"
import { Check, CheckCircle2 } from "lucide-react"
import * as React from "react"

interface StepperProps {
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  skipped?: Set<number>
  setSkipped?: React.Dispatch<React.SetStateAction<Set<number>>>
  steps: { label: string; optional?: boolean }[] | number
  children?: React.ReactNode
  className?: string
  finalLabel?: string
  onFinalSubmit?: () => void
  cancelButton?: React.ReactNode
  onSave?: () => void
  isDirty?: boolean
}

export default function HorizontalLinearStepper({
  activeStep,
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
}: StepperProps) {
  const stepArray =
    typeof steps === "number"
      ? Array.from({ length: steps }, (_, i) => ({
          label: `Step ${i + 1}`,
          optional: false,
        }))
      : steps

  const handleNext = () => {
    if (skipped && setSkipped) {
      if (skipped.has(activeStep)) {
        const newSkipped = new Set(skipped)
        newSkipped.delete(activeStep)
        setSkipped(newSkipped)
      }
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)
  const handleSkip = () => {
    if (!stepArray[activeStep].optional) {
      throw new Error("You can't skip a step that isn't optional.")
    }
    if (setSkipped) {
      setSkipped((prev) => new Set(prev).add(activeStep))
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleReset = () => setActiveStep(0)
  const lastStep = stepArray.length - 1

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full lg:max-h-[85dvh] max-h-[90dvh] pt-4 pb-8 lg:pb-4",
        className
      )}>
      {/* Custom Stepper Header with Animated Connectors */}
      <div className='flex items-center justify-center gap-4 w-full max-w-3xl mx-auto px-4'>
        {stepArray.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full items-center",
              index === lastStep && "w-auto"
            )}>
            <div
              className={cn(
                "size-6 rounded-full text-xs flex items-center justify-center z-10 border-2 font-bold",
                {
                  "bg-white text-salPinkDark border-salPinkDark  ":
                    activeStep === index,
                  "bg-salPinkDark text-white border-salPinkDark ring-4 ring-salPinkLtHover ring-offset-2 ":
                    activeStep > index,

                  "bg-white text-foreground/50 border-foreground/30 ":
                    activeStep < index,
                }
              )}>
              {activeStep > index ? <Check className='size-6' /> : index + 1}
            </div>

            {/* Animated Line */}
            {index < stepArray.length - 1 && (
              <motion.div className='relative flex-1 h-1 bg-gray-300 mx-2 overflow-hidden rounded'>
                <motion.div
                  className='absolute left-0 top-0 h-full bg-salPinkDark'
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

      {/* Scrollable Content */}
      <div className='my-4 flex-1 h-full scrollable justy mini darkbar'>
        {children}
      </div>

      {/* Buttons */}
      {activeStep === stepArray.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <div className='flex justify-end pt-2'>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        </>
      ) : (
        <div className='flex  justify-between items-center'>
          <Button
            variant='salWithShadowHidden'
            className={cn(
              "opacity-0 bg-salPinkLtHover hover:bg-salPinkLt hidden lg:block",
              isDirty && onSave !== undefined && "opacity-100"
            )}
            disabled={!isDirty}
            onClick={onSave}>
            Save Progress
          </Button>
          {onSave !== undefined && (
            <p className=' text-balance text-sm italic hidden lg:block'>
              You can save at any time and come back to it later.
            </p>
          )}
          <div className='flex justify-end gap-2'>
            {cancelButton}
            <Button
              variant='salWithShadowHiddenYlw'
              disabled={activeStep === 0}
              onClick={handleBack}>
              Back
            </Button>

            {stepArray[activeStep].optional && (
              <Button variant='salWithShadowHidden' onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button
              variant='salWithShadowHidden'
              className='min-w-32'
              onClick={activeStep === lastStep ? onFinalSubmit : handleNext}>
              {activeStep === stepArray.length - 1 ? (
                finalLabel ? (
                  <div className='flex items-center gap-1'>
                    {finalLabel} <CheckCircle2 className='size-5' />
                  </div>
                ) : (
                  "Finish"
                )
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
