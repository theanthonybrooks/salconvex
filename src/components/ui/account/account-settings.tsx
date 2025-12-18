import type { Timezone } from "@/app/data/timezones";
import type { UpdateUserSchemaValues } from "@/schemas/auth";
import type z from "zod";

import { useEffect, useState } from "react";
import { formatGmtOffsetSimple, timezones } from "@/app/data/timezones";
import { UpdateUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Info, LoaderCircle } from "lucide-react";

import type { UserPrefsType } from "~/convex/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoUploader from "@/components/ui/logo-uploader";
import { SearchMappedSelect } from "@/components/ui/mapped-select";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getToastMessage } from "@/features/dashboard/settings";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";

export const AccountSettings = () => {
  // const { isMobile } = useDevice();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};

  const { user, userPref } = userData ?? {};

  const isArtist = user?.accountType?.includes("artist");

  const [pending, setPending] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);

  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    reset: updateReset,
    // formState: { errors: updateErrors },
    // setValue: updateSetValue,
    formState: { isDirty: unsavedChanges },
  } = useForm<z.infer<typeof UpdateUserSchema>>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      name: user?.name ?? "",
    },
  });

  const isAdmin = user?.role?.includes("admin");
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const updateUser = useMutation(api.users.updateUser);
  const uploadProfileImage = useMutation(api.uploads.user.uploadProfileImage);
  const removeProfileImage = useMutation(api.uploads.user.removeProfileImage);
  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);
  const updateUserPrefs = useMutation(api.users.updateUserPrefs);

  const handleUpdateUserPrefs = async (
    update: Partial<UserPrefsType>,
    options?: { title?: string },
  ) => {
    const { title } = options ?? {};
    setPending(true);

    if (!user) {
      throw new Error("No user found");
    }

    try {
      await updateUserPrefs(update);
      const changed = Object.keys(update) as Array<keyof UserPrefsType>;
      const message = getToastMessage(changed, title);

      showToast("success", message);
    } catch (err: unknown) {
      let message: string = "An unknown error occurred.";
      if (err instanceof ConvexError) {
        message = err.data || "An unexpected error occurred.";
      } else if (err instanceof Error) {
        message = err.message || "An unexpected error occurred.";
      }
      showToast("error", message);
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

  const handleImgRemoval = async () => {
    if (!user) return;
    if (!user.imageStorageId) return;
    try {
      setUploading(true);
      await removeProfileImage({ storageId: user.imageStorageId });
      setUploading(false);
      showToast("success", "Profile image removed successfully!");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to remove profile image");
    }
  };

  const handleFileChange = async (
    // event: React.ChangeEvent<HTMLInputElement>,
    file: Blob,
  ) => {
    // if (!event.target.files || event.target.files.length === 0) return;

    // const file = event.target.files[0];

    setUploading(true);

    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      showToast("error", "Failed to upload profile image");
      setUploading(false);
      return;
    }

    const { storageId } = await response.json();

    await uploadProfileImage({ storageId });

    setUploading(false);
    showToast("success", "Profile image updated successfully!");
  };

  const handleUpdateUserSubmit = async (data: UpdateUserSchemaValues) => {
    setPending(true);
    setIsSaving(true);

    if (!user || !user.email) {
      throw new Error("No user found");
    }
    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        name: data.name,
        organizationName: data.organizationName ?? "",
      });
      // console.log("formData", formData)
      setPending(false);
      setIsSaving(false);
      showToast("success", "User updated!");
      updateReset();
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        showToast("error", err.data || "An unexpected error occurred.");
      }
    } finally {
      setPending(false);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    updateReset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      name: user.name ?? "",
    });
  }, [user, updateReset]);

  return (
    <>
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center">
            <LogoUploader
              id="logo-upload"
              onChangeAction={handleFileChange}
              onRemoveAction={handleImgRemoval}
              initialImage={user?.image}
              // imageOnly
              className="gap-4 pr-8"
              loading={uploading}
            />
          </div>

          <Separator />
          <form onSubmit={updateHandleSubmit(handleUpdateUserSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={fontSize}>
                  First Name
                </Label>
                <Input
                  {...updateRegister("firstName")}
                  disabled={pending}
                  id="firstName"
                  placeholder="Your first name/given name"
                  className="dark:text-primary-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={fontSize}>
                  Last Name
                </Label>
                <Input
                  disabled={pending}
                  {...updateRegister("lastName")}
                  id="lastName"
                  placeholder="Your last name/family name"
                  className="dark:text-primary-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={fontSize}>
                  Email{" "}
                  <i className="text-xs font-light">
                    (Update in <strong>Security</strong> settings*)
                  </i>
                </Label>
                <Input
                  {...updateRegister("email")}
                  disabled
                  id="email"
                  type="email"
                  placeholder="Your email"
                  className="dark:text-primary-foreground"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-start gap-x-2">
                  <Label htmlFor="name" className={fontSize}>
                    {isArtist ? "Artist Name/" : null}Preferred Name
                  </Label>
                  <p className="text-sm font-light italic">(Optional)</p>
                </div>
                <Input
                  {...updateRegister("name")}
                  id="name"
                  placeholder="Artist Name/Preferred Name"
                  className="dark:text-primary-foreground"
                />
              </div>
            </div>
            <Button
              disabled={isSaving || !unsavedChanges}
              type="submit"
              variant={unsavedChanges ? "salWithShadow" : "salWithoutShadow"}
              onMouseEnter={handleOnHoverSave}
              onMouseLeave={handleOnHoverSaveEnd}
              className="mt-4 w-full sm:w-auto dark:text-primary-foreground"
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
      <div
        className={cn(
          isArtist && hasActiveSubscription && "grid gap-6 md:grid-cols-2",
        )}
      >
        {isArtist && hasActiveSubscription && (
          <Card
            className={cn(isArtist && hasActiveSubscription && "self-start")}
          >
            <CardHeader>
              <CardTitle>Artist Profile</CardTitle>
              <CardDescription>Manage your artist profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <span
                className={cn("inline-flex items-baseline text-sm", fontSize)}
              >
                <Info className="mr-1 size-4 shrink-0 translate-y-0.5" />
                <span>
                  Note: Artist profile has moved to the{" "}
                  <Link
                    href="/dashboard/artist"
                    variant="bold"
                    className={cn(
                      "underline-offset-2 hover:underline-offset-4 active:underline-offset-1",
                    )}
                    fontSize={fontSize}
                  >
                    My Profile
                  </Link>{" "}
                  page.
                </span>
              </span>
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        {((isArtist && hasActiveSubscription) || isAdmin) && (
          <Card
            className={cn(isArtist && hasActiveSubscription && "self-start")}
          >
            <CardHeader>
              <CardTitle>Open Call Preferences</CardTitle>
              <CardDescription>
                Manage your open call preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* <div className='flex items-center justify-between'>
                   //TODO: Add language selection in the future 
                     <div className='space-y-0.5'>
                      <Label className={fontSize}>Language</Label>
                      <p className='text-sm text-muted-foreground'>
                        Select your preferred language
                      </p>
                    </div> 
                    <Select defaultValue='en' onChange={() => setLanguage(value)}>
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Select language' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en'>English</SelectItem>
                        <SelectItem value='fr'>French</SelectItem>
                        <SelectItem value='de'>German</SelectItem>
                        // <SelectItem value='es'>Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />*/}
              <div className="flex flex-col items-start justify-start gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0">
                <div className="space-y-0.5">
                  <Label className={fontSize}>Timezone</Label>
                  <span
                    className={cn(
                      "flex items-center gap-x-1",
                      isArtist &&
                        hasActiveSubscription &&
                        "flex-col items-start",
                    )}
                  >
                    <p className="text-sm text-muted-foreground">
                      Set your local timezone
                    </p>
                    <p className="hidden text-xs italic text-muted-foreground lg:block">
                      (used for open call deadlines)
                    </p>
                  </span>
                </div>

                <SearchMappedSelect<Timezone>
                  searchFields={[
                    "name",
                    "region",
                    "abbreviation",
                    "gmtOffset",
                    "gmtAbbreviation",
                    "iana",
                  ]}
                  value={userPref?.timezone ?? ""}
                  onChange={(value) =>
                    handleUpdateUserPrefs(
                      { timezone: value },
                      { title: "Preferred Timezone" },
                    )
                  }
                  className={cn(
                    fontSize === "text-base" ? "sm:text-base" : fontSize,
                    "max-w-[72vw] sm:w-[350px]",
                  )}
                  data={timezones[0]}
                  getItemLabel={(timezone) =>
                    `${formatGmtOffsetSimple(
                      timezone.utcOffsets,
                    )}  - ${timezone.name} (${timezone.abbreviation}${
                      timezone.dstAbbreviation
                        ? `/${timezone.dstAbbreviation}`
                        : ""
                    })`
                  }
                  // getItemDisplay={(timezone) =>
                  //   `(${
                  //     timezone.region !== "North America"
                  //       ? timezone.gmtAbbreviation
                  //       : timezone.abbreviation
                  //   })  - ${timezone.name}`
                  // }
                  getItemDisplay={(timezone) => {
                    // Build GMT offsets string from utcOffsets
                    const gmtOffsetsDisplay = formatGmtOffsetSimple(
                      timezone.utcOffsets,
                    );

                    const abbrevDisplay = timezone.dstAbbreviation
                      ? `${timezone.abbreviation}/${timezone.dstAbbreviation}`
                      : timezone.abbreviation;

                    // Use GMT offsets for non–North America, abbreviations otherwise
                    const regionLabel =
                      timezone.region !== "North America"
                        ? gmtOffsetsDisplay
                        : abbrevDisplay;

                    return `(${regionLabel}) - ${timezone.name}`;
                  }}
                  getItemValue={(timezone) => timezone.iana[0]}
                />
              </div>
              <Separator />

              <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-0.5">
                  <Label className={fontSize}>Auto-Apply</Label>

                  <p className="text-sm text-muted-foreground">
                    Mark open calls as &quot;Applied&quot; after clicking Apply
                  </p>
                </div>
                <SelectSimple
                  options={[
                    { value: "true", label: "On (Default)" },
                    { value: "false", label: "Off" },
                  ]}
                  value={String(userPref?.autoApply ?? true)}
                  onChangeAction={(value) =>
                    handleUpdateUserPrefs(
                      { autoApply: value === "true" },
                      { title: "Open Call Preferences" },
                    )
                  }
                  placeholder="Select one"
                  fontSize={fontSize}
                  center
                  className={cn(
                    "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-40",
                  )}
                />
              </div>
              <Separator />

              <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-0.5">
                  <Label className={fontSize}>Hide Application Fees</Label>

                  <p className="text-sm text-muted-foreground">
                    Hide open calls with application fees from The List
                  </p>
                </div>
                <SelectSimple
                  options={[
                    { value: "false", label: "Off (Default)" },
                    { value: "true", label: "On " },
                  ]}
                  value={String(userPref?.hideAppFees ?? false)}
                  onChangeAction={(value) =>
                    handleUpdateUserPrefs(
                      {
                        hideAppFees: value === "true",
                      },
                      { title: "Open Call Preferences" },
                    )
                  }
                  placeholder="Select one"
                  fontSize={fontSize}
                  center
                  className={cn(
                    "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-40",
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
