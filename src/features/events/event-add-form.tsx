import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import HorizontalLinearStepper from "@/components/ui/stepper"
import { User } from "@/types/user"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"
import { Input } from "@/components/ui/input"
import { OrgSearch } from "@/features/organizers/components/org-search"
import { eventOCSchema } from "@/features/organizers/schemas/event-add-schema"

import { useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { z } from "zod"
import { api } from "~/convex/_generated/api"

interface EventOCFormProps {
  user: User | undefined
  onClick: () => void
  children?: React.ReactNode
}

// type EventOCFormValues = {
//   organization: {
//     _id: Id<"organizations">
//     organizationName: string
//     logo?: string
//     // include whatever else you need from the org
//   } | null
//   eventName: string
// }

type EventOCFormValues = z.infer<typeof eventOCSchema>

const stepFields: Record<number, (keyof z.infer<typeof eventOCSchema>)[]> = {
  0: ["organization", "eventName"],
  1: ["eventType", "budget"],
  2: ["deadline"],
  3: ["description"],
  4: [], // etc.
  5: [], // final confirm step
}

export const EventOCForm = ({ user, onClick }: EventOCFormProps) => {
  //   const {
  //     register,
  //     control,
  //     watch,

  //     // setValue,
  //     handleSubmit: handleSubmit,
  //     formState: {
  //       isValid,
  //       //   dirtyFields,
  //       isDirty,
  //       errors,
  //     },
  //     reset,
  //   } = useForm<z.infer<typeof eventOCSchema>>({
  //     resolver: zodResolver(eventOCSchema),
  //     defaultValues: {
  //       organization: undefined,
  //       eventName: "",
  //     },
  //     mode: "onChange",
  //   })

  //   const selectedOrg = useWatch({
  //     control,
  //     name: "organization",
  //   })
  const form = useForm<EventOCFormValues>({
    resolver: undefined,
    defaultValues: {
      organization: null,
      eventName: "",
    },
    mode: "onChange",
  })

  console.log(form.watch())

  const {
    register,
    control,
    watch,
    // setValue,
    handleSubmit,
    formState: {
      //   isValid,
      isSubmitting,
      //   dirtyFields,
      isDirty,
      errors,
    },
    reset,
  } = form

  const orgValue = watch("organization")
  const orgName =
    typeof orgValue === "string" ? orgValue : orgValue?.organizationName ?? ""
  const existingOrgs = typeof orgValue === "object"

  const orgValidation = useQuery(
    api.organizations.isOwnerOrIsNewOrg,
    orgName.trim().length >= 3 ? { organizationName: orgName } : "skip"
  )
  const [orgError, setOrgError] = useState("")
  //   const [error, setError] = useState({ message: "" })
  const [isValidOrg, setIsValidOrg] = useState<string>("")
  //   const formIsValid = isValid && isValidOrg === "valid"

  console.log("Form errors:", errors)
  //   console.log("isValid", isValid)
  //   console.log("isValidOrg", isValidOrg)
  //   console.log("existingOrgs", existingOrgs)
  //   console.log("selectedOrg", selectedOrg)
  //   console.log("formIsValid", formIsValid)
  // const eventResults = useQuery(
  //   api.events.searchEventsByOrg,
  //   existingOrgId ? { orgId: existingOrgId } : "skip"
  // )

  if (user?.accountType?.includes("rabbit")) {
    onClick()
  }

  const [activeStep, setActiveStep] = useState(0)
  const stepHasErrors = stepFields[activeStep].some((field) => !!errors[field])
  //   const [name, setName] = useState("")

  const onCancel = () => {
    setActiveStep(0)
  }

  const onSubmit = async (data: EventOCFormValues) => {
    console.log("data", data)
    try {
      console.log("organizer mode)")
      reset()
      toast.success("Successfully updated profile! Forwarding to Stripe...")

      setTimeout(() => {
        // onClick()
      }, 2000)
    } catch (error) {
      console.error("Failed to submit form:", error)
      toast.error("Failed to submit form")
    }
  }

  const onStepSave = async () => {
    const fields = stepFields[activeStep] // fields for this step
    const values = form.getValues(fields) // only those fields

    console.log("values", values)
    console.log("fields", fields)

    const schemaForStep = eventOCSchema.pick(
      fields.reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {} as { [K in keyof EventOCFormValues]?: true })
    )

    const result = schemaForStep.safeParse(values)
    console.log("result", result)

    if (!result.success) {
      // Set field-level errors for only this step
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof EventOCFormValues, {
          type: "manual",
          message: issue.message,
        })
      })
      return
    }

    // ✅ Step is valid — optionally persist step data here
    console.log("Step valid data:", result.data)

    // Advance to next step
    setActiveStep((prev) => prev + 1)
  }

  useEffect(() => {
    if (orgValidation === "available" || orgValidation === "ownedByUser") {
      setOrgError("")
      setIsValidOrg("valid")
    } else if (!orgValidation) {
      setOrgError("")
      setIsValidOrg("")
    } else {
      setOrgError("Organization already exists")
      setIsValidOrg("invalid")
    }
  }, [orgValidation])

  return (
    <HorizontalLinearStepper
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      steps={6}
      className='px-2 xl:px-8'
      finalLabel='Submit'
      onFinalSubmit={handleSubmit(onSubmit)}
      isDirty={isDirty}
      onSave={onStepSave}
      disabled={stepHasErrors || isSubmitting}
      //   disabled={isStepValid === false}
      cancelButton={
        <DialogClose asChild>
          <Button
            type='button'
            variant='salWithShadowHiddenYlw'
            className='min-w-24'
            onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
      }>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col grow  p-4  min-h-96 h-full
   '>
        {activeStep === 0 && (
          <div className='h-full flex flex-col gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>
            <section className='flex flex-col  gap-2 '>
              <div className='flex flex-col gap-y-6 items-center '>
                <div className='flex flex-col  items-center '>
                  <div className='font-tanker lowercase text-[2.5em]  lg:text-[4em] tracking-wide text-foreground'>
                    Welcome{" "}
                    <AnimatePresence>
                      {existingOrgs && isValidOrg === "valid" && (
                        <motion.span
                          key='back-text'
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
                          className='inline-block'>
                          Back
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className='text-center text-balance'>
                    {existingOrgs
                      ? "Please select from your existing events or create a new open call"
                      : "To start, select from an existing organization or create a new one!"}
                  </p>
                </div>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='organization' className='sr-only'>
                    Organization Name
                  </Label>
                  <Controller
                    name='organization'
                    control={control}
                    render={({ field }) => (
                      <OrgSearch
                        value={field.value}
                        onChange={field.onChange}
                        // setSelectedOrgData={setSelectedOrgData}
                        isValid={isValidOrg}
                        onReset={() => {
                          setIsValidOrg("")
                          setOrgError("")
                        }}
                        placeholder='Search or enter new name'
                        className='max-w-sm lg:max-w-md lg:min-w-[400px] lg:h-20 py-2 text-base lg:text-xl rounded-lg'
                      />
                    )}
                  />
                  {orgError && (
                    <span className='text-red-600 text-sm w-full text-center mt-2'>
                      {orgError}
                    </span>
                  )}
                </div>
              </div>
            </section>
            <section>
              {existingOrgs && (
                <Select onValueChange={() => {}} defaultValue={"1"}>
                  <SelectTrigger className='max-w-sm  p-8 text-base text-center mt-6'>
                    <SelectValue placeholder='Select from your events ' />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value='1'>Event 1</SelectItem>
                    <SelectItem value='2'>Event 2</SelectItem>
                    <SelectItem value='3'>Event 3</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Label>Event Name</Label>
              <Input
                {...register("eventName")}
                placeholder='Task title...'
                className='w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-base  lg:text-sm placeholder-violet-300 focus:outline-none'
              />
              {/* <p>
                Check here if the organizer (a) already exists,
                <br /> (b) has any current events (that they may want to add a
                new open call for) ,
                <br /> (c)has any current open calls (so they don&apos;t
                accidentally create a duplicate) and
                <br /> (d) to give a brief intro and ask the MOST basic event
                info if this is their first. If no existing events, use this as
                a starting point and a sort of welcome/intro page to posting an
                open call here.
              </p> */}
            </section>
          </div>
        )}
        {activeStep === 1 && (
          <p className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>Second Step</p>
        )}
        {activeStep === 2 && (
          <p className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>Third Step </p>
        )}
        {activeStep === 3 && (
          <p className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>Final Step</p>
        )}
      </form>
    </HorizontalLinearStepper>
  )
}
