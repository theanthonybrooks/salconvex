import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi"
import {
  fetchMapboxSuggestions,
  MapboxSuggestion,
  sortedGroupedCountries,
} from "@/lib/locations"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { useMutation, useQuery } from "convex/react"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Country } from "world-countries"
import { api } from "~/convex/_generated/api"

interface ArtistProfileFormProps {
  className?: string

  user: User | undefined
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

export const ArtistProfileForm = ({
  className,

  user,
  onClick,
}: ArtistProfileFormProps) => {
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

  const artistInfo = useQuery(api.artists.artistActions.getArtist, {})
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist
  )

  const [name, setName] = useState("")

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}>
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
                className='bg-card hover:bg-card'
              />
            )}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='residence'>Residence/Location (optional)</Label>
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
                            context.find((c) => c.id.startsWith(type))?.text ||
                            ""

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
            Save Changes
          </Button>
        </DialogClose>
      </DialogFooter>
    </form>
  )
}
