import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { MapboxInput } from "@/components/ui/mapbox-search"
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi"
import { sortedGroupedCountries } from "@/lib/locations"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { useAction, useMutation, useQuery } from "convex/react"
import React, { useEffect } from "react"
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
  nationalities: string[] // cca2 codes for now

  locationCity?: string
  locationState?: string
  locationStateAbbr?: string
  locationCountry?: string
  locationCountryAbbr?: string
  locationCoordinates?: number[]
}

export const ArtistProfileForm = ({
  className,

  user,
}: // onClick,
ArtistProfileFormProps) => {
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
  const getTimezone = useAction(api.actions.getTimezone.getTimezone)
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist
  )

  useEffect(() => {
    if (!artistInfo) return

    reset({
      artistName: artistInfo.artistName ?? "",
      nationalities: artistInfo.artistNationality ?? [],
      residence: artistInfo.artistResidency?.full ?? "",
      locationCity: artistInfo.artistResidency?.city ?? "",
      locationState: artistInfo.artistResidency?.state ?? "",
      locationStateAbbr: artistInfo.artistResidency?.stateAbbr ?? "",
      locationCountry: artistInfo.artistResidency?.country ?? "",
      locationCountryAbbr: artistInfo.artistResidency?.countryAbbr ?? "",
      locationCoordinates: artistInfo.artistResidency?.location ?? [],
    })
  }, [artistInfo, reset])

  const onSubmit = async (data: ArtistFormValues) => {
    let timezone: string | undefined
    let timezoneOffset: number | undefined
    if (data.locationCoordinates?.length === 2) {
      const timezoneData = await getTimezone({
        latitude: data.locationCoordinates[1],
        longitude: data.locationCoordinates[0],
      })
      timezone = timezoneData?.zoneName
      timezoneOffset = timezoneData?.gmtOffset
      //could also get dst, abbreviation (CEST, CET, etc)
    }

    try {
      await updateArtist({
        artistName: data.artistName,
        artistNationality: data.nationalities,
        artistResidency: {
          full: data.residence,
          city: data.locationCity,
          state: data.locationState,
          stateAbbr: data.locationStateAbbr,
          country: data.locationCountry,
          countryAbbr: data.locationCountryAbbr,
          location: data.locationCoordinates,
          timezone,
          timezoneOffset,
        },
      })

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}>
      <div className='flex flex-col gap-2  lg:px-4 mt-4 '>
        <Label htmlFor='artistName'>Artist Name </Label>
        <input
          tabIndex={1}
          id='artistName'
          {...register("artistName")}
          placeholder='(if different from your profile name)'
          className='w-full rounded border border-foreground/30 focus:ring-1 focus:ring-foreground p-3 text-base  focus:outline-none placeholder-shown:bg-salYellow/50 '
        />
      </div>
      <div className='border border-dotted border-foreground/50 mt-3 text-foreground/75 bg-salYellow/30 rounded-md p-4 pt-8 lg:pt-4 flex flex-col gap-3 relative'>
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
                className='bg-card hover:bg-card text-base h-12'
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
              <MapboxInput
                value={field.value}
                onChange={field.onChange}
                onSelect={(location) => {
                  setValue("residence", location.full)
                  setValue("locationCity", location.city)
                  setValue("locationState", location.state)
                  setValue("locationStateAbbr", location.stateAbbr)
                  setValue("locationCountry", location.country)
                  setValue("locationCountryAbbr", location.countryAbbr)
                  setValue("locationCoordinates", location.coordinates)
                }}
                tabIndex={3}
                placeholder='Place of residence (city, state, country, etc)...'
              />
            )}
          />
        </div>
      </div>

      <DialogFooter className='flex justify-end gap-4 mt-4  lg:gap-2'>
        <DialogClose asChild>
          <Button type='button' size='lg' variant='salWithShadowHiddenYlw'>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type='submit'
            size='lg'
            variant='salWithShadowHidden'
            disabled={!isValid}>
            Save Changes
          </Button>
        </DialogClose>
      </DialogFooter>
    </form>
  )
}
