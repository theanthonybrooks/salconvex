import { onlineEventLocationOptions } from "@/constants/resourcesConsts";

import type { ResourcesType } from "@/schemas/admin";
import type { User } from "@/types/user";
import type { ReactNode } from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { resourcesSchema } from "@/schemas/admin";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";

import { LoaderCircle, Trash } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { StaffUserSelector } from "@/components/ui/admin/userSelector";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePickerField } from "@/components/ui/date-picker/day-picker";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { DebouncedFormTextarea } from "@/components/ui/debounced-form-textarea";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePreloadedQuery } from "convex/react";

type OnlineEventDialogProps = {
  children: ReactNode;
  eventId?: Id<"onlineEvents">;
  type?: "edit" | "create";
};

export const OnlineEventDialog = ({
  eventId,
  children,
  type = "edit",
}: OnlineEventDialogProps) => {
  const { isMobile } = useDevice();
  const organizerRef = useRef<User | null>(null);
  const { preloadedUserData } = useConvexPreload();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [showAllReqs, setShowAllReqs] = useState(true);
  const [showAllTerms, setShowAllTerms] = useState(true);
  const [redirectOnSuccess, setRedirectOnSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [logoFile, setLogoFile] = useState<Blob | null>(null);

  const queryResult = useQuery(
    api.userAddOns.onlineEvents.getOnlineEvent,
    eventId
      ? {
          eventId,
        }
      : "skip",
  );

  const eventData = queryResult?.data;

  const updateEvent = useMutation(
    api.userAddOns.onlineEvents.updateOnlineEvent,
  );
  const createEvent = useMutation(
    api.userAddOns.onlineEvents.createOnlineEvent,
  );

  const uploadEventImage = useMutation(
    api.userAddOns.onlineEvents.uploadOnlineEventImage,
  );

  const removeEventImage = useMutation(
    api.userAddOns.onlineEvents.removeOnlineEventImage,
  );

  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const isAdmin = user?.role?.includes("admin") ?? false;

  const { imgStorageId, name } = eventData ?? {};

  // console.log(eventData, eventId);

  const defaultValues = useMemo(
    () => ({
      name: "",
      img: "",
      description: "",
      formOptions: {
        link: false,
        linkType: "",
        notes: false,
        notesDesc: "",
        notesPlaceholder: "",
      },
      location: isAdmin ? "google meet" : "",
      startDate: Date.now(),
      endDate: Date.now(),
      regDeadline: Date.now(),
      price: 15,
      capacity: {
        max: 20,
        current: 0,
      },
      organizer: type === "create" ? user?._id : "",
      organizerBio: "",
      terms: isAdmin ? ["(placeholder - term)"] : [],

      requirements: isAdmin ? ["(placeholder - requirement)"] : [],
    }),
    [user?._id, type, isAdmin],
  );

  const form = useForm<ResourcesType>({
    resolver: zodResolver(resourcesSchema),
    defaultValues,
    mode: "onChange",
    delayError: 1000,
  });

  const [currentUser, setCurrentUser] = useState<User | null>(user ?? null);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isDirty },
  } = form;

  const formData = watch();
  const { link, notes } = formData.formOptions ?? {};
  const formReqs = formData.requirements;
  const formTerms = formData.terms;
  const organizer = formData.organizer;

  const organizerData = useQuery(
    api.users.getUserById,
    organizer ? { id: organizer as Id<"users"> } : "skip",
  );

  const startDateVal = formData.startDate;
  const regDeadlineVal = formData.regDeadline;

  const handleUpdate = async (data: ResourcesType) => {
    try {
      if (!user) throw new Error("User not found");
      setPending(true);
      let newTab: Window | null = null;
      if (redirectOnSuccess) {
        newTab = window.open("about:blank");
      }
      let onlineEventId: Id<"onlineEvents"> | undefined = eventId;

      if (type === "edit" && eventId) {
        await updateEvent({
          ...data,
          eventId,
          organizer: (data.organizer ?? user._id) as Id<"users">,
          capacity: {
            ...data.capacity,
            current: data.capacity.current ?? 0,
          },
        });
      } else {
        onlineEventId = await createEvent({
          ...data,
          organizer: (data.organizer ?? user._id) as Id<"users">,
          capacity: {
            ...data.capacity,
            current: data.capacity.current ?? 0,
          },
        });
      }
      if (logoFile) {
        if (onlineEventId) {
          await handleLogoUpload(logoFile, onlineEventId);
          setLogoFile(null);
        } else {
          throw new Error("Error creating an event before uploading an image");
        }
      }

      if (redirectOnSuccess) {
        if (!newTab) {
          toast.error("Failed to open new tab");
          return;
        }
        const slug = slugify(data.name, { lower: true, strict: true });
        const url = `/resources/${slug}`;
        newTab.document.write(
          getExternalRedirectHtml(url, 2, `the ${data.name} Event`),
        );
        newTab.document.close();
        newTab.location.href = url;
      }
      form.reset({
        ...defaultValues,
      });
      setOpen(false);
    } catch (err) {
      console.error("Failed to update event:", err);
    } finally {
      setPending(false);
    }
  };

  const handleReset = () => {
    form.reset({
      ...defaultValues,
    });
    setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  const handleLogoUpload = async (
    file: Blob,
    onlineEventId: Id<"onlineEvents">,
  ) => {
    setUploading(true);

    if (!onlineEventId)
      throw new Error("Create an event before uploading an image");
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Failed to upload event image");

      const { storageId } = await response.json();

      const result = await uploadEventImage({
        storageId,
        eventId: onlineEventId,
      });
      if (result.success) {
        toast.success("Event image updated successfully!", {
          autoClose: 2000,
          pauseOnHover: false,
          hideProgressBar: true,
          closeButton: false,
        });
      } else {
        throw new Error("Failed to update event image");
      }
    } catch (err: unknown) {
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else {
        message = "An unexpected error occurred";
      }

      console.error("Upload error:", err);
      toast.error(message, {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImgRemoval = async () => {
    if (!eventData || !imgStorageId) return;

    try {
      setUploading(true);
      await removeEventImage({
        storageId: imgStorageId,
        eventId: eventData._id,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove event image", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const createType = type === "create";

    if (createType) {
      if (!currentUser) {
        setCurrentUser(user);
        return;
      } else if (currentUser._id !== organizer) {
        setValue("organizer", currentUser._id, { shouldDirty: true });
      }
    } else {
      if (!organizerData) return;
      if (!organizerRef.current) {
        organizerRef.current = organizerData;
        setCurrentUser(organizerData);
        return;
      }

      if (currentUser && currentUser !== organizerRef.current) {
        organizerRef.current = currentUser;
        setValue("organizer", currentUser._id, { shouldDirty: true });
      }
    }
  }, [type, currentUser, user, organizerData, setValue, organizer]);

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);

      setCurrentUser(null);
      setUploading(false);
      setRedirectOnSuccess(false);
      setShowAllReqs(true);
      setShowAllTerms(true);
      organizerRef.current = null;
    } else if (eventData) {
      form.reset({
        ...eventData,
        requirements: eventData.requirements ?? [],
        terms: eventData.terms ?? [],
      });
    }
  }, [open, defaultValues, form, eventData]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className={cn(
          "z-[31] max-h-[95dvh] max-w-[95dvw] overflow-hidden bg-dashboardBgLt p-0 sm:max-h-[90dvh] sm:max-w-[max(50dvw,50rem)]",
        )}
        overlayClassName="z-[30]"
        // closeBtnClassName="bg-dashboardBgLt rounded-full p-2 opacity-100 text-foreground/50"
      >
        <AlertDialogDescription className="sr-only">
          Online event edit/create dialog
        </AlertDialogDescription>
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle>{`${name ?? "Online Event"} Dialog`}</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(handleUpdate)} className="relative">
            <div
              className={cn(
                "scrollable h-[95dvh] items-start gap-4 p-6 pb-40 sm:grid sm:h-[90dvh] sm:grid-cols-[repeat(12,_minmax(0,1fr))] [@media(max-height:620px)]:space-y-2",
              )}
            >
              <div
                className={cn(
                  "col-span-full flex flex-col-reverse items-center justify-between gap-4 pl-2 pr-6 sm:flex-row",
                )}
              >
                <LogoUploader
                  imageOnly={isMobile}
                  id="logo-upload"
                  onChangeAction={(file) => {
                    setLogoFile(file);
                    setValue("img", "local-upload", {
                      shouldDirty: true,
                    });
                  }}
                  // onChangeAction={handleLogoUpload}
                  onRemoveAction={() => {
                    if (logoFile) {
                      setLogoFile(null);
                    } else {
                      setValue("img", "", { shouldDirty: true });
                      handleImgRemoval();
                      // note: removed this as it was deleting images regardless of whether or not they're used for other
                    }
                  }}
                  initialImage={eventData?.img}
                  className="gap-4"
                  imgClassName={cn("w-auto", isMobile ? "h-[125px]" : "h-25")}
                  inputClassName=" focus:bg-transparent"
                  size={isMobile ? 250 : 200}
                  height={isMobile ? 125 : 100}
                  showFullImage
                  loading={uploading}
                />

                <div className={cn("flex items-center gap-4")}>
                  <p>Organizer:</p>
                  <StaffUserSelector
                    type="staff"
                    isAdmin={isAdmin}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    className="rounded-full"
                    minimal
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-6 w-full">
                    <FormLabel className="font-bold">Name</FormLabel>
                    <FormControl>
                      <DebouncedControllerInput
                        tabIndex={1}
                        field={field}
                        placeholder="Name of event"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel className="font-bold">Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={5}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        placeholder="ex. 15"
                        className="w-full text-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity.current"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel className="font-bold">Registered</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled
                        min={0}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        placeholder="ex. 10"
                        className="w-full text-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity.max"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel className="font-bold">Max Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        placeholder="ex. 10"
                        className="w-full text-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regDeadline"
                render={({ field }) => (
                  <FormItem className="col-span-3 w-full">
                    <FormLabel className="font-bold">
                      Registration Deadline
                    </FormLabel>
                    <FormControl>
                      <DateTimePickerField
                        minDate={Date.now()}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="col-span-3 w-full">
                    <FormLabel className="font-bold">Start Date</FormLabel>
                    <FormControl>
                      <DateTimePickerField
                        value={field.value}
                        onChange={field.onChange}
                        minDate={regDeadlineVal}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="col-span-3 w-full">
                    <FormLabel className="font-bold">End Date</FormLabel>
                    <FormControl>
                      <DateTimePickerField
                        value={field.value}
                        onChange={field.onChange}
                        minDate={startDateVal}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="col-span-3 w-full">
                    <FormLabel className="font-bold">Location</FormLabel>
                    <FormControl>
                      {/* <Input
                        {...field}
                        placeholder="Location"
                        className="w-full"
                      /> */}
                      <SelectSimple
                        options={[...onlineEventLocationOptions]}
                        value={field.value ?? ""}
                        onChangeAction={(value) => field.onChange(value)}
                        placeholder="Select location"
                        className="w-full border-gray-300 bg-card sm:h-11"
                        contentClassName="sm:max-h-80 "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="font-bold">Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Full details about the event "
                        charLimit={5000}
                        requiredChars={10}
                        formInputPreview
                        inputPreviewContainerClassName="rounded-lg border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="col-span-6 mt-2 w-full">
                <div className="flex items-center justify-between">
                  <FormLabel>Requirements</FormLabel>
                  <span
                    className={cn(
                      "text-sm hover:cursor-pointer hover:font-semibold",
                      formReqs?.length <= 1 && "hidden",
                    )}
                    onClick={() => setShowAllReqs((prev) => !prev)}
                  >
                    View {showAllReqs ? "Less" : "More"}
                  </span>
                </div>
                <div className="space-y-2">
                  {(formReqs.length === 0 ? [""] : formReqs)
                    .slice(0, showAllReqs ? formReqs.length || 1 : 1)
                    .map((req, i) => {
                      const isFirst = i === 0;
                      const isEmpty = !req?.trim();

                      return (
                        <FormField
                          key={i}
                          control={form.control}
                          name={`requirements.${i}`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex w-full gap-y-1">
                                <FormControl>
                                  <DebouncedFormTextarea
                                    field={field}
                                    maxLength={300}
                                    placeholder="Enter requirement"
                                    className={cn(
                                      "max-h-15 min-h-10 w-full resize-none",
                                      isEmpty && "h-10",
                                    )}
                                    containerClassName={cn(
                                      "rounded-lg border-gray-300 bg-card",
                                    )}
                                  />
                                </FormControl>

                                {!isFirst && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      setValue(
                                        "requirements",
                                        formReqs.filter((_, j) => j !== i),
                                      )
                                    }
                                    className="hover:scale-105 hover:text-red-600 active:scale-95"
                                  >
                                    <Trash className="size-5" />
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    })}

                  {((formReqs?.[formReqs.length - 1]?.trim() && showAllReqs) ||
                    (formReqs.length === 1 && formReqs[0]?.trim())) && (
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        setValue("requirements", [...formReqs, ""])
                      }
                    >
                      + Add Requirement
                    </Button>
                  )}
                </div>
              </FormItem>
              <FormItem className="col-span-6 mt-2 w-full">
                <div className="flex items-center justify-between">
                  <FormLabel>Terms</FormLabel>
                  <span
                    className={cn(
                      "text-sm hover:cursor-pointer hover:font-semibold",
                      formTerms?.length <= 1 && "hidden",
                    )}
                    onClick={() => setShowAllTerms((prev) => !prev)}
                  >
                    View {showAllTerms ? "Less" : "More"}
                  </span>{" "}
                </div>
                <div className="space-y-2">
                  {(formTerms.length === 0 ? [""] : formTerms)
                    .slice(0, showAllTerms ? formTerms.length || 1 : 1)
                    .map((term, i) => {
                      const isFirst = i === 0;
                      const isEmpty = !term?.trim();

                      return (
                        <FormField
                          key={i}
                          control={form.control}
                          name={`terms.${i}`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex w-full gap-y-1">
                                <FormControl>
                                  <DebouncedFormTextarea
                                    field={field}
                                    maxLength={300}
                                    placeholder="Enter term"
                                    className={cn(
                                      "max-h-15 min-h-10 w-full resize-none",
                                      isEmpty && "h-10",
                                    )}
                                    containerClassName={cn(
                                      "rounded-lg border-gray-300 bg-card",
                                    )}
                                  />
                                </FormControl>

                                {!isFirst && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      setValue(
                                        "terms",
                                        formTerms.filter((_, j) => j !== i),
                                      )
                                    }
                                    className="hover:scale-105 hover:text-red-600 active:scale-95"
                                  >
                                    <Trash className="size-5" />
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    })}

                  {((formTerms?.[formTerms.length - 1]?.trim() &&
                    showAllTerms) ||
                    (formTerms.length === 1 && formTerms[0]?.trim())) && (
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setValue("terms", [...formTerms, ""])}
                    >
                      + Add Term
                    </Button>
                  )}
                </div>
              </FormItem>
              <section
                className={cn(
                  "relative col-span-full mt-2 grid w-full grid-cols-1 gap-x-6 rounded-lg border-1.5 border-dashed border-foreground/30 bg-card/40 p-3 pt-6 sm:grid-cols-[auto_1fr]",
                )}
              >
                <p className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-foreground/50 bg-card px-3 py-1 text-sm">
                  Form Options:
                </p>
                <section className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="formOptions.link"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              className="text-base"
                              tabIndex={3}
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked)
                              }
                            />
                          </FormControl>
                          <FormLabel className="font-bold hover:cursor-pointer">
                            Link
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {link && (
                      <FormField
                        control={form.control}
                        name="formOptions.linkType"
                        render={({ field }) => (
                          <FormItem className="col-start-2 flex items-center gap-2 space-y-0">
                            <FormLabel className="font-bold">+ Type:</FormLabel>
                            <FormControl>
                              <DebouncedControllerInput
                                field={field}
                                type="text"
                                className="h-8 w-30 rounded border-gray-300 bg-card"
                                debounceMs={50}
                                maxLength={40}
                                tabIndex={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="formOptions.notes"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              className="text-base"
                              tabIndex={3}
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked)
                              }
                            />
                          </FormControl>
                          <FormLabel className="font-bold hover:cursor-pointer">
                            Notes
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {notes && (
                      <FormField
                        control={form.control}
                        name="formOptions.notesDesc"
                        render={({ field }) => (
                          <FormItem className="col-start-2 flex items-center gap-2 space-y-0">
                            <FormLabel className="font-bold">
                              + Title:
                            </FormLabel>
                            <FormControl>
                              <DebouncedControllerInput
                                field={field}
                                type="text"
                                className="h-8 w-30 rounded border-gray-300 bg-card"
                                debounceMs={50}
                                maxLength={40}
                                tabIndex={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </section>
                {notes && (
                  <FormField
                    control={form.control}
                    name="formOptions.notesPlaceholder"
                    render={({ field }) => {
                      const isEmpty = field.value?.trim().length === 0;
                      return (
                        <FormItem className="">
                          <FormLabel className="font-bold">
                            Notes Placeholder
                          </FormLabel>
                          <FormControl>
                            <DebouncedFormTextarea
                              field={field}
                              maxLength={300}
                              placeholder="What would you like for the notes placeholder to say?"
                              className={cn(
                                "max-h-15 min-h-10 w-full resize-none",
                                isEmpty && "h-10",
                              )}
                              containerClassName={cn(
                                "rounded-lg border-gray-300 bg-card",
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </section>
              <FormField
                control={form.control}
                name="organizerBio"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="font-bold">Organizer Bio</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="A bit about the organizer"
                        charLimit={2500}
                        formInputPreview
                        inputPreviewContainerClassName="rounded-lg border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <AlertDialogFooter
              className={cn(
                "sticky bottom-0 z-10 col-span-full mt-4 flex w-full max-w-[calc(100%-0.75em)] flex-col-reverse items-center justify-between gap-2 bg-dashboardBgLt px-6 py-4 sm:mt-2 sm:flex-row",
              )}
            >
              <span
                className={cn(
                  "block text-sm",
                  !eventData?.updatedAt && "invisible",
                )}
              >
                <p> Last Edited:</p>
                <p className="text-nowrap">
                  {eventData?.updatedAt
                    ? new Date(eventData.updatedAt).toLocaleString(undefined, {
                        year: "2-digit",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })
                    : ""}
                </p>
              </span>

              <div className="flex w-full flex-col items-end gap-4 sm:flex-col">
                <div
                  className={cn(
                    "flex w-full items-center justify-end gap-2 sm:w-max",
                  )}
                >
                  <Button
                    disabled={pending}
                    variant={pending ? "salWithShadowHidden" : "salWithShadow"}
                    type="button"
                    onClick={handleReset}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!isValid || pending || !isDirty}
                    variant={
                      isValid && isDirty
                        ? "salWithShadowYlw"
                        : "salWithShadowHiddenYlw"
                    }
                    className="w-full sm:w-40"
                  >
                    {pending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      `Save ${type === "create" ? "Event" : "Changes"}`
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="redirect-on-success"
                    checked={redirectOnSuccess}
                    onCheckedChange={() =>
                      setRedirectOnSuccess((prev) => !prev)
                    }
                  />
                  <Label htmlFor="redirect-on-success" className="text-xs">
                    Redirect to event page after saving
                  </Label>
                </div>
              </div>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
