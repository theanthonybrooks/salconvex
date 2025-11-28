"use client";

import {
  NewsletterFrequency,
  newsletterFrequencyOptions,
  NewsletterType,
  newsletterTypeOptions,
} from "@/constants/newsletterConsts";

import { CookiePref } from "@/types/user";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  formatGmtOffsetSimple,
  Timezone,
  timezones,
} from "@/app/data/timezones";
import { useManageSubscription } from "@/hooks/use-manage-subscription";
import { UpdateUserSchema, UpdateUserSchemaValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { FontSizeIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Clock,
  Cookie,
  Globe,
  Info,
  LoaderCircle,
  Mail,
  Mailbox,
  MailSearch,
  Palette,
  Shield,
} from "lucide-react";

import { MultiSelect } from "@/components/multi-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CanceledBanner } from "@/components/ui/canceled-banner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSimple,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResetPasswordDialog } from "@/features/auth/components/reset-password-dialog";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";
import { useDevice } from "@/providers/device-provider";
import { getUserThemeOptionsFull } from "@/providers/themed-provider";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "~/convex/_generated/api";
import { FontSizeType, UserPrefsType } from "~/convex/schema";
import {
  useAction,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { ConvexError } from "convex/values";

const formatKey = (key: keyof UserPrefsType): string => {
  // example: convert "notificationEmail" → "Notification email"
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
};

const getToastMessage = (
  keys: Array<keyof UserPrefsType>,
  title?: string,
): string => {
  if (keys.length === 1) {
    const key = keys[0];
    return `${title ? title : formatKey(key)} updated`;
  }
  return "Preferences updated";
};

export default function SettingsPage() {
  const pathname = usePathname();
  const params = useParams<{ slug?: string[] }>();
  const activeTab = params?.slug?.[0] ?? "account";

  const router = useRouter();

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { signOut } = useAuthActions();
  const { subscription, subStatus, cancelAt, hasActiveSubscription } =
    subData ?? {};
  const handleManageSubscription = useManageSubscription({ subscription });
  const user = userData?.user;
  const userType = user?.accountType;
  const isAdmin = user?.role?.includes("admin");
  const isArtist = userType?.includes("artist");
  const { isMobile } = useDevice();
  const userThemeOptions = getUserThemeOptionsFull(user);
  const userPref = userData?.userPref;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  const userId = userData?.userId;
  const activeSub = hasActiveSubscription;
  const canDelete =
    !subscription || subStatus === "canceled" || typeof cancelAt === "number";

  const userPlan = subData?.subPlan ?? 0;
  const minBananaUser = activeSub && userPlan >= 2;
  // const minFatCapUser = activeSub && userPlan >= 3;
  const signedUpForNewsletter = userPref?.notifications?.newsletter ?? false;

  const newsletterInfo = useQuery(
    api.newsletter.subscriber.getNewsletterStatus,
    userId
      ? {
          userId,
        }
      : "skip",
  );

  const sessionCount = useQuery(
    api.users.countSessions,
    userId ? { userId } : "skip",
  );
  const subscribeToNewsletter = useAction(
    api.actions.resend.sendNewsletterConfirmation,
  );
  const unsubscribeFromNewsletter = useAction(
    api.actions.resend.sendNewsletterUpdateConfirmation,
  );
  const updateUserPrefs = useMutation(api.users.updateUserPrefs);
  const updateUserNotifications = useMutation(
    api.users.updateUserNotifications,
  );
  const updateNewsletterSubscription = useMutation(
    api.newsletter.subscriber.updateNewsletterStatus,
  );
  const deleteSessions = useMutation(api.users.deleteSessions);
  const updateUser = useMutation(api.users.updateUser);
  const uploadProfileImage = useMutation(api.uploads.user.uploadProfileImage);
  const removeProfileImage = useMutation(api.uploads.user.removeProfileImage);
  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);

  const { setTheme, theme } = useTheme();

  // const [selectedLanguage, setLanguage] = useState("en")

  const [pending, setPending] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);

  const DeleteAccount = useMutation(api.users.deleteAccount);
  const onDeleteAccount = async () => {
    setPending(true);

    localStorage.clear();

    try {
      await DeleteAccount({ method: "deleteAccount", userId: user?.userId });
      sessionStorage.clear();
      await signOut();
    } catch (err) {
      showToast("error", "Failed to delete account. Please contact support.");
      console.error(err);
    } finally {
      setPending(false);
    }
  };

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

  useEffect(() => {
    if (!user) return;
    updateReset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      name: user.name ?? "",
    });
  }, [user, updateReset]);

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

  const handleUpdateNotifications = async (
    type: "newsletter" | "general" | "applications",
    value: boolean,
  ) => {
    setPending(true);

    if (!user || !user.email) {
      throw new Error("No user found");
    }
    try {
      const updated = {
        ...userPref?.notifications,
        [type]: value,
      };

      await updateUserNotifications({ ...updated });
      if (type === "newsletter") {
        if (value) {
          await subscribeToNewsletter({
            email: user.email,
            firstName: user.firstName,
          });
        } else {
          await unsubscribeFromNewsletter({
            newsletter: false,
            email: user.email,
          });
        }
      }

      showToast("success", "Successfully updated notification preferences!");
    } catch (error) {
      let message: string = "An unknown error occurred.";
      if (error instanceof ConvexError) {
        message = error.data?.message ?? "Unexpected error.";
      } else if (error instanceof Error) {
        message = error.message;
      }
      showToast("error", message);
    } finally {
      setPending(false);
    }
  };

  const handleUpdateNewsletterPrefs = async (
    handlerType: "frequency" | "type",
    value: NewsletterFrequency | NewsletterType[],
  ) => {
    setPending(true);
    try {
      const values = {
        email: newsletterInfo?.email ?? user?.email ?? "",
        newsletter: true,
        ...(handlerType === "frequency" && {
          frequency: value as NewsletterFrequency,
        }),
        ...(handlerType === "type" && { type: value as NewsletterType[] }),
        userPlan: userPlan ?? 0,
      };

      await updateNewsletterSubscription(values);
      showToast("success", "Successfully updated newsletter preferences");
    } catch (err) {
      let message: string =
        "An unknown error occurred. Please contact support.";
      if (err instanceof ConvexError) {
        if (err.data.includes("Log in to update")) {
          message = "Please log in to update your newsletter preferences";
        }
        showToast("error", message);
      }
    } finally {
      setPending(false);
    }
  };

  const handleDeleteSessions = async () => {
    try {
      if (!user) {
        throw new Error("User not found");
      }
      await deleteSessions({ userId: user?.userId });
      // await invalidateSessions({ userId: user?.userId })
      showToast("success", "Sessions deleted!");
      sessionStorage.clear();
      signOut();
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

  const handleTabChange = (value: string) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 2) {
      segments[segments.length - 1] = value;
    } else {
      segments.push(value);
    }
    router.replace("/" + segments.join("/"));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <CanceledBanner
        activeSub={activeSub}
        subStatus={subStatus}
        fontSize={fontSize}
        willCancel={cancelAt}
      />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="scrollable invis h-12 w-full max-w-full justify-around bg-white/80 md:w-auto md:justify-start">
          <TabsTrigger
            value="account"
            className={cn("h-9 px-4", fontSize)}
            border
          >
            Account
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className={cn("hidden h-9 px-4 lg:block", fontSize)}
            border
          >
            Notifications
          </TabsTrigger>

          {/* /~ //NOTE: in order to disabled, just add "disabled" to the tabs    trigger ~/ */}

          <TabsTrigger
            value="appearance"
            className={cn("h-9 px-4", fontSize)}
            border
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={cn("h-9 px-4", fontSize)}
            border
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
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
                          (Updating will require re-verifying*)
                        </i>
                        {/* TODO: Add some logic that checks if the email was changed and if so, toasts a message to the user that a new verification email will be sent */}
                      </Label>
                      <Input
                        {...updateRegister("email")}
                        // disabled={pending}
                        //TODO: Add this back in when I implement the email verification system
                        disabled={true || pending}
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
                    variant={
                      unsavedChanges ? "salWithShadow" : "salWithoutShadow"
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
            <div
              className={cn(
                isArtist && activeSub && "grid gap-6 md:grid-cols-2",
              )}
            >
              {isArtist && activeSub && (
                <Card className={cn(isArtist && activeSub && "self-start")}>
                  <CardHeader>
                    <CardTitle>Artist Profile</CardTitle>
                    <CardDescription>
                      Manage your artist profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <span
                      className={cn(
                        "inline-flex items-baseline text-sm",
                        fontSize,
                      )}
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
              {((isArtist && activeSub) || isAdmin) && (
                <Card className={cn(isArtist && activeSub && "self-start")}>
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
                            isArtist && activeSub && "flex-col items-start",
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
                          Mark open calls as &quot;Applied&quot; after clicking
                          Apply
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
                        <Label className={fontSize}>
                          Hide Application Fees
                        </Label>

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
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Globe className="size-5 shrink-0 text-muted-foreground" />
                    <div>
                      <Label className={fontSize}>General Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Emails about upcoming updates to the site, user surveys,
                        and other news related to The Street Art List
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!userPref?.notifications?.general}
                    onCheckedChange={(value) =>
                      handleUpdateNotifications("general", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Mailbox className="size-5 shrink-0 text-muted-foreground" />
                    <div>
                      <Label className={fontSize}>Newsletter</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive {userPlan > 1 ? "weekly/monthly" : "monthly"}{" "}
                        newsletter
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!userPref?.notifications?.newsletter}
                    onCheckedChange={(value) =>
                      handleUpdateNotifications("newsletter", value)
                    }
                  />
                </div>

                <Separator />
                <div className="pointer-events-none flex items-center justify-between gap-4 text-muted-foreground/50">
                  <div className="flex items-center gap-4">
                    <Mail className="size-5 shrink-0" />
                    <div>
                      <Label
                        className={cn(
                          fontSize,
                          "flex flex-col items-baseline gap-1 sm:flex-row",
                        )}
                      >
                        Application Notifications{" "}
                        <p className="text-xs italic">(*coming soon)</p>
                      </Label>
                      <p className="text-sm">
                        Receive email updates for applications
                      </p>
                    </div>
                  </div>
                  <Switch
                    disabled
                    checked={!!userPref?.notifications?.applications}
                    onCheckedChange={(value) =>
                      handleUpdateNotifications("applications", value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {userPlan > 1 && signedUpForNewsletter && (
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>
                  Manage your newsletter preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Separator />

                  <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
                    <div className="flex items-center gap-4">
                      <MailSearch className="size-5 shrink-0 text-muted-foreground" />
                      <div>
                        <Label className={fontSize}>Newsletter Type(s)</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose general and/or open call newsletters (1
                          minimum)
                        </p>
                      </div>
                    </div>
                    <MultiSelect
                      options={newsletterTypeOptions.map((opt) =>
                        opt.value === "openCall" && !minBananaUser
                          ? { ...opt, disabled: true, premium: true }
                          : opt,
                      )}
                      onValueChange={(value) => {
                        handleUpdateNewsletterPrefs(
                          "type",

                          value.length === 0
                            ? ["general"]
                            : (value as NewsletterType[]),
                        );
                      }}
                      value={newsletterInfo?.type || ["general"]}
                      placeholder="Select account type(s)"
                      variant="basic"
                      maxCount={2}
                      shortResults={isMobile}
                      fallbackValue={["general"]}
                      height={11}
                      hasSearch={false}
                      selectAll={false}
                      className={cn(
                        "w-full max-w-60 border-1.5 border-foreground/20 sm:h-11 sm:max-w-[19rem]",
                      )}
                      // tabIndex={step === "signUp" ? 5 : -1}
                    />
                  </div>
                  <Separator />
                  <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
                    {" "}
                    <div className="flex items-center gap-4">
                      <Clock className="size-5 shrink-0 text-muted-foreground" />
                      <div>
                        <Label className={fontSize}>Preferred Frequency</Label>
                        <p className="text-sm text-muted-foreground">
                          Emails about upcoming updates to the site, user
                          surveys, and other news related to The Street Art List
                        </p>
                      </div>
                    </div>
                    <SelectSimple
                      options={newsletterFrequencyOptions.map((opt) =>
                        opt.value === "weekly" && !minBananaUser
                          ? { ...opt, disabled: true, premium: true }
                          : opt,
                      )}
                      value={newsletterInfo?.frequency ?? "monthly"}
                      onChangeAction={(value) =>
                        handleUpdateNewsletterPrefs(
                          "frequency",
                          value as NewsletterFrequency,
                        )
                      }
                      placeholder="Select frequency"
                      className="w-full max-w-60 border-1.5 border-foreground/20 bg-card placeholder:text-foreground sm:h-11 sm:max-w-40"
                      center
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance </CardTitle>
              <CardDescription>
                Customize your display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Separator />
                <div className="flex flex-col items-start justify-start gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0">
                  <div className="flex items-center gap-4">
                    <Palette className="size-5 text-muted-foreground" />
                    <div>
                      <Label className={fontSize}>Theme Color</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your theme color
                      </p>
                    </div>
                  </div>
                  <SelectSimple
                    options={userThemeOptions}
                    value={(userPref?.theme ?? theme) || "default"}
                    onChangeAction={(val) => {
                      setTheme(val);
                      handleUpdateUserPrefs(
                        { theme: val },
                        { title: "Theme preferences" },
                      );
                    }}
                    placeholder="Select theme"
                    fontSize={fontSize}
                    center
                    className="border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]"
                  />
                </div>
                <div className="flex flex-col items-start justify-start gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0">
                  <div className="flex items-center gap-4">
                    <FontSizeIcon className="size-5 text-muted-foreground" />
                    <div>
                      <Label className={fontSize}>Text Size</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your display text size
                      </p>
                    </div>
                  </div>
                  <SelectSimple
                    options={[
                      {
                        value: "normal",
                        label: "Normal (Default)",
                        className: "!text-sm",
                      },
                      {
                        value: "large",
                        label: "Large",
                        className: "!text-base ",
                      },
                    ]}
                    value={userPref?.fontSize ?? "normal"}
                    onChangeAction={(value) => {
                      handleUpdateUserPrefs(
                        {
                          fontSize: value as FontSizeType,
                        },
                        { title: "Font Size preference" },
                      );
                    }}
                    placeholder="Select theme"
                    fontSize={fontSize}
                    center
                    className={cn(
                      "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
                    )}
                  />

                  {/* <Select
                    value={userPref?.fontSize ?? "normal"}
                    onValueChange={}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
                        fontSize === "text-base" ? "sm:text-base" : fontSize,
                      )}
                    >
                      <SelectValue placeholder="Select text size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal" center>
                        Normal (Default)
                      </SelectItem>
                      <SelectItem value="large" center className="sm:text-base">
                        Large
                      </SelectItem>
                    </SelectContent>
                  </Select> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Manage your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-start justify-start gap-y-2 px-4 md:flex-row md:items-center md:justify-between md:gap-y-0">
                    <div className="flex items-center gap-4">
                      <Cookie className="size-5 text-muted-foreground" />
                      <div>
                        <Label className={fontSize}>Cookies</Label>
                        <p className="text-sm text-muted-foreground">
                          Change your cookie preferences
                        </p>
                      </div>
                    </div>

                    <Select
                      value={userPref?.cookiePrefs}
                      onValueChange={(value) =>
                        handleUpdateUserPrefs(
                          {
                            cookiePrefs: value as CookiePref,
                          },
                          { title: "Cookie Preferences" },
                        )
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
                          fontSize === "text-base" ? "sm:text-base" : fontSize,
                        )}
                      >
                        <SelectValue placeholder="Select One" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" center>
                          All Cookies
                        </SelectItem>
                        <SelectItem value="required" center>
                          Required Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <Lock className='size-5 text-muted-foreground' />
                      <div>
                        <Label className={fontSize}>Two-Factor Authentication</Label>
                        <p className='text-sm text-muted-foreground'>
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <Button variant='outline' disabled>
                      /~ Enable ~/
                      
                    </Button>
                  </div>
                  <Separator />*/}
                  <div className="flex flex-col items-start justify-start gap-y-2 px-4 md:flex-row md:items-center md:justify-between md:gap-y-0">
                    <div className="flex items-center gap-4">
                      <Shield className="size-5 text-muted-foreground" />
                      <div>
                        <Label className={fontSize}>Password</Label>
                        <p className="text-sm text-muted-foreground">
                          Change your password
                        </p>
                      </div>
                    </div>

                    <ResetPasswordDialog />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>Manage your active sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn("space-y-4", fontSize)}>
                  <div className="flex flex-col items-start justify-start gap-y-2 px-4 md:flex-row md:items-center md:justify-between md:gap-y-0">
                    <p className="font-medium">Current Session</p>
                    <div>
                      {/* <p className='text-sm text-muted-foreground'>
                        Last active: Just now
                      </p> */}
                    </div>
                    <Button
                      type="button"
                      variant="salWithShadowHiddenYlw"
                      className="w-full min-w-[150px] font-bold text-red-600 sm:w-auto"
                      onClick={signOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                  <Separator />
                  {isAdmin && (
                    <>
                      <div className="flex flex-col items-start justify-start gap-y-2 px-4 md:flex-row md:items-center md:justify-between md:gap-y-0">
                        <div>
                          <p className="font-medium">Other Sessions</p>
                          <p className="text-sm text-muted-foreground">
                            {sessionCount ?? 0} active session
                            {sessionCount && sessionCount > 1 ? "s" : ""}
                          </p>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="salWithShadowHiddenYlw"
                              className="w-full min-w-[150px] font-bold text-red-600 sm:w-auto"
                            >
                              Sign Out All
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">
                                Sign out all sessions?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription className="text-foreground">
                              Are you sure you want to sign out of all your
                              sessions? You&apos;ll need to re-login on all
                              devices.
                            </AlertDialogDescription>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteSessions}>
                                Yes, sign out all
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex flex-col items-start justify-start gap-y-2 rounded-lg bg-destructive/10 p-4 md:flex-row md:items-center md:justify-between md:gap-x-4 md:gap-y-0">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account — any active memberships
                        need to be{" "}
                        <Link
                          href="/dashboard/billing"
                          variant="subtleUnderline"
                        >
                          canceled
                        </Link>{" "}
                        before this is possible
                      </p>
                    </div>

                    {canDelete ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={!canDelete}
                            type="button"
                            variant="destructive"
                            className="w-full min-w-[150px] font-bold sm:w-auto"
                          >
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-bold text-foreground">
                              Delete Account
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogDescription className="text-foreground">
                            Are you sure you want to delete your account? All
                            data will be permanently deleted.
                          </AlertDialogDescription>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDeleteAccount}>
                              Yes, Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        disabled={canDelete}
                        type="button"
                        variant="destructive"
                        className="w-full min-w-[150px] font-bold sm:w-auto"
                        onClick={() => handleManageSubscription()}
                      >
                        Cancel Membership
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
