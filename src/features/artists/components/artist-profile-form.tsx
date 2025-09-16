"use client";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { sortedGroupedCountries } from "@/lib/locations";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LogoUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi";
import { autoHttps, formatHandleInput } from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { UpdateArtistSchema, UpdateArtistSchemaValues } from "@/schemas/artist";
import { User } from "@/types/user";
import { FunctionReturnType } from "convex/server";
import { toast } from "react-toastify";
import { Country } from "world-countries";
import { api } from "~/convex/_generated/api";

interface ArtistProfileFormProps {
  user: User | undefined;
  subData: FunctionReturnType<
    typeof api.subscriptions.getUserSubscriptionStatus
  >;
  type: "initial" | "dashboard";
}

export const ArtistProfileForm = ({ user, type }: ArtistProfileFormProps) => {
  const [pending, setPending] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);

  const artistData = useQuery(api.artists.artistActions.getArtist, {});
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist,
  );
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const form = useForm<UpdateArtistSchemaValues>({
    resolver: zodResolver(UpdateArtistSchema),
    defaultValues: {
      artistName: artistData?.artistName ?? user?.name ?? "",
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
      artistContact: {
        website: artistData?.contact?.website,
        instagram: artistData?.contact?.instagram,
        facebook: artistData?.contact?.facebook,
        threads: artistData?.contact?.threads,
        vk: artistData?.contact?.vk,
        phone: artistData?.contact?.phone,
        youTube: artistData?.contact?.youTube,
        linkedIn: artistData?.contact?.linkedIn,
      },
      canFeature: artistData?.canFeature ?? false,
    },
    mode: "onChange",
  });

  const {
    control: control,
    handleSubmit: artistHandleSubmit,
    reset: reset,

    // setValue: updateSetValue,
    formState: { isDirty: artistUnsavedChanges, isValid: artistIsValid },
  } = form;

  useEffect(() => {
    if (!artistData) return;

    reset({
      logo: user?.image,
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
      artistContact: {
        website: artistData.contact?.website,
        instagram: artistData.contact?.instagram,
        facebook: artistData.contact?.facebook,
        threads: artistData.contact?.threads,
        vk: artistData.contact?.vk,
        phone: artistData.contact?.phone,
        youTube: artistData.contact?.youTube,
        linkedIn: artistData.contact?.linkedIn,
      },
      canFeature: artistData.canFeature ?? false,
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
        setPending(true);
        await updateArtist({
          artistName: data.artistName,
          artistNationality: data.artistNationality,
          artistResidency: {
            full: data.artistResidency?.full,
            locale: data.artistResidency?.locale,
            region: data.artistResidency?.region,
            city: data.artistResidency?.city,
            state: data.artistResidency?.state,
            stateAbbr: data.artistResidency?.stateAbbr,
            country: data.artistResidency?.country ?? "",
            countryAbbr: data.artistResidency?.countryAbbr ?? "",
            continent: data.artistResidency?.continent ?? "",
            location: data.artistResidency?.location ?? [],
            timezone: timezone ?? "",
            timezoneOffset,
          },
          contact: {
            website: data.artistContact?.website,
            instagram: data.artistContact?.instagram,
            facebook: data.artistContact?.facebook,
            threads: data.artistContact?.threads,
            vk: data.artistContact?.vk,
            phone: data.artistContact?.phone,
            youTube: data.artistContact?.youTube,
          },
          canFeature: data.canFeature,
        });
      }

      reset();

      toast.success("Successfully updated artist info!");
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    } finally {
      setPending(false);
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
    <Form {...form}>
      <form
        onSubmit={artistHandleSubmit(handleUpdateArtistSubmit)}
        className="flex flex-col gap-4"
      >
        <div className={cn("flex w-full items-end gap-4")}>
          <FormField
            control={form.control}
            name="artistName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">
                  Artist Name<sup>*</sup>{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    tabIndex={1}
                    id="artistName"
                    {...field}
                    placeholder="(if different from your profile name)"
                    className="w-full rounded border border-foreground/30 p-3 text-base focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {type === "initial" && (
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only font-bold">
                    Artist Logo
                  </FormLabel>
                  <FormControl>
                    <LogoUploader
                      id="logo"
                      onChangeAction={(file) => field.onChange(file)}
                      onRemoveAction={() => field.onChange(undefined)}
                      initialImage={user?.image}
                      imageOnly
                      className="gap-0 pr-8"
                      // initialImage={field.value ? URL.createObjectURL(field.value) : undefined}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>
        <FormField
          control={form.control}
          name="artistContact.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Instagram </FormLabel>
              <FormControl>
                <DebouncedControllerInput
                  tabIndex={1}
                  id="artistContact.instagram"
                  field={field}
                  placeholder="@username"
                  transform={(val) => formatHandleInput(val, "instagram")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="artistContact.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Website </FormLabel>
              <FormControl>
                <DebouncedControllerInput
                  tabIndex={2}
                  id="artistContact.website"
                  field={field}
                  placeholder="yoursite.com"
                  transform={autoHttps}
                  // onBlur={() => {
                  //   field.onBlur?.();

                  //   // console.log("Blur me", field + type)
                  // }}
                />
                {/* <Input
                      tabIndex={1}
                      id="artistContact.website"
                      {...field}
                      placeholder="yoursite.com"
                      className="w-full rounded border border-foreground/30 p-3 text-base focus:outline-none focus:ring-1 focus:ring-foreground"
                    /> */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="canFeature"
          render={({ field }) => (
            <FormItem className="my-4 flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  id="canFeature"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  className="text-base"
                />
              </FormControl>
              <FormLabel className="font-bold">
                Would you like to be considered for our artist feature?
                <sup>*</sup>
              </FormLabel>
            </FormItem>
          )}
        />

        {/* <div className="flex flex-col gap-2">
             <Label htmlFor="artistName">Artist Name </Label>
             </div> */}
        <div className="relative mt-3 flex flex-col gap-3 rounded-md border border-dotted border-foreground/50 bg-salYellow/30 p-4 pt-8 text-foreground/75 lg:pt-4">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-foreground/50 bg-card px-3 py-1 text-sm">
            <p className="hidden sm:block"> Eligibility Details:</p>
            <p className="sm:hidden"> Eligibility:</p>
          </span>

          <div className="flex flex-col gap-2">
            <Label>
              Nationality (max 3)<sup>*</sup>
            </Label>
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
          disabled={pending || !artistUnsavedChanges || !artistIsValid}
          type="submit"
          variant={
            artistUnsavedChanges && artistIsValid
              ? "salWithShadow"
              : "salWithoutShadow"
          }
          onMouseEnter={handleOnHoverSave}
          onMouseLeave={handleOnHoverSaveEnd}
          className="mt-4 w-full dark:text-primary-foreground sm:w-auto"
        >
          {pending ? (
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
    </Form>
  );
};
