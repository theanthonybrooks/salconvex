"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { sortedGroupedCountries } from "@/lib/locations";

import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi";
import { UpdateArtistSchema } from "@/schemas/artist";
import { User } from "@/types/user";
import { toast } from "react-toastify";
import { Country } from "world-countries";
import { api } from "~/convex/_generated/api";

interface ArtistProfileFormProps {
  user: User | undefined;
}

export const ArtistProfileForm = ({ user }: ArtistProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);

  const artistData = useQuery(api.artists.artistActions.getArtist, {});
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist,
  );
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const {
    register: artistRegister,
    control: control,
    handleSubmit: artistHandleSubmit,
    reset: reset,
    // formState: { errors: artistErrors },
    // setValue: updateSetValue,
    formState: { isDirty: artistUnsavedChanges, isValid: artistIsValid },
  } = useForm<z.infer<typeof UpdateArtistSchema>>({
    resolver: zodResolver(UpdateArtistSchema),
    defaultValues: {
      artistName: artistData?.artistName ?? "",
      artistNationality: artistData?.artistNationality ?? [],
      artistResidency: {
        full: artistData?.artistResidency?.full ?? "",
        city: artistData?.artistResidency?.city ?? "",
        state: artistData?.artistResidency?.state ?? "",
        stateAbbr: artistData?.artistResidency?.stateAbbr ?? "",
        country: artistData?.artistResidency?.country ?? "",
        countryAbbr: artistData?.artistResidency?.countryAbbr ?? "",
        location: artistData?.artistResidency?.location ?? [],
        timezone: artistData?.artistResidency?.timezone ?? "",
        timezoneOffset: artistData?.artistResidency?.timezoneOffset ?? 0,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!artistData) return;

    reset({
      artistName: artistData.artistName ?? user?.name ?? "",
      artistNationality: artistData.artistNationality ?? [],
      artistResidency: {
        full: artistData.artistResidency?.full ?? "",
        city: artistData.artistResidency?.city ?? "",
        state: artistData.artistResidency?.state ?? "",
        stateAbbr: artistData.artistResidency?.stateAbbr ?? "",
        country: artistData.artistResidency?.country ?? "",
        countryAbbr: artistData.artistResidency?.countryAbbr ?? "",
        location: artistData.artistResidency?.location ?? [],
        timezone: artistData.artistResidency?.timezone ?? "",
        timezoneOffset: artistData.artistResidency?.timezoneOffset ?? 0,
      },
    });
  }, [artistData, reset, user]);

  const handleUpdateArtistSubmit = async (
    data: z.infer<typeof UpdateArtistSchema>,
  ) => {
    let timezone: string | undefined;
    let timezoneOffset: number | undefined;
    const artistNationality = data?.artistNationality ?? [];
    if (artistNationality.length === 0 && data?.artistResidency?.country) {
      artistNationality.push(data.artistResidency.country);
    } else if (artistNationality.length === 0) {
      toast.error("Please select at least one nationality");
      return;
    }
    const artistLocation = data?.artistResidency?.location;
    if (artistLocation?.length === 2) {
      const timezoneData = await getTimezone({
        latitude: artistLocation[0],
        longitude: artistLocation[1],
      });
      timezone = timezoneData?.zoneName;
      timezoneOffset = timezoneData?.gmtOffset;
    }

    try {
      if (artistUnsavedChanges) {
        setIsSaving(true);
        await updateArtist({
          artistName: data.artistName,
          artistNationality: data.artistNationality,
          artistResidency: {
            full: data.artistResidency?.full,
            city: data.artistResidency?.city,
            state: data.artistResidency?.state,
            stateAbbr: data.artistResidency?.stateAbbr,
            country: data.artistResidency?.country ?? "",
            countryAbbr: data.artistResidency?.countryAbbr ?? "",
            location: data.artistResidency?.location ?? [],
            timezone: timezone ?? "",
            timezoneOffset,
          },
        });
      }

      reset();

      toast.success("Successfully updated artist info!");
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOnHoverSave = () => {
    if (hoverSave) return;
    setHoverSave(true);
  };
  const handleOnHoverSaveEnd = () => {
    setTimeout(() => setHoverSave(false), 250);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artist Profile</CardTitle>
        <CardDescription>Update your artist info</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        <form
          onSubmit={artistHandleSubmit(handleUpdateArtistSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="artistName">Artist Name </Label>
            <input
              tabIndex={1}
              id="artistName"
              {...artistRegister("artistName")}
              placeholder="(if different from your profile name)"
              className="w-full rounded border border-foreground/30 p-3 text-base placeholder-shown:bg-salYellow/50 focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <div className="relative mt-3 flex flex-col gap-3 rounded-md border border-dotted border-foreground/50 bg-salYellow/30 p-4 pt-8 text-foreground/75 lg:pt-4">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-foreground/50 bg-card px-3 py-1 text-sm">
              Eligibility Details:
            </span>

            <div className="flex flex-col gap-2">
              <Label>Nationality (max 3)*</Label>
              <Controller
                name="artistNationality"
                control={control}
                rules={{
                  required: "Nationality is required",
                  validate: (value) =>
                    (value && value?.length > 0) ||
                    "Please select at least one nationality",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <SearchMappedMultiSelect<Country>
                      values={field.value ?? []}
                      onChange={field.onChange}
                      data={sortedGroupedCountries}
                      selectLimit={3}
                      placeholder="Select up to 3 nationalities"
                      getItemLabel={(country) => country.name.common}
                      getItemValue={(country) => country.name.common}
                      searchFields={[
                        "name.common",
                        "name.official",
                        "cca3",
                        "altSpellings",
                      ]}
                      tabIndex={2}
                      className="h-12 bg-card text-base hover:bg-card"
                    />
                    {fieldState.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="artistResidency">
                Residence/Location (optional)
              </Label>
              <Controller
                name="artistResidency"
                control={control}
                render={({ field }) => (
                  <MapboxInputFull
                    id="artistResidency"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    reset={false}
                    tabIndex={2}
                    placeholder="Place of residence (city, state, country, etc).."
                    className="mb-3 w-full lg:mb-0"
                    inputClassName="rounded-lg border-foreground "
                    isArtist={true}
                  />
                )}
              />
            </div>
          </div>

          <Button
            disabled={isSaving || !artistUnsavedChanges || !artistIsValid}
            type="submit"
            variant={
              artistUnsavedChanges ? "salWithShadow" : "salWithoutShadow"
            }
            onMouseEnter={handleOnHoverSave}
            onMouseLeave={handleOnHoverSaveEnd}
            className="mt-4 w-full dark:text-primary-foreground sm:w-auto"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Saving...
              </span>
            ) : hoverSave ? (
              "Save Changes?"
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
        {/* <div className='space-y-2'>
                      <Label htmlFor='bio'>Bio</Label>
                      <Textarea id='bio' placeholder='Tell us about yourself' />
                    </div> */}
      </CardContent>
    </Card>
  );
};
