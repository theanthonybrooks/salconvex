"use client";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  UpdatePasswordSchema,
  UpdatePasswordSchemaValues,
  UpdateUserPrefsSchemaValues,
  UpdateUserSchema,
  UpdateUserSchemaValues,
} from "@/schemas/auth";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  formatGmtOffsetSimple,
  Timezone,
  timezones,
} from "@/app/data/timezones";
import { MultiSelect } from "@/components/multi-select";
import { CanceledBanner } from "@/components/ui/canceled-banner";
import { Link } from "@/components/ui/custom-link";
import LogoUploader from "@/components/ui/logo-uploader";
import { SearchMappedSelect } from "@/components/ui/mapped-select";
import { PasswordChecklist } from "@/components/ui/password-checklist";
import { PasswordInput } from "@/components/ui/password-input";
import {
  NewsletterFrequency,
  newsletterFrequencyOptions,
  NewsletterType,
  newsletterTypeOptions,
} from "@/constants/newsletterConsts";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import { useDevice } from "@/providers/device-provider";
import { CookiePref } from "@/types/user";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { FontSizeIcon } from "@radix-ui/react-icons";
import { usePreloadedQuery } from "convex/react";
import { useTheme } from "next-themes";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export default function SettingsPage() {
  const pathname = usePathname();
  const params = useParams<{ slug?: string[] }>();
  const activeTab = params?.slug?.[0] ?? "account";

  const router = useRouter();

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { signOut } = useAuthActions();

  const user = userData?.user;
  const userType = user?.accountType;
  const isAdmin = user?.role?.includes("admin");
  const isArtist = userType?.includes("artist");
  const { isMobile } = useDevice();

  const userPrefs = userData?.userPref;
  const fontSize = userPrefs?.fontSize === "large" ? "text-base" : "text-sm";
  const userId = userData?.userId;
  const activeSub = subData?.hasActiveSubscription;

  const subStatus = subData?.subStatus ?? "none";
  const userPlan = subData?.subPlan ?? 0;
  const minBananaUser = activeSub && userPlan >= 2;
  // const minFatCapUser = activeSub && userPlan >= 3;
  const signedUpForNewsletter = userPrefs?.notifications?.newsletter ?? false;

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
  const updatePassword = useMutation(api.users.updatePassword);
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

  const [pwOpen, setPwOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  // const [selectedLanguage, setLanguage] = useState("en")

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);

  const DeleteAccount = useMutation(api.users.deleteAccount);
  const onDeleteAccount = async () => {
    setPending(true);
    setError("");
    localStorage.clear();

    try {
      await DeleteAccount({ method: "deleteAccount", userId: user?.userId });
      sessionStorage.clear();
      await signOut();
    } catch (err) {
      setError("Failed to delete account. Please try again.");
      console.error(err);
    } finally {
      setPending(false);
    }
  };
  const passwordForm = useForm<UpdatePasswordSchemaValues>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      repeatNewPassword: "",
    },
    mode: "onChange",
    delayError: 300,
  });

  const { getFieldState, watch } = passwordForm;
  const newPassword = watch("newPassword");
  const newRepeatedPassword = watch("repeatNewPassword");
  const currentPasswordState = getFieldState("oldPassword");
  const newPasswordState = getFieldState("newPassword");
  const currentPasswordValid =
    !currentPasswordState?.invalid && currentPasswordState?.isDirty;
  const newPasswordValid =
    !newPasswordState?.invalid && newPasswordState?.isDirty;

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
      // toast.success("Profile image removed successfully!", {
      //   autoClose: 2000,
      //   pauseOnHover: false,
      //   hideProgressBar: true,
      // });
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove profile image", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
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
      toast.error("Failed to upload profile image", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
      setUploading(false);
      return;
    }

    const { storageId } = await response.json();

    await uploadProfileImage({ storageId });

    setUploading(false);
    // toast.success("Profile image updated successfully!", {
    //   autoClose: 2000,
    //   pauseOnHover: false,
    //   hideProgressBar: true,
    //   closeButton: false,
    // });
  };

  const handleUpdateUserSubmit = async (data: UpdateUserSchemaValues) => {
    setPending(true);
    setIsSaving(true);
    setError("");

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
      toast.success("User updated!", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
      updateReset();
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        toast.error(err.data || "An unexpected error occurred.", {
          autoClose: 2000,
          pauseOnHover: false,
          hideProgressBar: true,
        });
      }
    } finally {
      setPending(false);
      setIsSaving(false);

      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
    }
  };

  const handleUpdateUserPrefs = async (
    update: Partial<UpdateUserPrefsSchemaValues>,
  ) => {
    setPending(true);
    setError("");

    if (!user) {
      throw new Error("No user found");
    }

    try {
      await updateUserPrefs(update);
      setSuccess("User updated!");
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setPending(false);
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
    }
  };

  const handleUpdateNotifications = async (
    type: "newsletter" | "general" | "applications",
    value: boolean,
  ) => {
    setPending(true);
    setError("");

    if (!user || !user.email) {
      throw new Error("No user found");
    }
    try {
      const updated = {
        ...userPrefs?.notifications,
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

      setPending(false);
      setSuccess("Successfully updated user preferences!");
    } catch (error) {
      if (error instanceof ConvexError) {
        console.log(error.data);
        setError(error.data?.message ?? "Unexpected error.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
        console.error(error);
      }
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
      setSuccess("Successfully updated newsletter preferences");
    } catch (err) {
      if (err instanceof ConvexError) {
        if (err.data.includes("Log in to update")) {
          setError("Please log in to update your newsletter preferences");
        } else {
          setError("An unknown error occurred. Please contact support.");
        }
      }
    } finally {
      setPending(false);
    }
  };

  const handleUpdatePasswordSubmit = async (
    data: UpdatePasswordSchemaValues,
  ) => {
    setPending(true);
    setError("");

    if (!user || !user.email) {
      throw new Error("No user found");
    }
    try {
      await updatePassword({
        email: user.email,
        password: data.newPassword,
        currentPassword: data.oldPassword,
        userId: user.userId as Id<"users">,
        method: "userUpdate",
      });

      setPending(false);
      setSuccess("Password updated!");
      passwordForm?.reset();

      setTimeout(() => {
        setSuccess("");
        setError("");
        setPwOpen(false);
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unknown error occurred.");
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
      setSuccess("Sessions deleted!");
      sessionStorage.clear();
      signOut();
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
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
        <TabsList className="scrollable invis h-12 w-full max-w-full justify-around border bg-white/80 md:w-auto md:justify-start">
          <TabsTrigger value="account" className="h-9 px-4" border>
            Account
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className="hidden h-9 px-4 lg:block"
            border
          >
            Notifications
          </TabsTrigger>

          {/* /~ //NOTE: in order to disabled, just add "disabled" to the tabs    trigger ~/ */}

          <TabsTrigger value="appearance" className="h-9 px-4" border>
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="h-9 px-4" border>
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
                          Artist Name/Preferred Name
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
                    <span className="inline-flex items-baseline text-sm sm:text-base">
                      <Info className="mr-1 size-4 shrink-0 translate-y-0.5" />
                      <span>
                        Note: Artist profile has moved to the{" "}
                        <Link
                          href="/dashboard/artist"
                          variant="bold"
                          className="text-sm underline-offset-2 hover:underline-offset-4 active:underline-offset-1"
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
              <Card className={cn(isArtist && activeSub && "self-start")}>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your account preferences
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
                          (if you want it used to display deadlines)
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
                      value={userPrefs?.timezone ?? ""}
                      onChange={(value) =>
                        handleUpdateUserPrefs({ timezone: value })
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
                  {/* //TODO: Add this back in when I implement the currency conversion logic */}
                  {/*     <div className="flex flex-col items-start justify-start gap-y-2 md:flex-row md:items-center md:justify-between md:gap-y-0">
                    <div className="space-y-0.5">
                      <Label className={fontSize}>Currency</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your preferred currency
                      </p>
                    </div>
                    /~ <Select defaultValue='est'>
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Select timezone' />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> ~/

                    <SearchMappedSelect<Currency>
                      className="sm:w-[120px]"
                      value={selectedCurrency ?? "USD"}
                      onChange={setCurrency}
                      data={currencies[0]}
                      getItemLabel={(currency) =>
                        `${currency.symbol} (${currency.code}) - ${currency.name}`
                      }
                      searchFields={["name", "symbol", "code"]}
                      getItemDisplay={(currency) =>
                        `${currency.symbol} (${currency.code})`
                      }
                      getItemValue={(currency) => currency.code}
                    />
                  </div>*/}
                  {isArtist && (
                    <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-0.5">
                        <Label className={fontSize}>Auto-Apply</Label>

                        <p className="text-sm text-muted-foreground">
                          Automatically mark open calls as &quot;Applied&quot;
                          after clicking Apply
                        </p>
                      </div>
                      <Select
                        value={String(userPrefs?.autoApply)}
                        onValueChange={(value) =>
                          handleUpdateUserPrefs({ autoApply: value === "true" })
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
                            fontSize === "text-base"
                              ? "sm:text-base"
                              : fontSize,
                          )}
                        >
                          <SelectValue placeholder="Select One" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true" center>
                            On (Default)
                          </SelectItem>
                          <SelectItem value="false" center>
                            Off
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    checked={!!userPrefs?.notifications?.general}
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
                    checked={!!userPrefs?.notifications?.newsletter}
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
                    checked={!!userPrefs?.notifications?.applications}
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
                      itemClassName="justify-center"
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
              <CardDescription>Customize the look and feel</CardDescription>
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

                  <Select
                    value={userPrefs?.theme ?? theme}
                    onValueChange={(value) => {
                      setTheme(value);
                      handleUpdateUserPrefs({ theme: value });
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
                        fontSize === "text-base" ? "sm:text-base" : fontSize,
                      )}
                    >
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default" center>
                        SAL Yellow (Default)
                      </SelectItem>
                      <SelectItem value="light" center>
                        Light
                      </SelectItem>
                      {isAdmin && (
                        <SelectItem value="dark" center>
                          Dark
                        </SelectItem>
                      )}{" "}
                      <SelectItem value="white" center>
                        White
                      </SelectItem>
                      {isAdmin && (
                        <SelectItem value="orange" center>
                          Orange
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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

                  <Select
                    value={userPrefs?.fontSize ?? "normal"}
                    onValueChange={(value) => {
                      handleUpdateUserPrefs({ fontSize: value });
                    }}
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
                  </Select>
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
                      value={userPrefs?.cookiePrefs}
                      onValueChange={(value) =>
                        handleUpdateUserPrefs({
                          cookiePrefs: value as CookiePref,
                        })
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
                    <Dialog onOpenChange={setPwOpen} open={pwOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full min-w-[150px] sm:w-auto"
                        >
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit password</DialogTitle>
                          <DialogDescription className="sr-only">
                            New password must be at least 8 characters long and
                            must include at least one number, one uppercase
                            letter, and one lowercase letter.
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...passwordForm}>
                          <form
                            onSubmit={passwordForm?.handleSubmit(
                              handleUpdatePasswordSubmit,
                            )}
                            className="space-y-2"
                          >
                            {success && success === "Password updated!" && (
                              <FormSuccess message={success} />
                            )}
                            {error && <FormError message={error} />}
                            <FormField
                              control={passwordForm.control}
                              name="oldPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={cn("text-right", fontSize)}
                                  >
                                    Current Password
                                  </FormLabel>

                                  <FormControl>
                                    <PasswordInput
                                      isPending={pending}
                                      tabIndex={1}
                                      field={field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={cn("text-right", fontSize)}
                                  >
                                    New Password
                                  </FormLabel>

                                  <FormControl>
                                    <PasswordInput
                                      disabled={!currentPasswordValid}
                                      isPending={pending}
                                      tabIndex={2}
                                      field={field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="repeatNewPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel
                                    className={cn("text-right", fontSize)}
                                  >
                                    Repeat New Password
                                  </FormLabel>

                                  <FormControl>
                                    <PasswordInput
                                      disabled={
                                        !newPasswordValid ||
                                        !currentPasswordValid
                                      }
                                      isPending={pending}
                                      tabIndex={3}
                                      field={field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {currentPasswordValid && (
                              <PasswordChecklist
                                password={newPassword ?? ""}
                                checkPassword={newRepeatedPassword ?? ""}
                                type="update"
                              />
                            )}

                            <DialogFooter>
                              <Button
                                className="mt-3 w-full"
                                variant={
                                  passwordForm.formState?.isValid
                                    ? "salWithShadow"
                                    : "salWithShadowHidden"
                                }
                                type="submit"
                                disabled={!passwordForm.formState?.isValid}
                              >
                                Update Password
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
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
                      variant="outline"
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
                              variant="outline"
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={activeSub}
                          type="button"
                          variant="destructive"
                          className="w-full min-w-[150px] font-bold sm:w-auto"
                        >
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">
                            Sign out all sessions?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="text-foreground">
                          Are you sure you want to delete your account? Any
                          active memberships need to be canceled before this is
                          possible and all data will be permanently deleted.
                        </AlertDialogDescription>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={onDeleteAccount}>
                            Yes, Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
