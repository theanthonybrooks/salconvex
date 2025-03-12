"use client"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UpdatePasswordSchema,
  UpdateUserPrefsSchema,
  UpdateUserSchema,
} from "@/schemas/auth"
import { useAuthActions } from "@convex-dev/auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import {
  Bell,
  Eye,
  EyeOff,
  Globe,
  LoaderPinwheel,
  Mail,
  Palette,
  Shield,
  Upload,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { currencies, Currency } from "@/app/data/currencies"
import { Timezone, timezones } from "@/app/data/timezones"
import { SearchMappedSelect } from "@/components/ui/mapped-select"
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog"
import { useTheme } from "next-themes"
import { useCallback } from "react"
import { FaUserNinja } from "react-icons/fa6"
import { toast } from "react-toastify"
import { api } from "~/convex/_generated/api"

export default function SettingsPage() {
  const { signOut } = useAuthActions()
  // const router = useRouter()
  const userData = useQuery(api.users.getCurrentUser, {})
  const user = userData?.user
  const userPrefs = userData?.userPref
  const sessionCount = useQuery(api.users.countSessions, {
    userId: user?.userId ?? "guest",
  })
  const updatePassword = useMutation(api.users.updatePassword)
  const updateUserPrefs = useMutation(api.users.updateUserPrefs)
  const deleteSessions = useMutation(api.users.deleteSessions)
  const updateUser = useMutation(api.users.updateUser)
  const uploadProfileImage = useMutation(api.uploads.user.uploadProfileImage)
  const generateUploadUrl = useMutation(api.uploads.user.generateUploadUrl)
  const [selectedTimezone, setTimezone] = useState<string | undefined>(
    undefined
  )
  const [selectedCurrency, setCurrency] = useState<string | undefined>(
    undefined
  )
  const { setTheme, theme } = useTheme()
  const [selectedTheme, setThemePref] = useState<string | undefined>(undefined)
  // const [selectedLanguage, setLanguage] = useState("en")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  // TODO: ensure that pending state isn't being misused
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [firstName, setFirstName] = useState<string | undefined>(undefined)
  const [lastName, setLastName] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [name, setName] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  const prevPrefs = useRef({
    timezone: selectedTimezone,
    currency: selectedCurrency,
    theme: selectedTheme,
  })

  const DeleteAccount = useMutation(api.users.deleteAccount)
  const onDeleteAccount = async () => {
    setPending(true)
    setError("")

    try {
      await DeleteAccount({ method: "deleteAccount" })
      signOut()
    } catch (err) {
      setError("Failed to delete account. Please try again.")
      console.error(err)
    } finally {
      setPending(false)
    }
  }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof UpdatePasswordSchema>>({
    resolver: zodResolver(UpdatePasswordSchema),
  })

  const {
    // register: updateRegister,
    handleSubmit: updateHandleSubmit,
    // reset: updateReset,
    // formState: { errors: updateErrors },
    setValue: updateSetValue,
  } = useForm<z.infer<typeof UpdateUserSchema>>({
    resolver: zodResolver(UpdateUserSchema),
  })
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]

    setUploading(true)

    const uploadUrl = await generateUploadUrl()
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    })

    if (!response.ok) {
      toast.error("Failed to upload profile image", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      })
      setUploading(false)
      return
    }

    const { storageId } = await response.json()

    await uploadProfileImage({ storageId })

    setUploading(false)
    toast.success("Profile image updated successfully!", {
      autoClose: 2000,
      pauseOnHover: false,
      hideProgressBar: true,
    })
  }

  const handleUpdateUserSubmit = async (
    data: z.infer<typeof UpdateUserSchema>
  ) => {
    setPending(true)
    setIsSaving(true)
    setError("")

    if (!user || !user.email) {
      throw new Error("No user found")
    }
    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        name: data.name,
        organizationName: data.organizationName ?? "",
      })
      // console.log("formData", formData)
      setPending(false)
      setIsSaving(false)
      toast.success("User updated!", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      })
      reset()
    } catch (err: unknown) {
      // Type assertion: Explicitly check if it's a ConvexError
      if (err instanceof ConvexError) {
        toast.error(err.data || "An unexpected error occurred.", {
          autoClose: 2000,
          pauseOnHover: false,
          hideProgressBar: true,
        })
      }
    } finally {
      setPending(false)
      setIsSaving(false)

      setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
    }
  }

  const handleUpdateUserPrefs = useCallback(
    async (data: z.infer<typeof UpdateUserPrefsSchema>) => {
      setPending(true)
      setError("")

      if (!user || !user.email) {
        throw new Error("No user found")
      }
      try {
        await updateUserPrefs({
          currency: data.currency ?? "",
          timezone: data.timezone ?? "",
          language: data.language ?? "",
          theme: data.theme ?? "",
        })

        setPending(false)
        setSuccess("User updated!")
        reset()
      } catch (err: unknown) {
        if (err instanceof ConvexError) {
          setError(err.data || "An unexpected error occurred.")
        } else if (err instanceof Error) {
          setError(err.message || "An unexpected error occurred.")
        } else {
          setError("An unknown error occurred.")
        }
      } finally {
        setPending(false)
        setTimeout(() => {
          setSuccess("")
          setError("")
        }, 5000)
      }
    },
    [user, updateUserPrefs, reset] // Dependencies: Only re-create function if these change
  )

  const handleUpdatePasswordSubmit = async (
    data: z.infer<typeof UpdatePasswordSchema>
  ) => {
    setPending(true)
    setError("")

    if (!user || !user.email) {
      throw new Error("No user found")
    }
    try {
      await updatePassword({
        email: user.email,
        password: data.newPassword,
        currentPassword: data.oldPassword,
        userId: user.userId,
        method: "userUpdate",
      })
      // console.log("formData", formData)
      setPending(false)
      setSuccess("Password reset!")

      reset()
    } catch (err: unknown) {
      // Type assertion: Explicitly check if it's a ConvexError
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.")
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.")
      } else {
        setError("An unknown error occurred.")
      }
    } finally {
      setPending(false)

      setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
    }
  }

  const handleDeleteSessions = async () => {
    try {
      if (!user) {
        throw new Error("User not found")
      }
      await deleteSessions({ userId: user?.userId })
      // await invalidateSessions({ userId: user?.userId })
      setSuccess("Sessions deleted!")
      signOut()
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.")
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.")
      } else {
        setError("An unknown error occurred.")
      }
    } finally {
      setPending(false)
    }
  }

  useEffect(() => {
    if (userPrefs) {
      setTimezone(userPrefs.timezone ?? "GMT")
      setCurrency(userPrefs.currency ?? "USD")
      setThemePref(userPrefs.theme ?? "light")
      // setTheme(userPrefs.theme ?? "light")
    }
  }, [userPrefs])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "")
      setLastName(user.lastName ?? "")
      setEmail(user.email ?? "")
      setName(user.name ?? "")

      updateSetValue("firstName", user.firstName ?? "")
      updateSetValue("lastName", user.lastName ?? "")
      updateSetValue("email", user.email ?? "")
      updateSetValue("name", user.name ?? "")
    }
  }, [user, updateSetValue])

  useEffect(() => {
    const handler = setTimeout(() => {
      const hasChanged =
        prevPrefs.current.timezone !== selectedTimezone ||
        prevPrefs.current.currency !== selectedCurrency ||
        prevPrefs.current.theme !== selectedTheme

      if (hasChanged) {
        handleUpdateUserPrefs({
          currency: selectedCurrency,
          timezone: selectedTimezone,
          theme: selectedTheme,
        })

        prevPrefs.current = {
          timezone: selectedTimezone,
          currency: selectedCurrency,
          theme: selectedTheme,
        }
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [selectedTheme, selectedTimezone, selectedCurrency, handleUpdateUserPrefs])

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-semibold tracking-tight'>Settings</h1>
        <p className='mt-2 text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue='account' className='space-y-6'>
        <TabsList className='max-w-full scrollable invis  bg-white/80 w-full  justify-around md:w-auto md:justify-start h-12'>
          <TabsTrigger value='account' className='h-9 px-4'>
            Account
          </TabsTrigger>
          {/* <TabsTrigger value='notifications'>
            Notifications
          </TabsTrigger> */}
          {/*          //NOTE: in order to disabled, just add "disabled" to the tabs trigger
           */}
          <TabsTrigger value='appearance' className='h-10 px-4'>
            Appearance
          </TabsTrigger>
          <TabsTrigger value='security' className='h-10 px-4'>
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value='account'>
          <div className='space-y-6'>
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center gap-6'>
                  <Avatar className='h-20 w-20'>
                    <AvatarImage
                      src={user?.image || "/avatars/default.jpg"}
                      alt='User'
                    />
                    <AvatarFallback>
                      <FaUserNinja />
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col items-center'>
                    {/* Hidden File Input */}
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      className='hidden'
                      id='file-upload'
                    />

                    <label
                      htmlFor='file-upload'
                      className='cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-100 hover:text-gray-900 transition'>
                      {uploading ? (
                        <div className='flex flex-row items-center gap-2'>
                          <LoaderPinwheel className='h-4 w-4 animate-spin' />
                          Uploading...
                        </div>
                      ) : (
                        <div className='flex flex-row items-center gap-2'>
                          <Upload className='h-4 w-4' />
                          Change Avatar
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <Separator />
                <form onSubmit={updateHandleSubmit(handleUpdateUserSubmit)}>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstName'>First Name</Label>
                      <Input
                        disabled={pending}
                        id='firstName'
                        placeholder='Your first name/given name'
                        defaultValue={firstName ?? ""}
                        onChange={(e) => {
                          setFirstName(e.target.value)
                          updateSetValue("firstName", e.target.value)
                        }}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='lastName'>Last Name</Label>
                      <Input
                        disabled={pending}
                        id='lastName'
                        placeholder='Your last name/family name'
                        defaultValue={lastName ?? ""}
                        onChange={(e) => {
                          setLastName(e.target.value)
                          updateSetValue("lastName", e.target.value)
                        }}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>
                        Email{" "}
                        <i className='font-light text-xs'>
                          (update to send new verification email when updated)
                        </i>
                      </Label>
                      <Input
                        disabled={pending}
                        id='email'
                        type='email'
                        // readOnly
                        placeholder='Your email'
                        defaultValue={email ?? ""}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          updateSetValue("email", e.target.value)
                        }}
                      />
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-start gap-x-2 items-center'>
                        <Label htmlFor='name'>Artist Name/Preferred Name</Label>
                        <p className='text-sm font-light italic'>(Optional)</p>
                      </div>
                      <Input
                        id='name'
                        placeholder='Artist Name/Preferred Name'
                        defaultValue={name ?? ""}
                        onChange={(e) => {
                          updateSetValue("name", e.target.value)
                          setName(e.target.value)
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    disabled={isSaving}
                    type='submit'
                    variant='salWithShadow'
                    className='mt-4  w-full sm:w-auto'>
                    {isSaving ? (
                      <span className='flex items-center gap-2'>
                        <LoaderPinwheel className='h-4 w-4 animate-spin' />
                        Saving...
                      </span>
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

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* <div className='flex items-center justify-between'>
                 //TODO: Add language selection in the future 
                   <div className='space-y-0.5'>
                    <Label>Language</Label>
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
                      <SelectItem value='es'>Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />*/}
                <div className='flex  flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between '>
                  <div className='space-y-0.5'>
                    <Label>Timezone</Label>
                    <p className='text-sm text-muted-foreground'>
                      Set your local timezone
                    </p>
                  </div>
                  {/* <Select defaultValue='est'>
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
                  </Select> */}

                  <SearchMappedSelect<Timezone>
                    value={selectedTimezone ?? "GMT"}
                    onChange={setTimezone}
                    // className='w-full sm:w-[280px]'
                    data={timezones[0]}
                    getItemLabel={(timezone) =>
                      `${timezone.gmtAbbreviation}  - ${timezone.name} (${
                        timezone.abbreviation
                      }${
                        timezone.dstAbbreviation
                          ? `/${timezone.dstAbbreviation}`
                          : ""
                      })`
                    }
                    searchFields={[
                      "name",
                      "region",
                      "abbreviation",
                      "gmtOffset",
                      "gmtAbbreviation",
                    ]}
                    getItemDisplay={(timezone) =>
                      `(${
                        timezone.region !== "North America"
                          ? timezone.gmtAbbreviation
                          : timezone.abbreviation
                      })  - ${timezone.name}`
                    }
                    getItemValue={(timezone) => timezone.abbreviation}
                  />
                </div>
                <Separator />
                <div className='flex  flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between '>
                  <div className='space-y-0.5'>
                    <Label>Currency</Label>
                    <p className='text-sm text-muted-foreground'>
                      Set your preferred currency
                    </p>
                  </div>
                  {/* <Select defaultValue='est'>
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
                  </Select> */}

                  <SearchMappedSelect<Currency>
                    className='sm:w-[120px]'
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='notifications'>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Bell className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className='text-sm text-muted-foreground'>
                        Receive push notifications
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Mail className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className='text-sm text-muted-foreground'>
                        Receive email updates
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Globe className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className='text-sm text-muted-foreground'>
                        Receive marketing emails
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='appearance'>
          <Card>
            <CardHeader>
              <CardTitle>Appearance </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                {/* <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Moon className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <Label>Dark Mode</Label>
                      <p className='text-sm text-muted-foreground'>
                        Toggle dark mode <i>(coming soon)</i>
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked disabled />
                </div> */}
                <Separator />
                <div className='flex flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between '>
                  <div className='flex items-center gap-4'>
                    <Palette className='h-5 w-5 text-muted-foreground' />
                    <div>
                      {/* 
                      TODO: Add theme (just use useTheme() hook and set the theme to whatever they choose + add it to their preferences to load on startup on any new devices) */}
                      <Label>Theme Color</Label>
                      <p className='text-sm text-muted-foreground'>
                        Choose your theme color
                      </p>
                    </div>
                  </div>
                  <Select
                    defaultValue={userPrefs?.theme ?? theme}
                    onValueChange={(value) => {
                      setThemePref(value)
                      setTheme(value)
                    }}>
                    <SelectTrigger className='w-full sm:w-[180px]'>
                      <SelectValue placeholder='Select color' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='default'>
                        Default (SAL Yellow)
                      </SelectItem>
                      <SelectItem value='light'>Light</SelectItem>
                      <SelectItem value='dark'>Dark</SelectItem>
                      {/* <SelectItem value='green'>Green</SelectItem>
                      <SelectItem value='orange'>Orange</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  {/* <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <Lock className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <Label>Two-Factor Authentication</Label>
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
                  <div className='flex flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between px-4'>
                    <div className='flex items-center gap-4 '>
                      <Shield className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <Label>Password</Label>
                        <p className='text-sm text-muted-foreground'>
                          Change your password
                        </p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          className='min-w-[150px] w-full sm:w-auto'>
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[425px]'>
                        <DialogHeader>
                          <DialogTitle>Edit profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save when
                            you&apos;re done.
                          </DialogDescription>
                          {success && <FormSuccess message={success} />}
                          {error && <FormError message={error} />}
                        </DialogHeader>

                        <form
                          onSubmit={handleSubmit(handleUpdatePasswordSubmit)}
                          className='space-y-2'>
                          <div className='space-y-1'>
                            <Label htmlFor='current' className='text-right'>
                              Current password
                            </Label>
                            <div className='relative'>
                              <Input
                                id='current'
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder={
                                  !showCurrentPassword
                                    ? "********"
                                    : "Old Password"
                                }
                                {...register("oldPassword", {
                                  required: true,
                                })}
                              />
                              <button
                                type='button'
                                onClick={() =>
                                  setShowCurrentPassword((prev) => !prev)
                                }
                                className='absolute inset-y-0 right-0 flex items-center pr-3'>
                                {showCurrentPassword ? (
                                  <Eye className='size-4 text-foreground' />
                                ) : (
                                  <EyeOff className='size-4 text-foreground' />
                                )}
                              </button>
                            </div>
                            {errors.oldPassword && (
                              <p className='text-destructive text-sm'>
                                {errors.oldPassword.message}
                              </p>
                            )}
                          </div>
                          <div className='space-y-1'>
                            <Label htmlFor='new' className='text-right'>
                              New password
                            </Label>
                            <div className='relative'>
                              <Input
                                id='new'
                                type={showNewPassword ? "text" : "password"}
                                placeholder={
                                  !showNewPassword ? "********" : "New Password"
                                }
                                {...register("newPassword", {
                                  required: true,
                                })}
                              />
                              <button
                                type='button'
                                onClick={() =>
                                  setShowNewPassword((prev) => !prev)
                                }
                                className='absolute inset-y-0 right-0 flex items-center pr-3'>
                                {showNewPassword ? (
                                  <Eye className='size-4 text-foreground' />
                                ) : (
                                  <EyeOff className='size-4 text-foreground' />
                                )}
                              </button>
                            </div>
                            {errors.newPassword && (
                              <p className='text-destructive text-sm'>
                                {errors.newPassword.message}
                              </p>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              className='w-full mt-3'
                              variant='salWithShadow'
                              type='submit'>
                              Update Password
                            </Button>
                          </DialogFooter>
                        </form>
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
                <div className='space-y-4'>
                  <div className='flex flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between px-4'>
                    <p className='font-medium'>Current Session</p>
                    <div>
                      {/* <p className='text-sm text-muted-foreground'>
                        Last active: Just now
                      </p> */}
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      className='text-destructive min-w-[150px]  w-full sm:w-auto'
                      onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                  <Separator />
                  <div className='flex flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between px-4'>
                    <div>
                      <p className='font-medium'>Other Sessions</p>
                      <p className='text-sm text-muted-foreground'>
                        {sessionCount ?? 0} active session
                        {sessionCount && sessionCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-destructive min-w-[150px]  w-full sm:w-auto'>
                          Sign Out All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='w-[80dvw] bg-salYellow text-foreground'>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-foreground'>
                            Sign out all sessions?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className='text-foreground'>
                          Are you sure you want to sign out of all your
                          sessions? You&apos;ll need to re-login on all devices.
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
                  <div className=' flex flex-col items-start justify-start gap-y-2 md:items-center md:flex-row md:gap-y-0 md:justify-between  bg-destructive/10 p-4 rounded-lg'>
                    <div>
                      <p className='font-medium'>Delete Account</p>
                      <p className='text-sm text-muted-foreground'>
                        Permanently delete your account — any active
                        subscriptions need to be canceled before this is
                        possible
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type='button'
                          variant='destructive'
                          className=' min-w-[150px]  w-full sm:w-auto'>
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='w-[80dvw] bg-salYellow text-foreground'>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-foreground'>
                            Sign out all sessions?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className='text-foreground'>
                          Are you sure you want to delete your account? Any
                          active subscriptions need to be canceled before this
                          is possible and all data will be permanently deleted.
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
  )
}
