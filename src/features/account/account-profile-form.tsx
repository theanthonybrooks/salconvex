import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi"
import HorizontalLinearStepper from "@/components/ui/stepper"
import {
  fetchMapboxSuggestions,
  MapboxSuggestion,
  sortedGroupedCountries,
} from "@/lib/locations"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Country } from "world-countries"
import { api } from "~/convex/_generated/api"

// type BaseTaskValues = {
//   title: string

//   priority: "low" | "medium" | "high"
// }

export type ModeType = "artist" | "organizer"

interface AccountSubscribeFormProps {
  className?: string
  mode: ModeType
  user: User | undefined

  //   initialValues?: BaseTaskValues

  onClick: () => void
  children?: React.ReactNode
}

type ArtistFormValues = {
  artistName: string
  residence: string
  nationalities: string[] // cca2 codes
  priority: "low" | "medium" | "high"
  order?: "start" | "end"
  locationCity?: string
  locationState?: string
  locationCountry?: string
  locationCoordinates?: string[]
}

// type EventFormValues = {
//   eventName: string
//   eventDescription: string
//   eventDate: string
//   //etc etc
// }

export const AccountSubscribeForm: React.FC<AccountSubscribeFormProps> = ({
  className,
  mode,
  user,
  //   initialValues,
  children,
  onClick,
}) => {
  const {
    register,
    control,
    setValue,
    handleSubmit: handleSubmit,
    formState: {
      // isDirty,
      // errors,
      isValid,
    },
    reset,
  } = useForm<ArtistFormValues>({
    defaultValues: {
      artistName: user?.name ?? `${user?.firstName} ${user?.lastName}`,
      nationalities: [],
      residence: "",
    },
    mode: "onChange",
  })

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault()
  //     if (!title.trim()) return

  //     if (mode === "add") {
  //       onSubmit({ title: title.trim(), column, priority, order })
  //     } else {
  //       onSubmit({ title: title.trim(), column, priority })
  //     }
  //     setTitle("")
  //     setColumn(initialValues?.column || "todo")
  //     setPriority(initialValues?.priority || "medium")
  //     setOrder(
  //       mode === "add" && initialValues?.order ? initialValues.order : "end"
  //     )
  //   }
  const artistInfo = useQuery(api.artists.artistActions.getArtist, {})
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist
  )

  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [skipped, setSkipped] = useState(new Set<number>())

  const [title, setTitle] = useState("")
  const [name, setName] = useState("")
  const [hasPrevEvent] = useState(false)

  useEffect(() => {
    setName(user?.name ?? `${user?.firstName} ${user?.lastName}`)
  }, [user])

  useEffect(() => {
    if (!artistInfo) return

    reset({
      artistName: artistInfo.artistName ?? name,
      nationalities: artistInfo.artistNationality ?? [],
      residence: artistInfo.artistResidency?.full ?? "",
      locationCity: artistInfo.artistResidency?.city ?? "",
      locationState: artistInfo.artistResidency?.state ?? "",
      locationCountry: artistInfo.artistResidency?.country ?? "",
      locationCoordinates: artistInfo.artistResidency?.location ?? [],
    })
  }, [artistInfo, reset, name])

  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([])

  const onSubmit = async (data: ArtistFormValues) => {
    console.log("data", data)
    try {
      if (mode === "artist") {
        await updateArtist({
          artistName: data.artistName,
          artistNationality: data.nationalities,
          artistResidency: {
            full: data.residence,
            city: data.locationCity,
            state: data.locationState,
            country: data.locationCountry,
            location: data.locationCoordinates,
          },
        })
        console.log("artist mode)")
      } else if (mode === "organizer") {
        console.log("organizer mode)")
      }
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

  const onCancel = () => {
    setActiveStep(0)
    reset()
  }

  const isArtist = mode === "artist"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DialogHeader
          className='w-full'
          onClick={(e) => {
            if (!user) {
              e.preventDefault()
              e.stopPropagation()
              router.push("/auth/register?src=newUser")
            }
            // If user exists, do nothing and allow modal to open
          }}>
          {children}
        </DialogHeader>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "bg-card max-w-full max-h-full w-full h-full md:h-auto md:max-w-lg ",
          className,
          !isArtist && "xl:max-w-[95vw]  xl:max-h-[90vh] xl:h-full"
        )}>
        <div>
          <DialogTitle>
            {isArtist ? "Create Artist Profile" : "Add New Call"}
          </DialogTitle>
          <DialogDescription>
            {isArtist
              ? "Add information needed to apply for open calls"
              : "Add open call for your project or event"}
          </DialogDescription>
        </div>
        {isArtist ? (
          <>
            {/* NOTE: Artist Profile Creation */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-6'>
              <div className='flex flex-col gap-2 px-4 mt-4 '>
                <Label htmlFor='artistName'>Artist Name </Label>
                <input
                  tabIndex={1}
                  id='artistName'
                  {...register("artistName")}
                  placeholder='(if different from your profile name)'
                  className='w-full rounded border border-foreground/30 focus:ring-1 focus:ring-foreground p-3 text-sm  focus:outline-none placeholder-shown:bg-salYellow/50 '
                />
              </div>
              <div className='border border-dotted border-foreground/50 mt-3 text-foreground/75 bg-salYellow/30 rounded-md p-4  flex flex-col gap-3 relative'>
                <span className='absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-foreground/50 bg-card text-sm px-3 py-1'>
                  Eligibility Details:
                </span>

                <div className='flex flex-col gap-2'>
                  <Label>Nationality (max 3)</Label>
                  <Controller
                    name='nationalities'
                    control={control}
                    render={({ field }) => (
                      <SearchMappedMultiSelect<Country>
                        values={field.value}
                        onChange={field.onChange}
                        data={sortedGroupedCountries}
                        selectLimit={3}
                        placeholder='Select up to 3 nationalities'
                        getItemLabel={(country) => country.name.common}
                        getItemValue={(country) => country.cca2}
                        searchFields={[
                          "name.common",
                          "name.official",
                          "cca3",
                          "altSpellings",
                        ]}
                        tabIndex={2}
                        className='bg-card'
                      />
                    )}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='residence'>
                    Residence/Location (optional)
                  </Label>
                  <Controller
                    name='residence'
                    control={control}
                    render={({ field }) => (
                      <div className='relative'>
                        <input
                          {...field}
                          tabIndex={3}
                          onChange={async (e) => {
                            const query = e.target.value
                            field.onChange(query)
                            if (!query.trim()) return setSuggestions([])
                            const results = await fetchMapboxSuggestions(query)
                            setSuggestions(results)
                          }}
                          placeholder='Place of residence (city, state, country, etc)...'
                          className='w-full rounded border border-foreground/30 focus:ring-1 focus:ring-foreground p-3 text-sm placeholder-foreground/50 focus:outline-none placeholder-shown:bg-card '
                        />
                        {suggestions.length > 0 && (
                          <ul className='absolute z-50 mt-1 w-full rounded-md bg-white shadow'>
                            {suggestions.map((s) => (
                              <li
                                key={s.id}
                                className='cursor-pointer p-2 text-sm hover:bg-violet-100'
                                onClick={() => {
                                  const context = s.context || []
                                  const get = (type: string) =>
                                    context.find((c) => c.id.startsWith(type))
                                      ?.text || ""

                                  setValue("residence", s.place_name)
                                  setValue("locationCity", s.text)
                                  setValue("locationState", get("region"))
                                  setValue("locationCountry", get("country"))
                                  setValue(
                                    "locationCoordinates",
                                    s.center.map((c: number) => c.toString())
                                  )
                                  setSuggestions([])
                                }}>
                                {s.place_name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className='flex justify-end gap-2'>
                <DialogClose asChild>
                  <Button type='button' variant='salWithShadowHiddenYlw'>
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    type='submit'
                    variant='salWithShadowHidden'
                    disabled={!isValid}>
                    {isArtist ? "Save Changes" : "Add Task"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            {/*NOTE: Open Call Profile Creation */}
            <HorizontalLinearStepper
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              skipped={skipped}
              setSkipped={setSkipped}
              steps={4}
              className='px-2 xl:px-8'
              finalLabel='Submit'
              onFinalSubmit={handleSubmit(onSubmit)}
              isDirty={true}
              onSave={() => {}}
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
                className='flex flex-col  p-4  min-h-96 h-full
'>
                {activeStep === 0 && (
                  <div className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>
                    <section className='flex flex-col gap-2'>
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
                        Check here if the organizer (a) already exists, (b) has
                        any current events (that they may want to add a new open
                        call for) , (c) has any current open calls (so they
                        don&apos;t accidentally create a duplicate) and (d) to
                        give a brief intro and ask the MOST basic event info if
                        this is their first. If no existing events, use this as
                        a starting point and a sort of welcome/intro page to
                        posting an open call here.
                      </p>
                    </section>
                  </div>
                )}
                {activeStep === 1 && (
                  <p className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>
                    Second Step
                  </p>
                )}
                {activeStep === 2 && (
                  <p className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>
                    Third Step{" "}
                  </p>
                )}
                {activeStep === 3 && (
                  <p className='gap-4 xl:grid xl:grid-cols-2 xl:gap-6'>
                    Final Step
                  </p>
                )}
              </form>
            </HorizontalLinearStepper>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
