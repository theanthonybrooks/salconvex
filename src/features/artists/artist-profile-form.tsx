import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi";
import { useManageSubscription } from "@/hooks/use-manage-subscription";
import { sortedGroupedCountries } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { ArtistResidency } from "@/types/artist";
import { User } from "@/types/user";
import { useAction, useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { formatDate, isBefore } from "date-fns";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoMdArrowRoundForward } from "react-icons/io";
import { toast } from "react-toastify";
import { Country } from "world-countries";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ArtistProfileFormProps {
  className?: string;

  user: User | undefined;
  subData: FunctionReturnType<
    typeof api.subscriptions.getUserSubscriptionStatus
  >;
  onClick: () => void;
  children?: React.ReactNode;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

type ArtistResValues = Omit<ArtistResidency, "full"> & {
  full: string;
};

type ArtistFormValues = {
  artistName: string;
  logo: Blob | string | undefined;
  artistResidency: ArtistResValues;
  artistNationality: string[]; // cca2 codes for now
};

export const ArtistProfileForm = ({
  className,
  onClick,
  user,
  subData,
  hasUnsavedChanges,
  setHasUnsavedChanges,
}: ArtistProfileFormProps) => {
  const userFullName = user ? user?.firstName + " " + user?.lastName : "";
  const userName = user?.name ? user.name : userFullName;
  const subscription = subData?.subscription;
  const subStatus = subData?.subStatus;
  const hadTrial = subData?.hadTrial;
  const activeSub = subStatus === "active";
  const trialingSub = subStatus === "trialing";
  const trialEndsAt = subData?.trialEndsAt;
  const trialEnded = trialEndsAt && isBefore(new Date(trialEndsAt), new Date());
  const hasCurrentSub = activeSub || trialingSub;

  console.log(activeSub);
  console.log(hadTrial);
  console.log(trialEnded, trialingSub);
  // const activeTrial = trialingSub && !trialEnded;
  const subAmount = subData?.subAmount
    ? (subData.subAmount / 100).toFixed(0)
    : 0;
  const subInterval = subData?.subInterval !== "none" && subData?.subInterval;

  const {
    register,
    control,
    // setValue,
    // watch,
    // getValues,
    handleSubmit: handleSubmit,
    formState: {
      isDirty,
      // errors,
      isValid,
    },
    reset,
  } = useForm<ArtistFormValues>({
    defaultValues: {
      artistName: userName,
      artistNationality: [],
      artistResidency: {
        full: "",
        city: "",
        state: "",
        stateAbbr: "",
        country: "",
        countryAbbr: "",
        location: [],
        timezone: "",
        timezoneOffset: 0,
      },

      logo: undefined,
    },
    mode: "onChange",
  });

  // const newUser = isValid && !hasCurrentSub;
  // const existingUser = isValid && hasCurrentSub;
  // const currentValues = getValues();
  // const userNationality = currentValues.artistNationality;
  // NOTE: Generate the upload url to use Convex's storage
  const handleManageSubscription = useManageSubscription(subscription ?? {});
  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);
  const artistInfo = useQuery(api.artists.artistActions.getArtist, {});
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const updateArtist = useMutation(
    api.artists.artistActions.updateOrCreateArtist,
  );

  useEffect(() => {
    if (hasUnsavedChanges) return;
    if (!hasUnsavedChanges && isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [hasUnsavedChanges, isDirty, setHasUnsavedChanges]);

  useEffect(() => {
    if (!artistInfo) return;

    reset({
      artistName: artistInfo.artistName ?? userName,
      logo: user?.image ?? undefined,
      artistNationality: artistInfo.artistNationality ?? [],
      artistResidency: {
        full: artistInfo.artistResidency?.full ?? "",
        city: artistInfo.artistResidency?.city ?? "",
        state: artistInfo.artistResidency?.state ?? "",
        stateAbbr: artistInfo.artistResidency?.stateAbbr ?? "",
        country: artistInfo.artistResidency?.country ?? "",
        countryAbbr: artistInfo.artistResidency?.countryAbbr ?? "",
        location: artistInfo.artistResidency?.location ?? [],
        timezone: artistInfo.artistResidency?.timezone ?? "",
        timezoneOffset: artistInfo.artistResidency?.timezoneOffset ?? 0,
      },
    });
  }, [artistInfo, reset, userName, user]);

  const onSubmit = async (data: ArtistFormValues) => {
    let timezone: string | undefined;
    let timezoneOffset: number | undefined;
    let artistLogoStorageId: Id<"_storage"> | undefined;
    const artistNationality = data?.artistNationality ?? [];
    if (artistNationality.length === 0 && data?.artistResidency?.country) {
      artistNationality.push(data.artistResidency.country);
    } else if (artistNationality.length === 0) {
      toast.error("Please select at least one nationality");
      return;
    }
    // if (artistNationality.length === 0) {
    //   toast.error("Please select at least one nationality");
    //   return;
    // }
    const artistLocation = data?.artistResidency?.location;
    if (artistLocation?.length === 2) {
      const timezoneData = await getTimezone({
        latitude: artistLocation[0],
        longitude: artistLocation[1],
      });
      timezone = timezoneData?.zoneName;
      timezoneOffset = timezoneData?.gmtOffset;
      //could also get dst, abbreviation (CEST, CET, etc)
    }
    // console.log(data?.logo);
    //NOTE: Upload the image to Convex's storage and get the url in the convex mutation.
    if (data.logo && typeof data.logo !== "string" && isDirty) {
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
      if (isDirty) {
        await updateArtist({
          artistName: data.artistName,
          artistLogoStorageId,
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
            location: data.artistResidency?.location ?? [],
            timezone: timezone ?? "",
            timezoneOffset,
            // ...data.artistResidency,
          },
        });
      }

      reset();

      toast.success("Successfully updated profile! Forwarding to Stripe...");
      setTimeout(() => {
        if (!hasCurrentSub) {
          onClick();
        } else {
          handleManageSubscription();
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    }
  };

  // console.log(watch("residence"));
  // console.log(watch("location"));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex items-end gap-4">
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
              id="logo"
              onChange={(file) => field.onChange(file)}
              onRemove={() => field.onChange(undefined)}
              initialImage={user?.image}
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
          <Label>Nationality (max 3)*</Label>
          <Controller
            name="artistNationality"
            control={control}
            rules={{
              required: "Nationality is required",
              validate: (value) =>
                value.length > 0 || "Please select at least one nationality",
            }}
            render={({ field, fieldState }) => (
              <>
                <SearchMappedMultiSelect<Country>
                  values={field.value}
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
          <Label htmlFor="artistResidency">Residence/Location (optional)</Label>
          <Controller
            name="artistResidency"
            control={control}
            render={({ field }) => (
              <MapboxInputFull
                id="artistResidency"
                value={field.value}
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
      <div className="mt-4 flex items-center justify-between">
        {activeSub ? (
          <span className="flex-col gap-1 text-foreground/70">
            <p className="text-sm">Your Plan:</p>{" "}
            <p>
              ${subAmount}/{subInterval}
            </p>
          </span>
        ) : trialingSub ? (
          <span className="flex-col gap-1 text-foreground/70">
            <p className="text-sm">
              {trialEnded ? "Trial Ended:" : "Trial Ends:"}
            </p>
            <p className={cn("text-sm", trialEnded && "italic text-red-600")}>
              {trialEndsAt ? formatDate(new Date(trialEndsAt), "PPP") : "N/A"}
            </p>
          </span>
        ) : (
          <div />
        )}

        <DialogFooter className="flex justify-end gap-4 lg:gap-2">
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
              {!hadTrial ? (
                "Start Trial"
              ) : !activeSub && (!trialingSub || trialEnded) ? (
                <span className="flex items-center gap-x-1">
                  Continue to Stripe
                  <IoMdArrowRoundForward className="size-4" />
                </span>
              ) : !hasUnsavedChanges && activeSub ? (
                "View Membership"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogClose>
        </DialogFooter>
      </div>
    </form>
  );
};
