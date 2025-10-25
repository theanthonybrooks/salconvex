import { User } from "@/types/user";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateArtistSchema, UpdateArtistSchemaValues } from "@/schemas/artist";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, isBefore } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Country } from "world-countries";

import { IoMdArrowRoundForward } from "react-icons/io";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { SearchMappedMultiSelect } from "@/components/ui/mapped-select-multi";
import { Separator } from "@/components/ui/separator";
import { autoHttps, formatHandleInput } from "@/helpers/linkFns";
import { sortedGroupedCountries } from "@/helpers/locationFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";

interface ArtistProfileFormProps {
  className?: string;

  user: User | undefined;
  subData: FunctionReturnType<
    typeof api.subscriptions.getUserSubscriptionStatus
  >;
  onClick: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

export const ArtistProfileForm = ({
  className,
  onClick,
  user,
  subData,
  hasUnsavedChanges,
  setHasUnsavedChanges,
}: ArtistProfileFormProps) => {
  const artistData = useQuery(api.artists.artistActions.getArtist, {});
  const [pending, setPending] = useState(false);

  const userFullName = user ? user?.firstName + " " + user?.lastName : "";
  const userName = user?.name ? user.name : userFullName;
  const subStatus = subData?.subStatus;
  const hadTrial = subData?.hadTrial;
  const activeSub = subStatus === "active";
  const trialingSub = subStatus === "trialing";
  const trialEndsAt = subData?.trialEndsAt;
  const trialEnded = trialEndsAt && isBefore(new Date(trialEndsAt), new Date());
  const hasCurrentSub = activeSub || trialingSub;
  const subAmount = subData?.subAmount
    ? (subData.subAmount / 100).toFixed(0)
    : 0;
  const subInterval = subData?.subInterval !== "none" && subData?.subInterval;

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
  } = form;

  // const newUser = isValid && !hasCurrentSub;
  // const existingUser = isValid && hasCurrentSub;
  // const currentValues = getValues();
  // const userNationality = currentValues.artistNationality;
  // NOTE: Generate the upload url to use Convex's storage
  const router = useRouter();
  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);

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
  }, [artistData, reset, userName, user]);

  const onSubmit = async (data: UpdateArtistSchemaValues) => {
    setPending(true);
    // toast.info("Opening checkout in new tab...");

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
    if (artistLocation?.length === 2 && isDirty) {
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
        if (hasCurrentSub) {
          toast.success("Successfully updated profile!");
        } else {
          toast.success("Successfully created profile!");
        }
      }
      if (!hasCurrentSub) {
        toast.info("Opening Stripe in new tab...");
      }

      reset();

      setTimeout(() => {
        if (!hasCurrentSub) {
          onClick();
          console.log("onClick");
        } else {
          // console.log("handleManageSubscription");
          // handleManageSubscription();
          router.push("/dashboard/billing");
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    } finally {
      setPending(false);
      setTimeout(() => toast.dismiss(), 2000);
    }
  };

  // console.log(watch("residence"));
  // console.log(watch("location"));

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "grid-cols-[1fr_auto_1fr] grid-rows-[1fr_auto] gap-x-8 md:grid",
          className,
        )}
      >
        <div className="col-span-1 flex flex-col gap-3 pb-6">
          <div className="flex items-end gap-4">
            <FormField
              control={control}
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

            <FormField
              control={control}
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
                      className="gap-0 pr-8 sm:pr-0"
                      tabIndex={2}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="artistContact.instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Instagram </FormLabel>
                <FormControl>
                  <DebouncedControllerInput
                    tabIndex={3}
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
            control={control}
            name="artistContact.website"
            render={({ field }) => (
              <FormItem className="hidden md:block">
                <FormLabel className="font-bold">Website </FormLabel>
                <FormControl>
                  <DebouncedControllerInput
                    tabIndex={4}
                    id="artistContact.website"
                    field={field}
                    placeholder="yoursite.com"
                    transform={autoHttps}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Separator
          orientation="vertical"
          thickness={2}
          className="mx-5 hidden bg-foreground/10 md:block"
        />

        <div className={cn("flex flex-col gap-4")}>
          <div className="relative mt-3 flex h-max flex-col gap-3 rounded-md border border-dotted border-foreground/50 bg-salYellow/30 p-4 pb-6 pt-8 text-foreground/75">
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
                    value.length > 0 ||
                    "Please select at least one nationality",
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
                      tabIndex={5}
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
                    tabIndex={6}
                    placeholder="Place of residence (city, state, country, etc).."
                    className="mb-3 w-full lg:mb-0"
                    inputClassName="rounded-lg border-foreground "
                    isArtist={true}
                  />
                )}
              />
            </div>
          </div>
          <FormField
            control={control}
            name="canFeature"
            render={({ field }) => (
              <FormItem className="my-3 flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    className="text-base"
                    tabIndex={7}
                  />
                </FormControl>
                <FormLabel className="hidden font-bold leading-6 sm:block sm:leading-normal">
                  Would you like to be considered for our artist feature?
                  <sup>*</sup>
                </FormLabel>
                <FormLabel className="font-bold leading-6 sm:hidden sm:leading-normal">
                  Would you like to be a featured artist?
                  <sup>*</sup>
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className={cn("col-span-full flex w-full flex-col")}>
          <Separator
            thickness={2}
            className="mb-3 hidden bg-foreground/10 md:block"
          />
          <div className="col-span-full mt-3 flex w-full items-center justify-end gap-6">
            {activeSub ? (
              <span className="hidden flex-col gap-1 text-foreground/70 md:flex">
                <p className="text-sm">Your Plan:</p>{" "}
                <p>
                  ${subAmount}/{subInterval}
                </p>
              </span>
            ) : trialingSub ? (
              <span className="hidden flex-col gap-1 text-foreground/70 md:flex">
                <p className="text-sm">
                  {trialEnded ? "Trial Ended:" : "Trial Ends:"}
                </p>
                <p
                  className={cn("text-sm", trialEnded && "italic text-red-600")}
                >
                  {trialEndsAt
                    ? formatDate(new Date(trialEndsAt), "PPP")
                    : "N/A"}
                </p>
              </span>
            ) : null}

            <DialogFooter className="flex flex-row justify-end gap-4 lg:gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  size="lg"
                  variant="salWithShadowHiddenYlw"
                  tabIndex={9}
                  className="focus:scale-95"
                >
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  size="lg"
                  variant="salWithShadowHidden"
                  disabled={!isValid || pending}
                  tabIndex={8}
                  className="focus:scale-95"
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
                  ) : pending ? (
                    <span>
                      Saving...
                      <LoaderCircle className="size-4 animate-spin" />
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </div>
      </form>
    </Form>
  );
};
