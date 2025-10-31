import type { ExtrasType } from "@/schemas/admin";
import type { User } from "@/types/user";
import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { extrasSchema } from "@/schemas/admin";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";

import { LoaderCircle, Trash } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { StaffUserSelector } from "@/components/ui/admin/userSelector";
import { Button } from "@/components/ui/button";
import { DateTimePickerField } from "@/components/ui/date-picker/day-picker";
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
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePreloadedQuery } from "convex/react";

const onlineEventLocationOptions = [
  { value: "google meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "discord", label: "Discord" },
];

type OnlineEventDialogProps = {
  children: ReactNode;
  eventId?: Id<"onlineEvents">;
  type?: "edit" | "create";
};

// const eventData: {
//     _id: Id<"onlineEvents">;
//     _creationTime: number;
//     updatedAt?: number | undefined;
//     img?: string | undefined;
//     updatedBy?: Id<"users"> | undefined;
//     organizer: Id<"users">;
//     name: string;
//     location: string;
//     slug: string;
//     requirements: string[];
//     description: string;
//     regDeadline: number;
//     startDate: number;
//     endDate: number;
//     price: number;
//     capacity: {
//         max: number;
//         current: number;
//     };
//     terms: string[];
// } | null | undefined

export const OnlineEventDialog = ({
  eventId,
  children,
  type = "edit",
}: OnlineEventDialogProps) => {
  const { preloadedUserData } = useConvexPreload();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [showAllReqs, setShowAllReqs] = useState(true);
  const [showAllTerms, setShowAllTerms] = useState(true);

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
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const isAdmin = user?.role?.includes("admin") ?? false;

  const { img, name, organizer } = eventData ?? {};

  // console.log(eventData, eventId);
  const defaultValues = {
    name: "",
    img: "",
    description: "",
    location: "",
    startDate: Date.now(),
    endDate: Date.now(),
    regDeadline: Date.now(),
    price: 15,
    capacity: {
      max: 20,
      current: 0,
    },
    organizer: user?._id ?? "",
    terms: [],
    requirements: [],
  };

  const form = useForm<ExtrasType>({
    resolver: zodResolver(extrasSchema),
    defaultValues,
    mode: "onChange",
    delayError: 1000,
  });
  const organizerData = useQuery(
    api.users.getUserById,
    organizer ? { id: organizer } : "skip",
  );
  const [currentUser, setCurrentUser] = useState<User | null>(
    organizerData ?? null,
  );
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isDirty },
  } = form;

  const formData = watch();
  const formReqs = formData.requirements;
  const formTerms = formData.terms;

  const startDateVal = formData.startDate;
  const regDeadlineVal = formData.regDeadline;
  // const result = extrasSchema.safeParse(formData);
  // console.log(result);
  // console.log(formData);
  const handleUpdate = async (data: ExtrasType) => {
    try {
      if (!user) throw new Error("User not found");
      setPending(true);
      const newTab = window.open("about:blank");

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
        await createEvent({
          ...data,
          organizer: (data.organizer ?? user._id) as Id<"users">,
          capacity: {
            ...data.capacity,
            current: data.capacity.current ?? 0,
          },
        });
      }

      if (!newTab) {
        toast.error("Failed to open new tab");
        return;
      }
      const slug = slugify(data.name, { lower: true, strict: true });
      const url = `/extras/${slug}`;
      newTab.document.write(
        getExternalRedirectHtml(url, 2, `the ${data.name} Event`),
      );
      newTab.document.close();
      newTab.location.href = url;
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

  useEffect(() => {
    if (organizer) return;
    if (currentUser && currentUser._id !== organizer) {
      setValue("organizer", currentUser._id);
    }
  }, [currentUser, setValue, organizer]);

  useEffect(() => {
    if (eventData) {
      form.reset({
        ...eventData,
        requirements: eventData.requirements ?? [],
        terms: eventData.terms ?? [],
      });
    }
  }, [eventData, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "scrollable mini darkbar max-h-[95dvh] max-w-[95dvw] bg-dashboardBgLt sm:max-h-[90dvh] sm:max-w-[max(50dvw,50rem)]",
        )}
      >
        <DialogDescription className="sr-only">
          Online event edit/create dialog
        </DialogDescription>
        <DialogHeader>
          <div
            className={cn("flex items-center justify-between gap-4 pl-2 pr-6")}
          >
            <DialogTitle>
              {img ? (
                <Image
                  src={img}
                  alt={name ?? "Event Image"}
                  width={200}
                  height={100}
                />
              ) : (
                <p className="my-3 text-center font-tanker text-4xl lowercase tracking-wide md:text-[3rem]">
                  {name}
                </p>
              )}
            </DialogTitle>
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
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleUpdate)}
            className="items-start gap-4 sm:grid sm:grid-cols-[repeat(12,_minmax(0,1fr))] [@media(max-height:768px)]:space-y-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-6 w-full">
                  <FormLabel className="font-bold">Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
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
                  <FormLabel className="font-bold">Reg Deadline</FormLabel>
                  <FormControl>
                    <DateTimePickerField
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
                    {/* <Input
                      {...field}
                      placeholder="Start Date"
                      className="w-full "
                    /> */}
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
                      options={onlineEventLocationOptions}
                      value={field.value}
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
                      formInputPreview
                      inputPreviewContainerClassName="rounded-lg border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="img"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Image</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Image URL"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

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
              {/* <div className="space-y-2">
                {formReqs
                  ?.slice(0, showAllReqs ? formReqs.length || 1 : 1)

                  .map((req, i) => {
                    const isFirst = i === 0;
                    return (
                      <div key={i} className={cn("flex w-full gap-y-1")}>
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...formReqs];
                            newReqs[i] = e.target.value;
                            setValue("requirements", newReqs);
                          }}
                          className={cn("w-full")}
                        />
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
                    );
                  })}
                {formReqs?.[formReqs.length - 1]?.trim() && showAllReqs && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setValue("requirements", [...formReqs, ""])}
                  >
                    + Add Requirement
                  </Button>
                )}
              </div> */}
              <div className="space-y-2">
                {(formReqs.length === 0 ? [""] : formReqs)
                  .slice(0, showAllReqs ? formReqs.length || 1 : 1)
                  .map((req, i) => {
                    const isFirst = i === 0;
                    return (
                      <div key={i} className="flex w-full gap-y-1">
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [
                              ...(formReqs.length === 0 ? [""] : formReqs),
                            ];
                            newReqs[i] = e.target.value;
                            setValue("requirements", newReqs);
                          }}
                          className="w-full"
                        />
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
                    );
                  })}

                {((formReqs?.[formReqs.length - 1]?.trim() && showAllReqs) ||
                  (formReqs.length === 1 && formReqs[0]?.trim())) && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setValue("requirements", [...formReqs, ""])}
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
              {/* <div className="space-y-2">
                {formTerms
                  ?.slice(0, showAllTerms ? formTerms.length || 1 : 1)

                  .map((req, i) => {
                    const isFirst = i === 0;
                    return (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...formTerms];
                            newReqs[i] = e.target.value;
                            setValue("terms", newReqs);
                          }}
                        />
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
                    );
                  })}
                {formTerms?.[formTerms.length - 1]?.trim() && showAllTerms && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setValue("terms", [...formTerms, ""])}
                  >
                    + Add Term
                  </Button>
                )}
              </div> */}
              <div className="space-y-2">
                {(formTerms.length === 0 ? [""] : formTerms)
                  .slice(0, showAllTerms ? formTerms.length || 1 : 1)
                  .map((req, i) => {
                    const isFirst = i === 0;
                    return (
                      <div key={i} className="flex w-full gap-y-1">
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [
                              ...(formTerms.length === 0 ? [""] : formTerms),
                            ];
                            newReqs[i] = e.target.value;
                            setValue("terms", newReqs);
                          }}
                          className="w-full"
                        />
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
                    );
                  })}

                {((formTerms?.[formTerms.length - 1]?.trim() && showAllTerms) ||
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

            <div
              className={cn(
                "col-span-full mt-4 flex w-full flex-col-reverse items-center justify-between gap-2 px-3 sm:mt-2 sm:flex-row",
              )}
            >
              <p
                className={cn("text-sm", !eventData?.updatedAt && "invisible")}
              >
                Last Edited:{" "}
                {eventData?.updatedAt
                  ? new Date(eventData.updatedAt).toLocaleString()
                  : ""}
              </p>

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
            </div>
          </form>
        </Form>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
