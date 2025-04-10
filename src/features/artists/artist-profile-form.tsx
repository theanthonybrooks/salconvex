import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInput } from "@/components/ui/mapbox-search";
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi";
import { sortedGroupedCountries } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { useAction, useMutation, useQuery } from "convex/react";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Country } from "world-countries";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ArtistProfileFormProps {
  className?: string;

  user: User | undefined;
  onClick: () => void;
  children?: React.ReactNode;
}

type ArtistFormValues = {
  artistName: string;
  logo: Blob | undefined;
  residence: string;
  nationalities: string[]; // cca2 codes for now

  locationCity?: string;
  locationState?: string;
  locationStateAbbr?: string;
  locationCountry?: string;
  locationCountryAbbr?: string;
  locationCoordinates?: number[];
};

export const ArtistProfileForm = ({
  className,
  onClick,
  user,
}: ArtistProfileFormProps) => {
  const userFullName = user ? user?.firstName + " " + user?.lastName : "";
  const userName = user?.name ? user.name : userFullName;

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
      artistName: userName,
      nationalities: [],
      residence: "",
      logo: undefined,
    },
    mode: "onChange",
  });
  // NOTE: Generate the upload url to use Convex's storage
  const generateUploadUrl = useMutation(api.uploads.user.generateUploadUrl);
  const artistInfo = useQuery(api.artists.artistActions.getArtist, {});
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist,
  );

  useEffect(() => {
    if (!artistInfo) return;

    reset({
      artistName: artistInfo.artistName ?? userName,
      logo: user?.image ?? undefined,
      nationalities: artistInfo.artistNationality ?? [],
      residence: artistInfo.artistResidency?.full ?? "",
      locationCity: artistInfo.artistResidency?.city ?? "",
      locationState: artistInfo.artistResidency?.state ?? "",
      locationStateAbbr: artistInfo.artistResidency?.stateAbbr ?? "",
      locationCountry: artistInfo.artistResidency?.country ?? "",
      locationCountryAbbr: artistInfo.artistResidency?.countryAbbr ?? "",
      locationCoordinates: artistInfo.artistResidency?.location ?? [],
    });
  }, [artistInfo, reset, userName, user]);

  const onSubmit = async (data: ArtistFormValues) => {
    let timezone: string | undefined;
    let timezoneOffset: number | undefined;
    let artistLogoStorageId: Id<"_storage"> | undefined;
    if (data.locationCoordinates?.length === 2) {
      const timezoneData = await getTimezone({
        latitude: data.locationCoordinates[1],
        longitude: data.locationCoordinates[0],
      });
      timezone = timezoneData?.zoneName;
      timezoneOffset = timezoneData?.gmtOffset;
      //could also get dst, abbreviation (CEST, CET, etc)
    }
    //NOTE: Upload the image to Convex's storage and get the
    if (data.logo) {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": data.logo.type },
        body: data.logo,
      });
      if (!uploadRes.ok) {
        toast.error("Failed to upload logo", {
          autoClose: 2000,
          pauseOnHover: false,
          hideProgressBar: true,
        });
        return;
      }
      const { storageId } = await uploadRes.json();
      artistLogoStorageId = storageId;
    }

    try {
      await updateArtist({
        artistName: data.artistName,
        artistLogoStorageId,
        artistNationality: data.nationalities,
        artistResidency: {
          full: data.residence,
          city: data.locationCity,
          state: data.locationState,
          stateAbbr: data.locationStateAbbr,
          country: data.locationCountry ?? "",
          countryAbbr: data.locationCountryAbbr ?? "",
          location: data.locationCoordinates ?? [],
          timezone: timezone ?? "",
          timezoneOffset,
        },
      });

      reset();

      toast.success("Successfully updated profile! Forwarding to Stripe...");
      setTimeout(() => {
        onClick();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex items-center gap-4">
        <div className="mt-4 flex flex-grow flex-col gap-2 lg:px-4">
          <Label htmlFor="artistName">Artist Name </Label>
          <input
            tabIndex={1}
            id="artistName"
            {...register("artistName")}
            placeholder="(if different from your profile name)"
            className="w-full rounded border border-foreground/30 p-3 text-base placeholder-shown:bg-salYellow/50 focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <AvatarUploader
              onChange={(file) => field.onChange(file)}
              onRemove={() => field.onChange(undefined)}
              initialImage={user?.image}
              required
              imageOnly
              className="gap-0 pr-8"
              // initialImage={field.value ? URL.createObjectURL(field.value) : undefined}
            />
          )}
        />
      </div>
      <div className="relative mt-3 flex flex-col gap-3 rounded-md border border-dotted border-foreground/50 bg-salYellow/30 p-4 pt-8 text-foreground/75 lg:pt-4">
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-foreground/50 bg-card px-3 py-1 text-sm">
          Eligibility Details:
        </span>

        <div className="flex flex-col gap-2">
          <Label>Nationality (max 3)</Label>
          <Controller
            name="nationalities"
            control={control}
            render={({ field }) => (
              <SearchMappedMultiSelect<Country>
                values={field.value}
                onChange={field.onChange}
                data={sortedGroupedCountries}
                selectLimit={3}
                placeholder="Select up to 3 nationalities"
                getItemLabel={(country) => country.name.common}
                getItemValue={(country) => country.cca2}
                searchFields={[
                  "name.common",
                  "name.official",
                  "cca3",
                  "altSpellings",
                ]}
                tabIndex={2}
                className="h-12 bg-card text-base hover:bg-card"
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="residence">Residence/Location (optional)</Label>
          <Controller
            name="residence"
            control={control}
            render={({ field }) => (
              <MapboxInput
                value={field.value}
                onChange={field.onChange}
                onSelect={(location) => {
                  setValue("residence", location.full);
                  setValue("locationCity", location.city);
                  setValue("locationState", location.state);
                  setValue("locationStateAbbr", location.stateAbbr);
                  setValue("locationCountry", location.country);
                  setValue("locationCountryAbbr", location.countryAbbr);
                  setValue("locationCoordinates", location.coordinates);
                }}
                tabIndex={3}
                placeholder="Place of residence (city, state, country, etc)..."
              />
            )}
          />
        </div>
      </div>

      <DialogFooter className="mt-4 flex justify-end gap-4 lg:gap-2">
        <DialogClose asChild>
          <Button type="button" size="lg" variant="salWithShadowHiddenYlw">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="submit"
            size="lg"
            variant="salWithShadowHidden"
            disabled={!isValid}
          >
            Save Changes
          </Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
};
