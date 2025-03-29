import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import HorizontalLinearStepper from "@/components/ui/stepper"
import { User } from "@/types/user"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"
import { EventData } from "@/types/event"

interface EventOCFormProps {
  user: User | undefined
  onClick: () => void
  children?: React.ReactNode
}

export const EventOCForm = ({ user, onClick }: EventOCFormProps) => {
  const {
    // register,
    // control,
    // setValue,
    handleSubmit,
    formState: {
      // isDirty,
      // errors,
      //   isValid,
    },
    reset,
  } = useForm<EventData>({
    // defaultValues: eventDefaultValues,
    mode: "onChange",
  })

  const [activeStep, setActiveStep] = useState(0)
  const [hasPrevEvent] = useState(true)
  const [title, setTitle] = useState("")
  //   const [name, setName] = useState("")

  const onCancel = () => {
    setActiveStep(0)
  }

  console.log("user", user)

  //   useEffect(() => {
  //     setName(user?.name ?? `${user?.firstName} ${user?.lastName}`)
  //   }, [user])

  //   useEffect(() => {
  //     if (!artistInfo) return

  //     reset({
  //       artistName: artistInfo.artistName ?? name,
  //       nationalities: artistInfo.artistNationality ?? [],
  //       residence: artistInfo.artistResidency?.full ?? "",
  //       locationCity: artistInfo.artistResidency?.city ?? "",
  //       locationState: artistInfo.artistResidency?.state ?? "",
  //       locationCountry: artistInfo.artistResidency?.country ?? "",
  //       locationCoordinates: artistInfo.artistResidency?.location ?? [],
  //     })
  //   }, [artistInfo, reset, name])

  //   const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([])

  const onSubmit = async (data: EventData) => {
    console.log("data", data)
    try {
      console.log("organizer mode)")
      reset()
      toast.success("Successfully updated profile! Forwarding to Stripe...")

      setTimeout(() => {
        onClick()
      }, 2000)
    } catch (error) {
      console.error("Failed to submit form:", error)
      toast.error("Failed to submit form")
    }
  }

  return (
    <HorizontalLinearStepper
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      steps={4}
      className='px-2 xl:px-8'
      finalLabel='Submit'
      onFinalSubmit={handleSubmit(onSubmit)}
      isDirty={true}
      onSave={handleSubmit(onSubmit)}
      cancelButton={
        <DialogClose asChild>
          <Button
            type='button'
            variant='salWithShadowHiddenYlw'
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
          <div className='h-full gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>
            <section className='flex flex-col gap-2 justify-center'>
              <div className='flex flex-col gap-y-3 items-center justify-center'>
                <p className='font-tanker lowercase text-[2.5em]  lg:text-[4em] tracking-wide text-foreground'>
                  {hasPrevEvent ? "Welcome Back!" : "Welcome!"}
                </p>
                <p className='text-center text-balance'>
                  {hasPrevEvent
                    ? "To start, select from your existing events or create a new open call"
                    : "To start, create a new open call!"}
                </p>

                {hasPrevEvent && (
                  <Select onValueChange={() => {}} defaultValue={"1"}>
                    <SelectTrigger className='max-w-sm p-8 text-base text-center mt-6'>
                      <SelectValue placeholder='Select from your events ' />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value='1'>Event 1</SelectItem>
                      <SelectItem value='2'>Event 2</SelectItem>
                      <SelectItem value='3'>Event 3</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </section>
            <section>
              <Label>Event Name</Label>
              <input
                value={title}
                // {...register("eventName")}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Task title...'
                className='w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm placeholder-violet-300 focus:outline-none'
              />
              <p>
                Check here if the organizer (a) already exists,
                <br /> (b) has any current events (that they may want to add a
                new open call for) ,
                <br /> (c)has any current open calls (so they don&apos;t
                accidentally create a duplicate) and
                <br /> (d) to give a brief intro and ask the MOST basic event
                info if this is their first. If no existing events, use this as
                a starting point and a sort of welcome/intro page to posting an
                open call here.
              </p>
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
