import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  eventDetailsSchema,
  eventOnlySchema,
  eventSubmitSchema,
  eventWithOCSchema,
  orgDetailsSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";

import { MultiSelect } from "@/components/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDatePicker } from "@/components/ui/form-date-pickers";
import { FormLinksInput } from "@/components/ui/form-links-inputs";
import { Input } from "@/components/ui/input";
import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EventNameSearch } from "@/features/events/components/event-search";
import SubmissionFormOrgStep from "@/features/events/submission-form/steps/submission-form-org-step";
import { toSeason, toYearMonth } from "@/lib/dateFns";
import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import { handleFileUrl } from "@/lib/fileUploadFns";
import { cn } from "@/lib/utils";
import { EnrichedEvent, EventCategory, EventType } from "@/types/event";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useAction, useMutation } from "convex/react";
import { debounce, merge } from "lodash";
import { Path } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";

const steps = [
  {
    id: 1,
    label: "Organization Info",
    mobileLabel: "Organization Info",

    schema: step1Schema,
  },
  {
    id: 2,
    label: "Event, Project, Fund, etc",
    mobileLabel: "Event, Project, Fund, etc",
    schema: eventOnlySchema,
  },
  {
    id: 3,
    label: "Event/Project Details (Continued)",
    mobileLabel: "Event/Project Details",
    schema: eventDetailsSchema,
  },
  {
    id: 4,
    label: "Open Call",
    mobileLabel: "Open Call",
  },
  {
    id: 5,
    label: "Budget & Compensation",
    mobileLabel: "Budget/Compensation",
  },
  {
    id: 6,
    label: "Organizer Details",
    mobileLabel: "Organizer Details",
    schema: orgDetailsSchema,
  },
  {
    id: 7,
    label: "Recap",
    mobileLabel: "Recap",
    schema: eventSubmitSchema,
  },
];

const options: { value: EventType; label: string }[] = [
  { value: "gjm", label: "Graffiti Jam" },
  { value: "mur", label: "Mural Festival" },
  { value: "saf", label: "Street Art Festival" },
  { value: "pup", label: "Sticker/Paste Up" },
  { value: "mus", label: "At music festival" },
  { value: "oth", label: "Other" },
];

interface EventOCFormProps {
  user: User | undefined;
  onClick: () => void;
  shouldClose: boolean;
  setShouldClose: React.Dispatch<React.SetStateAction<boolean>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export type EventOCFormValues = z.infer<typeof eventWithOCSchema>;

export const EventOCForm = ({
  user,
  onClick,
  shouldClose,
  setOpen,
  setShouldClose,
  // hasUnsavedChanges,
  setHasUnsavedChanges,
  activeStep,
  setActiveStep,
}: EventOCFormProps) => {
  const currentStep = steps[activeStep];
  const schema = currentStep.schema;
  const isAdmin = user?.role?.includes("admin") || false;
  const form = useForm<z.infer<typeof eventWithOCSchema>>({
    resolver: zodResolver(eventWithOCSchema),
    defaultValues: {
      organization: {
        name: "",
        logo: "",
        location: undefined,
      },
      event: {
        name: "",
      },
      // orgLogo: undefined,
      // eventName: "",
    },
    mode: "onChange",
  });

  const {
    // register,
    control,
    watch,
    setValue,
    getValues,
    setError,
    // trigger,
    // setValue,
    handleSubmit,
    formState: {
      // isValid,
      dirtyFields,
      // isDirty,
      errors,
    },
    reset,
  } = form;
  const currentValues = getValues();
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const createNewOrg = useMutation(api.organizer.organizations.createNewOrg);
  const createOrUpdateEvent = useMutation(api.events.event.createOrUpdateEvent);
  const updateEventLastEditedAt = useMutation(
    api.events.event.updateEventLastEditedAt,
  );
  const updateOrg = useMutation(api.organizer.organizations.updateOrganization);
  const generateUploadUrl = useMutation(api.uploads.user.generateUploadUrl);
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const [isMobile, setIsMobile] = useState(false);
  const [furthestStep, setFurthestStep] = useState(0);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [existingOrg, setExistingOrg] = useState<Doc<"organizations"> | null>(
    null,
  );
  const [newOrgEvent, setNewOrgEvent] = useState(true);
  const [existingEvent, setExistingEvent] = useState<EnrichedEvent | null>(
    null,
  );

  // const [openCall, setOpenCall] = useState<Doc<"openCalls"> | null>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, boolean>>({});
  const isSelectedRowEmpty =
    selectedRow && Object.keys(selectedRow).length === 0;
  const [skipped, setSkipped] = useState<Set<number>>(new Set([3, 4]));

  const [lastSaved, setLastSaved] = useState(
    existingEvent ? existingEvent.lastEditedAt : null,
  );
  const [pending, setPending] = useState(false);
  const [scrollTrigger, setScrollTrigger] = useState(false);

  const hasExistingOrg =
    typeof existingOrg === "object" && existingOrg !== null;

  const lastSavedDate = lastSaved
    ? new Date(Math.floor(lastSaved)).toLocaleString()
    : null;

  const eventLastEditedAt =
    (existingEvent && existingEvent?.lastEditedAt) || null;

  const watchedValues = useWatch({ control });
  const currentSchema = steps[activeStep]?.schema;

  const isStepValidZod = useMemo(() => {
    if (!currentSchema) return true;
    const result = currentSchema.safeParse(watchedValues);
    return result.success;
  }, [watchedValues, currentSchema]);

  //
  //
  // ------------- Step 1 - Organization & Event --------------
  //
  //
  const prevErrorJson = useRef<string>("");
  const lastChangedRef = useRef<number | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const canCheckSchema = useRef(false);
  const canClearEventData = useRef(true);
  const hasClosed = useRef(false);
  const isFirstRun = useRef(true);
  const savedState = useRef(false);
  const orgData = watch("organization");
  const eventData = watch("event");
  const hasEventId = !!eventData?._id;
  const openCallData = watch("openCall");
  // const eventDatesWatch = watch("event.dates");
  const firstTimeOnStep = furthestStep <= activeStep;
  const orgName = orgData?.name ?? "";
  const hasOpenCall = eventData?.hasOpenCall ?? "";
  const hasOC = eventData?.hasOpenCall === "true";
  const eventName = eventData?.name;
  const eventLogo = eventData?.logo;

  const clearEventDataTrigger =
    (newOrgEvent &&
      activeStep === 0 &&
      eventData &&
      canClearEventData.current) ||
    (isSelectedRowEmpty && hasEventId && activeStep === 0);

  const orgNameValid = !errors.organization?.name && Boolean(orgName?.trim());
  const orgLocationValid =
    !errors.organization?.location?.country && Boolean(orgData?.location?.full);
  const orgLogoValid = !errors.organization?.logo && Boolean(orgData?.logo);
  const orgDataValid = orgNameValid && orgLocationValid && orgLogoValid;

  const {
    data: orgEventsData,
    // isPending: orgEventsPending, //use this later for some loading state for the events table. Use skeleton loaders
    // isSuccess: orgEventsSuccess,
  } = useQueryWithStatus(
    api.events.event.getEventByOrgId,
    existingOrg ? { orgId: existingOrg?._id } : "skip",
  );
  const eventsData = orgEventsData ?? [];
  // const orgHasNoEvents =
  //   orgEventsSuccess && eventsData?.length === 0 && !!existingOrg;
  const eventChoiceMade = !!(existingEvent || newOrgEvent || !existingOrg);

  const category = eventData?.category as EventCategory;
  const categoryEvent = category === "event";

  const typeEvent =
    ((eventData?.type && eventData?.type?.length > 0) ||
      (existingEvent && existingEvent?.type?.length > 0)) &&
    categoryEvent;

  const canNameEvent =
    (categoryEvent && typeEvent) || (category && !categoryEvent);

  // Then use it like:
  const { isSuccess: orgValidationSuccess, isError: orgValidationError } =
    useQueryWithStatus(
      api.organizer.organizations.isOwnerOrIsNewOrg,
      orgName.trim().length >= 3 ? { organizationName: orgName } : "skip",
    );
  const { isSuccess: eventNameValid, isError: eventNameExistsError } =
    useQueryWithStatus(
      api.events.event.checkEventNameExists,
      eventName && eventName.trim().length >= 3
        ? {
            name: eventName,
            organizationId: existingOrg?._id,
            eventId: existingEvent?._id,
          }
        : "skip",
    );

  const { data: ocData, isSuccess: openCallSuccess } = useQueryWithStatus(
    api.openCalls.openCall.getOpenCallByEventId,
    existingEvent ? { eventId: existingEvent._id } : "skip",
  );

  const hasUserEditedStep0 =
    JSON.stringify(dirtyFields?.organization ?? {}).includes("true") &&
    activeStep === 0;
  const hasUserEditedStep5 =
    JSON.stringify(dirtyFields?.organization ?? {}).includes("true") &&
    activeStep === 5;
  const hasUserEditedEventSteps = JSON.stringify(
    dirtyFields?.event ?? {},
  ).includes("true");
  const hasUserEditedForm = !!(
    hasUserEditedEventSteps ||
    hasUserEditedStep0 ||
    hasUserEditedStep5
  );
  const prevOrgRef = useRef(existingOrg);
  const prevEventRef = useRef(existingEvent);

  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;
  const isValid = validOrgWZod && isStepValidZod && eventChoiceMade;

  const hasErrors = !!errors && Object.keys(errors).length > 0;
  const eventNameIsDirty = dirtyFields.event?.name ?? false;
  const hasEventLocation =
    (dirtyFields.event?.location || eventData?.location?.full !== undefined) &&
    eventNameValid;
  const eventDates = eventData?.dates?.eventDates;

  const eventDatesFormat = eventData?.dates?.eventFormat;
  const hasNoEventDates = eventDates?.length === 0 || !eventDates;
  const hasEventFormat = !!eventData?.dates?.eventFormat;
  const eventDateFormatRequired = !!(
    hasEventFormat &&
    eventDatesFormat &&
    ["setDates", "monthRange", "yearRange", "seasonRange"].includes(
      eventDatesFormat,
    )
  );
  const eventDateFormatNotRequired = !!(
    hasEventFormat &&
    eventDatesFormat &&
    ["noEvent"].includes(eventDatesFormat)
  );
  const blankEventDates =
    eventDates?.[0]?.start === "" || eventDates?.[0]?.end === "";
  const isOngoing = eventData?.dates?.eventFormat === "ongoing";
  const prodDatesStart = eventData?.dates?.prodDates?.[0]?.start;
  const noProdStart =
    eventData?.dates?.noProdStart ||
    (existingEvent?.dates?.prodDates?.[0]?.start === "" &&
      existingEvent?.dates?.prodDates?.[0]?.end !== "") ||
    false;

  //

  //
  // ------------- Console Logs --------------

  if (errors && Object.keys(errors).length > 0) {
    console.log(errors);
  }

  //
  //
  //
  // -------------Used Function --------------
  const onCancel = () => {
    setActiveStep(0);
  };

  const onSubmit = async (data: EventOCFormValues, paid: boolean) => {
    console.log(paid);
    console.log("data", data);
    try {
      // console.log("organizer mode)");
      setValue("event.state", "submitted");
      await handleSave(true);
      toast.success(
        hasOC
          ? "Successfully updated profile! Forwarding to Stripe..."
          : "Successfully submitted event!",
        {
          onClick: () => toast.dismiss(), // dismisses the current toast
        },
      );

      if (paid) {
        setTimeout(() => {
          onClick();
          // onClick()
        }, 2000);
      } else {
        //TODO: Make some sort of confirmation page and/or forward the user to... dashboard? The list? Their event (?)
        // handleReset();
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    }
  };
  // TODO: Convert timezone on deadline to user timezone on submit to ensure that displayed time is correct.
  // use convertOpenCallDatesToUserTimezone()
  const handleNextStep = async () => {
    const isStepValid = handleCheckSchema();
    if (!isStepValid) return;
    if (hasUserEditedForm) {
      await handleSave();
    }
    handleFirstStep();
    if (activeStep === 2 && hasOpenCall === "false") {
      setActiveStep((prev) => prev + 3);
      setValue("event.state", "draft");
    } else {
      setActiveStep((prev) => prev + 1);
    }
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  const handleBackStep = async () => {
    const isStepValid = handleCheckSchema(false);
    if (!isStepValid) {
      setShowBackConfirm(true);
      return;
    }
    if (hasUserEditedForm) {
      await handleSave();
    }
    proceedBackStep();
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  const proceedBackStep = () => {
    if (activeStep === 4 && hasOpenCall === "false") {
      setActiveStep((prev) => prev - 3);
    } else if (activeStep === 5 && hasOpenCall === "false") {
      setActiveStep((prev) => prev - 3);
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleFirstStep = () => {
    if (activeStep === 0 && !hasUserEditedStep0 && furthestStep === 0) {
      const eventLinks = existingEvent?.links
        ? existingEvent.links
        : existingOrg?.links
          ? { ...existingOrg.links, sameAsOrganizer: true }
          : { sameAsOrganizer: false };

      const locationFromEvent = existingEvent?.location?.full
        ? existingEvent?.location?.sameAsOrganizer
          ? {
              ...currentValues.organization?.location,
              sameAsOrganizer: true,
            }
          : {
              ...existingEvent.location,
            }
        : {
            ...currentValues.organization?.location,
            sameAsOrganizer: true,
          };

      if (existingEvent) {
        reset(
          merge({}, currentValues, {
            event: {
              // ...existingEvent,
              ...currentValues.event,
              location: locationFromEvent,
              links: {
                ...eventLinks,
              },

              // hasOpenCall: currentValues.event?.hasOpenCall || "",
            },
          }),
        );
      } else {
        reset({
          ...currentValues,
          event: {
            name: "",
            logo: currentValues.organization.logo,
            logoStorageId: currentValues.organization.logoStorageId,
            location: {
              ...currentValues.organization.location,
              sameAsOrganizer: true,
            },
            dates: {
              edition: new Date().getFullYear(),
              // eventFormat: undefined,
              // prodFormat: undefined,
              // eventDates: [{ start: "", end: "" }],
              // prodDates: [{ start: "", end: "" }],
              noProdStart: false,
            },
            links: {
              ...eventLinks,
            },
            hasOpenCall: "false",
          },
        });
        console.log("waffles");
        console.log(currentValues, eventData);
      }
      canClearEventData.current = true;
    }
  };

  const handleCheckSchema = useCallback(
    (shouldToast: boolean = true): boolean => {
      if (!schema) return true;
      if (!hasUserEditedForm) return true;

      const result = schema.safeParse(currentValues);

      if (!result.success) {
        const issues = result.error.issues;

        issues.forEach((issue) => {
          const path = issue.path.join(".") as Path<EventOCFormValues>;
          setError(path, { type: "manual", message: issue.message });
        });

        // Prefer first user-meaningful message
        const firstMessage =
          issues.find(
            (i) =>
              i.message &&
              i.message !== "Required" &&
              i.message !== "Invalid input",
          )?.message ?? issues[0]?.message;

        setErrorMsg(firstMessage || "Please fix errors before continuing.");

        if (shouldToast) {
          toast.dismiss("form-validation-error");
          toast.error("Please fix errors before continuing.", {
            toastId: "form-validation-error",
          });
        }

        return false;
      }

      setErrorMsg("");
      return true;
    },
    [schema, currentValues, hasUserEditedForm, setError],
  );

  const handleSave = useCallback(
    async (direct = false) => {
      if (pending) return;
      if (direct) {
        const isStepValid = handleCheckSchema();
        if (!isStepValid) {
          toast.error("Please fix errors before continuing.", {
            toastId: "form-validation-error",
          });
          return;
        }
      }
      let orgResult = null;

      if (hasUserEditedStep0) {
        console.log("user edited step 0");
        const result = await handleFileUrl({
          data: orgData,
          generateUploadUrl,
          getTimezone,
        });
        if (!result) {
          toast.error("Failed to upload logo", {
            autoClose: 2000,
            pauseOnHover: false,
            hideProgressBar: true,
          });
          return;
        }
        const { logoUrl, logoStorageId, timezone, timezoneOffset } = result;

        try {
          setPending(true);
          const { org } = await createNewOrg({
            organizationName: orgData.name,
            logoStorageId,
            logo: logoUrl,
            location: {
              full: orgData.location.full,
              locale: orgData.location.locale,
              city: orgData.location.city,
              state: orgData.location.state,
              stateAbbr: orgData.location.stateAbbr,
              region: orgData.location.region,
              country: orgData.location.country,
              countryAbbr: orgData.location.countryAbbr,
              continent: orgData.location?.continent || "",
              coordinates: {
                latitude: orgData.location.coordinates?.latitude || 0,
                longitude: orgData.location.coordinates?.longitude || 0,
              },
              currency: {
                code: orgData.location?.currency?.code || "",
                name: orgData.location?.currency?.name || "",
                symbol: orgData.location?.currency?.symbol || "",
              },
              demonym: orgData.location.demonym,
              timezone: timezone,
              timezoneOffset: timezoneOffset,
            },
          });
          orgResult = org;
          setPending(false);
          // toast.success(
          //   existingOrg
          //     ? "Organization updated!"
          //     : "Organization created! Going to step 2...",
          //   {},
          // );

          // Updating existingOrg state with new values
          //TODO: Check if this is still needed as I'm already taking the resulting organization and updating the form's organization state.
          if (existingOrg) {
            setExistingOrg({
              ...existingOrg,
              logo: typeof orgData.logo === "string" ? orgData.logo : logoUrl,
              location: {
                ...existingOrg.location,
                ...orgData.location,
                continent: orgData.location?.continent ?? "",
                timezone,
                timezoneOffset,
              },
            });
          }
        } catch (error) {
          console.error("Failed to create new organization:", error);
          toast.error("Failed to create new organization");
          setPending(false);
        }

        const orgLogoFullUrl = orgResult?.logo ?? "/1.jpg";
        const eventFullUrl = eventData?.logo ?? "/1.jpg";

        if (existingEvent) {
          // console.log("existing event");
          const locationFromEvent = existingEvent.location?.full
            ? existingEvent.location?.sameAsOrganizer
              ? {
                  ...currentValues.organization?.location,
                  sameAsOrganizer: true,
                }
              : {
                  ...existingEvent.location,
                }
            : {
                ...currentValues.organization?.location,
                sameAsOrganizer: true,
              };
          reset({
            organization: {
              ...orgResult,
            },
            event: {
              ...existingEvent,
              logo: eventFullUrl,
              logoStorageId: existingEvent?.logoStorageId ?? logoStorageId,
              links: {
                ...existingEvent.links,
                sameAsOrganizer: true,
              },
              // category: existingEvent.category,
              // type: existingEvent.type ?? [],
              location: locationFromEvent,
              dates: {
                ...existingEvent.dates,
              },
            },
          });
        } else {
          reset({
            organization: {
              ...orgResult,
            },
            event: {
              name: "",
              logo: orgLogoFullUrl || eventFullUrl,
              logoStorageId,
              links: {
                sameAsOrganizer: true,
              },
              location: {
                ...(orgResult?.location ||
                  currentValues.organization?.location),
                sameAsOrganizer: true,
              },
            },
          });
        }
      }
      // await handleFormValues();
      if (activeStep === 1 && hasUserEditedEventSteps) {
        let result = {
          logoUrl: eventData?.logo as string,
          logoStorageId: eventData?.logoStorageId as Id<"_storage"> | undefined,
          timezone: existingEvent?.location?.timezone,
          timezoneOffset: existingEvent?.location?.timezoneOffset,
        };

        const needsUpload =
          (eventData?.logo && typeof eventData.logo !== "string") ||
          !eventData?.logoStorageId;

        if (needsUpload) {
          console.log("needs upload");
          const uploadResult = await handleFileUrl({
            data: eventData,
            generateUploadUrl,
            getTimezone,
          });

          if (!uploadResult) {
            toast.error("Failed to upload logo", {
              autoClose: 2000,
              pauseOnHover: false,
              hideProgressBar: true,
            });
            return;
          }
          result = uploadResult;
          console.log(result);
        }
        console.log("doesnt need upload");
        const { logoUrl, logoStorageId, timezone, timezoneOffset } = result;
        console.log(logoUrl, logoStorageId, timezone, timezoneOffset);
        let eventResult = null;
        let eventLogo = "1.jpg";

        if (typeof logoUrl === "string") {
          eventLogo = logoUrl;
        }

        try {
          setPending(true);
          const prodDates =
            eventData.dates.prodFormat === "sameAsEvent"
              ? eventData.dates.eventDates
              : eventData.dates.prodDates;
          const { event } = await createOrUpdateEvent({
            _id: eventData._id || "",
            name: eventData.name,
            slug: slugify(eventData.name, { lower: true }),
            logoStorageId,
            logo: eventLogo,
            type: eventData.type || [],
            category: eventData.category,
            dates: {
              edition: eventData.dates.edition,
              eventDates: eventData.dates.eventDates,
              eventFormat: eventData.dates.eventFormat,
              prodDates,
              prodFormat: eventData.dates.prodFormat,
              noProdStart: eventData.dates.noProdStart,
            },
            location: {
              ...eventData.location,
              timezone: timezone,
              timezoneOffset: timezoneOffset,
            },
            about: eventData.about,
            links: eventData.links,
            otherInfo: eventData.otherInfo || undefined,
            active: eventData.active,
            orgId: orgData._id as Id<"organizations">,
          });

          eventResult = event;

          setExistingEvent(eventResult);

          reset(
            merge({}, currentValues, {
              event,
            }),
          );
          setPending(false);
        } catch (error) {
          console.error("Failed to create new event:", error);
          toast.error("Failed to create new event");
          setPending(false);
        }
      }
      if (activeStep === 2 && hasUserEditedEventSteps) {
        let eventResult = null;

        try {
          setPending(true);

          const { event } = await createOrUpdateEvent({
            _id: eventData._id || "",
            name: eventData.name,
            slug: slugify(eventData.name, { lower: true }),

            logo: eventData.logo as string | "1.jpg",
            type: eventData.type || [],
            category: eventData.category,
            dates: {
              ...eventData.dates,
            },
            location: {
              ...eventData.location,
            },
            about: eventData.about,
            links: eventData.links,
            otherInfo: eventData.otherInfo || undefined,
            active: eventData.active,
            orgId: orgData._id as Id<"organizations">,
          });

          eventResult = event;

          setExistingEvent(eventResult);

          reset(
            merge({}, currentValues, {
              event: {
                ...eventData,
              },
            }),
          );

          setPending(false);
        } catch (error) {
          console.error("Failed to create new event:", error);
          toast.error("Failed to create new event");
          setPending(false);
        }
      }
      if (activeStep === steps.length - 2) {
        console.log("saving org details");

        try {
          setPending(true);
          console.log("orgData presave", orgData);

          const result = await updateOrg({
            orgId: orgData._id as Id<"organizations">,
            name: orgData.name,
            slug: slugify(orgData.name, { lower: true }),
            logo: orgData.logo as string,
            location: {
              ...orgData.location,
            },
            contact: {
              organizer: orgData.contact?.organizer,
              primaryContact: orgData.contact?.primaryContact || "",
            },
            about: orgData.about,
            links: orgData.links,
          });

          if (!result) {
            toast.error("Failed to update organization");
            setPending(false);
            return;
          }
          let lastEditedResult = null;
          if (existingEvent?._id) {
            lastEditedResult = await updateEventLastEditedAt({
              eventId: existingEvent._id,
            });
          }
          if (lastEditedResult) {
            const lastEditedAt = lastEditedResult.lastEditedAt;
            setLastSaved(lastEditedAt);
            if (existingEvent) {
              setExistingEvent({
                ...existingEvent,
                lastEditedAt,
              });
            }
          }

          reset({
            ...currentValues,
            organization: {
              ...result.org,
            },
          });

          console.log("result", result);

          setPending(false);
        } catch (error) {
          console.error("Failed to submit event:", error);
          toast.error("Failed to submit event");
          setPending(false);
        }
      }
      if (activeStep === steps.length - 1) {
        console.log("saving final step");
        let eventResult = null;

        try {
          setPending(true);

          const { event } = await createOrUpdateEvent({
            _id: eventData._id || "",
            name: eventData.name,
            slug: slugify(eventData.name, { lower: true }),
            logo: eventData.logo as string,
            type: eventData.type || [],
            category: eventData.category,
            dates: {
              ...eventData.dates,
            },
            location: {
              ...eventData.location,
            },
            about: eventData.about,
            links: eventData.links,
            otherInfo: eventData.otherInfo || undefined,
            active: eventData.active,

            finalStep: true,
            orgId: orgData._id as Id<"organizations">,
          });
          eventResult = event;
          setExistingEvent(eventResult);

          setPending(false);
        } catch (error) {
          console.error("Failed to submit event:", error);
          toast.error("Failed to submit event");
          setPending(false);
        }
      }
    },
    [
      hasUserEditedStep0,
      orgData,
      generateUploadUrl,
      getTimezone,
      createNewOrg,
      existingOrg,
      reset,
      activeStep,
      hasUserEditedEventSteps,
      eventData,
      updateOrg,
      updateEventLastEditedAt,
      createOrUpdateEvent,
      existingEvent,
      currentValues,
      setExistingEvent,
      handleCheckSchema,
      pending,
    ],
  );

  const handleReset = () => {
    setActiveStep(0);
    setFurthestStep(0);
    setSelectedRow({ 0: false });
    setExistingOrg(null);
    prevOrgRef.current = null;
    isFirstRun.current = true;
    setExistingEvent(null);
    setNewOrgEvent(true);
    reset({
      organization: {
        name: "",
        logo: undefined,
        location: undefined,
      },
      event: undefined,
    });
    // setValue("organization.name", "");
  };

  const updateLastChanged = useMemo(
    () =>
      debounce(() => {
        lastChangedRef.current = Date.now();
      }, 500),
    [],
  );

  // -------------UseEffects --------------
  useEffect(() => {
    if (hasUserEditedForm) {
      updateLastChanged();
    }
  }, [watchedValues, updateLastChanged, hasUserEditedForm]);

  useEffect(() => {
    console.log(orgData);
  }, [orgData]);
  useEffect(() => {
    console.log("eventLogo", eventLogo);
    console.log("eventName", eventName);
  }, [eventLogo, eventName]);

  useEffect(() => {
    console.log("form valid:", isValid, "step valid:", isStepValidZod);
  }, [isValid, isStepValidZod]);

  useEffect(() => {
    if (dirtyFields) {
      console.log(dirtyFields);
    }
  }, [dirtyFields]);

  useEffect(() => {
    if (scrollTrigger) {
      console.log("scrolling");
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
        setScrollTrigger(false);
      }
    }
  }, [scrollTrigger]);

  useEffect(() => {
    if (!firstTimeOnStep || bottomRef.current === null) return;
    if (canNameEvent && activeStep === 1 && !existingEvent) {
      setScrollTrigger(true);
    }
  }, [scrollTrigger, canNameEvent, activeStep, firstTimeOnStep, existingEvent]);

  // useEffect(() => {
  //   if (!schema || !hasUserEditedForm) return;
  //   const serialized = JSON.stringify(errors);

  //   // Only run handleCheckSchema if error content has changed
  //   if (serialized !== prevErrorJson.current) {
  //     prevErrorJson.current = serialized;
  //     canCheckSchema.current = true;
  //   }
  // }, [schema, hasUserEditedForm, errors]);

  useEffect(() => {
    if (!schema || !hasUserEditedForm) return;

    const debouncedCheck = debounce(() => {
      const serialized = JSON.stringify(errors);
      console.log("errors changed", serialized);
      if (serialized !== prevErrorJson.current) {
        console.log("error changed");
        prevErrorJson.current = serialized;
        canCheckSchema.current = true;
      }
    }, 300);

    debouncedCheck();

    return () => {
      debouncedCheck.cancel();
    };
  }, [errors, schema, hasUserEditedForm]);

  useEffect(() => {
    if (!canCheckSchema.current) {
      if (isStepValidZod) {
        canCheckSchema.current = true;
        setErrorMsg("");
      }
      return;
    }

    if (!isStepValidZod && hasUserEditedForm) {
      // console.log("step invalid");
      handleCheckSchema(false);
      canCheckSchema.current = false;
    } else if (isStepValidZod && hasUserEditedForm) {
      // console.log("step valid");
      canCheckSchema.current = false;
      setErrorMsg("");
    }
  }, [isStepValidZod, hasUserEditedForm, handleCheckSchema]);

  useEffect(() => {
    if (!isValid || !hasUserEditedForm || pending) return;
    const interval = setInterval(() => {
      // console.log("checking");
      const now = Date.now();

      const last =
        typeof lastSaved === "number"
          ? lastSaved
          : new Date(lastSaved ?? 0).getTime();
      const lastChanged = lastChangedRef.current ?? 0;
      const shouldSave = now - last >= 60000 && now - lastChanged >= 15000;
      console.log(now, last);

      if (shouldSave) {
        handleSave().then(() => {
          console.log("Autosaved at", new Date().toLocaleTimeString());
          setPending(false);
        });
      }
    }, 5000); // check every 5 seconds (adjustable)

    return () => clearInterval(interval);
  }, [isValid, lastSaved, hasUserEditedForm, pending, handleSave]);

  useEffect(() => {
    console.log("active step: ", activeStep);
  }, [activeStep]);

  useEffect(() => {
    if (orgData?.name !== undefined && orgData?.name !== "") {
      console.log("orgData", getValues("organization"));
      // console.log("org", existingOrg);
    }
  }, [orgData, existingOrg, getValues]);

  useEffect(() => {
    console.log("existingOrg", existingOrg);
  }, [existingOrg]);

  useEffect(() => {
    console.log("eventData", eventData);
    // console.log("existingEvent", existingEvent);
  }, [eventData, existingEvent]);

  useEffect(() => {
    console.log("oc", openCallData);
  }, [openCallData]);

  useEffect(() => {
    if (!existingOrg) return;
    if (existingOrg?._id === prevOrgRef.current?._id) return;
    const orgReady =
      existingOrg &&
      typeof existingOrg._id === "string" &&
      existingOrg._id.length > 0;
    console.log("existingOrg", existingOrg);

    const orgChanged = orgReady && existingOrg._id !== prevOrgRef.current?._id;

    if (orgChanged) {
      console.log("resetting");
      reset({
        organization: {
          ...existingOrg,
        },
        event: {
          name: "",
        },
      });
      prevOrgRef.current = existingOrg;
    } else {
      setLastSaved(null);
    }
  }, [existingOrg, reset, getValues]);

  useEffect(() => {
    const eventReady =
      existingEvent &&
      typeof existingEvent._id === "string" &&
      existingEvent._id.length > 0;
    if (!eventReady && !existingEvent && prevEventRef.current !== null) {
      prevEventRef.current = null;
    }
    const eventChanged =
      eventReady && existingEvent._id !== prevEventRef.current?._id;
    if (eventChanged) {
      isFirstRun.current = true;
      if (existingEvent?.lastEditedAt) {
        setLastSaved(existingEvent.lastEditedAt);
      } else if (existingEvent?._creationTime) {
        setLastSaved(existingEvent._creationTime);
      }
      console.log("resetting event");
      reset({
        ...currentValues,
        event: {
          ...existingEvent,
        },
      });
      prevEventRef.current = existingEvent;
      canClearEventData.current = true;
    } else if (!existingEvent) {
      setLastSaved(null);
    }
  }, [existingEvent, reset, currentValues]);

  useEffect(() => {
    if (savedState.current === false && eventLastEditedAt) {
      setLastSaved(eventLastEditedAt);
      savedState.current = true;
      return;
    }
    if (!eventLastEditedAt) {
      setLastSaved(null);
      savedState.current = false;
      return;
    }
    if (eventLastEditedAt !== lastSaved) {
      setLastSaved(eventLastEditedAt);
    }
  }, [eventLastEditedAt, lastSaved]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    setIsMobile(mediaQuery.matches);

    let timeoutId: NodeJS.Timeout;
    const handleChange = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(e.matches), 150);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      clearTimeout(timeoutId);
    };
  }, []);

  // useEffect(() => {
  //   if (orgHasNoEvents && activeStep === 0) {
  //     setNewOrgEvent(true);
  //   }
  // }, [orgHasNoEvents, activeStep]);

  useEffect(() => {
    setFurthestStep((prev) => Math.max(prev, activeStep));
  }, [activeStep, furthestStep]);

  useEffect(() => {
    if (newOrgEvent) return;
    if (!newOrgEvent && isSelectedRowEmpty) {
      setSelectedRow({ 0: true });
    }
  }, [newOrgEvent, isSelectedRowEmpty]);

  useEffect(() => {
    if (selectedRow && Object.keys(selectedRow).length > 0) {
      canClearEventData.current = true;
    } else if (isSelectedRowEmpty) {
      console.log("empty row");
      // canClearEventData.current = false;
      setNewOrgEvent(true);
    }
    console.log(isSelectedRowEmpty);
    console.log("selected row", selectedRow);
  }, [selectedRow, isSelectedRowEmpty]);

  useEffect(() => {
    if (clearEventDataTrigger) {
      console.log("hmm");
      setFurthestStep(0);
      setSelectedRow({});
      console.log("clearing event data", eventData);
      reset({
        organization: {
          ...existingOrg,
          logo: existingOrg?.logo || "/1.jpg",
        },

        event: {
          name: "",
          logo: existingOrg?.logo || "/1.jpg",
          location: {
            ...(existingOrg?.location ?? {}),
            sameAsOrganizer: true,
          },
        },
      });
      canClearEventData.current = false;
    }
  }, [clearEventDataTrigger, reset, existingOrg, eventData]);

  useEffect(() => {
    if (!eventDatesFormat) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (!hasNoEventDates) return;
    }

    const otherFormats = [
      "noEvent",
      "setDates",
      "monthRange",
      "yearRange",
      "seasonRange",
    ];

    if (!eventDatesFormat) return;
    // if (!hasNoEventDatesEdition) return;

    if (
      eventDatesFormat === "noEvent" ||
      eventDatesFormat === "setDates" ||
      eventDatesFormat === "ongoing"
    ) {
      setValue("event.dates.eventDates", [{ start: "", end: "" }]);
    }

    if (eventDatesFormat === "yearRange") {
      setValue("event.dates.eventDates", [
        {
          start: new Date().getFullYear().toString(),
          end: "",
        },
      ]);
    }

    if (eventDatesFormat === "seasonRange") {
      setValue("event.dates.eventDates", [
        {
          start: toSeason(new Date()),
          end: "",
        },
      ]);
    }

    if (eventDatesFormat === "monthRange") {
      setValue("event.dates.eventDates", [
        {
          start: toYearMonth(new Date()),
          end: "",
        },
      ]);
    }
    if (otherFormats.includes(eventDatesFormat)) {
      setValue("event.dates.edition", new Date().getFullYear());
    }
  }, [eventDatesFormat, setValue, hasNoEventDates]);

  useEffect(() => {
    if (hasUserEditedForm && !hasErrors) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [setHasUnsavedChanges, hasUserEditedForm, hasErrors]);

  useEffect(() => {
    if (!orgData?.name && activeStep > 0) {
      setActiveStep(0);
    }
  }, [orgData, activeStep, setActiveStep]);

  // 1. Create a stable callback that saves and then closes:
  const saveAndClose = useCallback(async () => {
    await handleSave(true);
    setShouldClose(false);
    setOpen(false);
  }, [handleSave, setOpen, setShouldClose]);

  // 2. Fire it only when shouldClose goes true:
  useEffect(() => {
    if (shouldClose && !hasClosed.current) {
      hasClosed.current = true;
      saveAndClose();
    } else if (!shouldClose) {
      hasClosed.current = false;
    }
  }, [shouldClose, saveAndClose]);

  useEffect(() => {
    if (hasOpenCall === "false") {
      setSkipped(new Set([3, 4]));
      //TODO: add check on whether or not it's a free open call. If so, don't add the extra steps? Or... ? nevermind. Think about me.
    } else if (hasOpenCall === "true") {
      setSkipped(new Set());
    }
  }, [hasOpenCall]);

  useEffect(() => {
    if (!openCallSuccess) return;
    if (ocData) {
      setValue("event.hasOpenCall", "true");
      setValue("openCall", ocData);
    } else if (!ocData) {
      setValue("event.hasOpenCall", "false");
    }
  }, [openCallSuccess, ocData, setValue, reset]);

  useEffect(() => {
    const prodStart = getValues("event.dates.prodDates.0.start");
    if (!noProdStart || !prodStart) return;
    if (noProdStart && prodStart) {
      setValue("event.dates.noProdStart", false);
    }
  }, [prodDatesStart, noProdStart, setValue, getValues]);

  return (
    <>
      <HorizontalLinearStepper
        errorMsg={errorMsg}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNextStep={handleNextStep}
        onBackStep={handleBackStep}
        steps={steps}
        skipped={skipped}
        className="px-2 xl:px-8"
        finalLabel="Submit"
        onFinalSubmit={handleSubmit((data) => onSubmit(data, hasOC))}
        isDirty={hasUserEditedForm}
        onSave={() => handleSave(true)}
        lastSaved={lastSavedDate}
        disabled={!isValid || pending}
        pending={pending}
        cancelButton={
          <DialogClose asChild>
            <Button
              type="button"
              variant="salWithShadowHiddenYlw"
              className="hidden lg:min-w-24"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </DialogClose>
        }
      >
        <div ref={topRef} />
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit((data) => onSubmit(data, hasOC))}
            className="flex h-full min-h-96 grow flex-col p-4 xl:mx-auto xl:max-w-[1500px] 3xl:max-w-[2000px]"
          >
            {activeStep === 0 && (
              <SubmissionFormOrgStep
                existingOrg={existingOrg}
                existingEvent={existingEvent}
                eventsData={eventsData}
                existingOrgs={hasExistingOrg}
                validOrgWZod={validOrgWZod}
                invalidOrgWZod={invalidOrgWZod}
                setExistingOrg={setExistingOrg}
                setExistingEvent={setExistingEvent}
                handleReset={handleReset}
                orgValidationError={orgValidationError}
                orgNameValid={orgNameValid}
                orgLocationValid={orgLocationValid}
                orgDataValid={orgDataValid}
                newOrgEvent={newOrgEvent}
                setNewOrgEvent={setNewOrgEvent}
                setSelectedRow={setSelectedRow}
                selectedRow={selectedRow}
                furthestStep={furthestStep}
              />
            )}
            {activeStep === 1 && (
              <div
                id="step-1-container"
                className={cn(
                  "flex h-full flex-col gap-4 xl:justify-center",
                  "mx-auto max-w-max",
                  "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[45%_10%_45%] xl:gap-0",
                )}
              >
                <div
                  className={cn(
                    "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
                    "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                    "lg:pb-10 xl:py-10 4xl:my-auto",

                    // "xl:self-center",
                  )}
                >
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
                    <p className="lg:text-xs">Category</p>
                  </div>

                  <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label htmlFor="event.category" className="sr-only">
                      Event Category
                    </Label>
                    <Controller
                      name="event.category"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            onValueChange={(value: EventCategory) => {
                              field.onChange(value);
                            }}
                            value={field.value || ""}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-12 w-full border text-center text-base sm:h-[50px]",
                                errors.event?.category && "invalid-field",
                              )}
                            >
                              <SelectValue placeholder="Event/Project Category (select one)" />
                            </SelectTrigger>
                            <SelectContent className="min-w-auto">
                              <SelectItem fit value="event">
                                Event
                              </SelectItem>
                              <SelectItem fit value="project">
                                Project
                              </SelectItem>
                              <SelectItem fit value="residency">
                                Residency
                              </SelectItem>
                              <SelectItem fit value="gfund">
                                Grant/Fund
                              </SelectItem>
                              <SelectItem fit value="roster">
                                Artist Roster
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                  </div>

                  {categoryEvent && (
                    <>
                      <div className="input-section">
                        <p className="min-w-max font-bold lg:text-xl">
                          Step 2:{" "}
                        </p>
                        <p className="lg:text-xs">Event Type</p>
                      </div>

                      <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                        <Label htmlFor="event.type" className="sr-only">
                          Event Type
                        </Label>
                        <Controller
                          name="event.type"
                          control={control}
                          render={({ field }) => (
                            <MultiSelect
                              id="event.type"
                              className={cn(
                                "h-12 border sm:h-[50px]",
                                errors.event?.type && "invalid-field",
                              )}
                              badgeClassName="py-2 lg:py-2 lg:text-sm "
                              textClassName="text-base"
                              options={options}
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              defaultValue={field.value ?? []}
                              shortResults={isMobile}
                              placeholder="Select up to 2 event types"
                              variant="basic"
                              maxCount={1}
                              limit={2}
                              height={10}
                              shiftOffset={-10}
                              hasSearch={false}
                              selectAll={false}
                              tabIndex={4}
                            />
                          )}
                        />
                      </div>
                    </>
                  )}
                  {canNameEvent && (
                    <>
                      <div className="input-section">
                        <p className="min-w-max font-bold lg:text-xl">
                          Step {categoryEvent ? 3 : 2}:{" "}
                        </p>
                        <p className="lg:text-xs">
                          {getEventCategoryLabelAbbr(category)} Name
                        </p>
                      </div>

                      <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                        <Label htmlFor="event.name" className="sr-only">
                          {getEventCategoryLabelAbbr(category)} Name
                        </Label>
                        <Controller
                          name="event.name"
                          control={control}
                          render={({ field }) => (
                            <EventNameSearch
                              value={field.value}
                              isExisting={eventNameExistsError}
                              onChange={field.onChange}
                              className={cn(
                                "border !text-base sm:h-[50px]",
                                errors.event?.name &&
                                  dirtyFields.event?.name &&
                                  "invalid-field",
                              )}
                            />
                          )}
                        />
                        {eventNameExistsError && eventNameIsDirty && (
                          <span className="mt-2 w-full text-center text-sm text-red-600">
                            {category === "event"
                              ? "An event with that name already exists."
                              : `A ${getEventCategoryLabelAbbr(category)} with this name already exists.`}
                          </span>
                        )}
                      </div>
                      {eventNameValid && (
                        <>
                          <div className="input-section">
                            <p className="min-w-max font-bold lg:text-xl">
                              Step {categoryEvent ? 4 : 3}:{" "}
                            </p>
                            <p className="lg:text-xs">Location</p>
                          </div>

                          <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                            <Label htmlFor="event.name" className="sr-only">
                              {getEventCategoryLabelAbbr(category)} Location
                            </Label>

                            <Controller
                              name="event.location"
                              control={control}
                              render={({ field }) => (
                                <MapboxInputFull
                                  id="event.location"
                                  isEvent
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  reset={!validOrgWZod}
                                  tabIndex={2}
                                  placeholder="Event Location (if different from organization)..."
                                  className="mb-3 w-full lg:mb-0"
                                  inputClassName={cn(
                                    "rounded-lg border-foreground disabled:opacity-50",
                                    errors.event?.location && "invalid-field",
                                  )}
                                />
                              )}
                            />
                          </div>
                          <div className="input-section">
                            <p className="min-w-max font-bold lg:text-xl">
                              Step {categoryEvent ? 5 : 4}:{" "}
                            </p>
                            <p className="lg:text-xs">
                              {getEventCategoryLabelAbbr(category)} Logo
                            </p>
                          </div>
                          <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                            <Label
                              htmlFor="organization.logo"
                              className="sr-only"
                            >
                              Event/Project Logo
                            </Label>
                            <Controller
                              name="event.logo"
                              control={control}
                              render={({ field }) => (
                                <AvatarUploader
                                  id="event.logo"
                                  onChange={(file) => field.onChange(file)}
                                  onRemove={() =>
                                    field.onChange(orgData?.logo ?? "1.jpg")
                                  }
                                  reset={!validOrgWZod}
                                  disabled={!orgNameValid}
                                  initialImage={
                                    typeof field.value === "string"
                                      ? field.value
                                      : undefined
                                  }
                                  size={72}
                                  tabIndex={3}
                                  className={cn("pb-3")}
                                />
                              )}
                            />
                          </div>
                          {canNameEvent && (
                            <>
                              <div className="input-section h-full">
                                <p className="min-w-max font-bold lg:text-xl">
                                  Step {categoryEvent ? 6 : 5}:{" "}
                                </p>
                                <p className="lg:text-xs">
                                  {getEventCategoryLabelAbbr(category)}{" "}
                                  Details/Notes
                                </p>
                              </div>

                              <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                                <Label htmlFor="event.name" className="sr-only">
                                  {getEventCategoryLabelAbbr(category)} About
                                </Label>
                                <Controller
                                  name="event.about"
                                  control={control}
                                  render={({ field }) => (
                                    <RichTextEditor
                                      value={field.value ?? ""}
                                      onChange={field.onChange}
                                      placeholder="Short blurb about your project/event... (limit 200 characters)"
                                      charLimit={200}
                                    />
                                  )}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
                {hasEventLocation && (
                  <>
                    <Separator
                      thickness={2}
                      className="mx-auto hidden xl:block"
                      orientation="vertical"
                    />
                    <div
                      className={cn(
                        "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
                        "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                        "lg:pt-10 xl:py-10 4xl:my-auto",
                        // "xl:self-center",
                      )}
                    >
                      <div className="input-section">
                        <p className="min-w-max font-bold lg:text-xl">
                          Step {categoryEvent ? 7 : 6}:{" "}
                        </p>
                        <p className="lg:text-xs">
                          {getEventCategoryLabelAbbr(category)} Dates
                        </p>
                      </div>

                      <FormDatePicker
                        isAdmin={isAdmin}
                        title="Event Dates Format"
                        nameBase="event.dates"
                        type="event"
                        watchPath="event"
                      />

                      {!isOngoing &&
                        hasEventFormat &&
                        (!blankEventDates || eventDateFormatNotRequired) && (
                          <>
                            <div className="input-section">
                              <p className="min-w-max font-bold lg:text-xl">
                                Step {categoryEvent ? 8 : 7}:{" "}
                              </p>
                              <p className="lg:text-xs">Production Dates</p>
                            </div>

                            <FormDatePicker
                              isAdmin={isAdmin}
                              title="Production Dates Format"
                              nameBase="event.dates"
                              type="production"
                              watchPath="event"
                            />
                            <div />
                            <label
                              className={cn(
                                "mx-auto flex cursor-pointer items-center gap-2 py-2",
                              )}
                            >
                              <Controller
                                name="event.dates.noProdStart"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <Checkbox
                                      disabled={
                                        isOngoing ||
                                        !hasEventFormat ||
                                        (blankEventDates &&
                                          eventDateFormatRequired)
                                      }
                                      tabIndex={4}
                                      id="noProdStart"
                                      className="focus-visible:bg-salPink/50 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-salPink focus-visible:ring-offset-1 focus-visible:data-[selected=true]:bg-salPink/50"
                                      checked={field.value || false}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        if (checked) {
                                          setValue("event.dates.prodDates", [
                                            {
                                              start: "",
                                              end: currentValues.event.dates
                                                ?.prodDates
                                                ? currentValues.event.dates
                                                    .prodDates[0]?.end
                                                : "",
                                            },
                                          ]);
                                        }
                                        // if (blankProdStart) {
                                        //   setNoProdStart(true);
                                        // } else if (hasProdDateAndFormat) {
                                        //   setNoProdStart(false);
                                        // }
                                      }}
                                    />
                                  );
                                }}
                              />

                              <span className={cn("text-sm")}>
                                The beginning production date is flexible/open
                              </span>
                            </label>
                          </>
                        )}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeStep === 2 && (
              <div
                id="step-2-container"
                className={cn(
                  "flex h-full flex-col gap-4 xl:justify-center",
                  "mx-auto max-w-max",
                  "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[45%_10%_45%] xl:gap-0",
                )}
              >
                <div
                  className={cn(
                    "flex w-full grid-cols-[20%_auto] flex-col lg:grid lg:gap-x-4 lg:gap-y-4",
                    "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                    "lg:pb-10 xl:py-10 4xl:my-auto",

                    // "xl:self-center",
                  )}
                >
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step {categoryEvent ? 9 : 8}:{" "}
                    </p>
                    <p className="lg:text-xs">
                      {getEventCategoryLabelAbbr(category)} Links
                    </p>
                  </div>

                  <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label htmlFor="event.category" className="sr-only">
                      Event Links
                    </Label>

                    <FormLinksInput
                      existingOrgHasLinks={!!existingOrg?.links}
                      type="event"
                    />
                  </div>
                </div>
                {hasEventLocation && (
                  <>
                    <Separator
                      thickness={2}
                      className="mx-auto hidden xl:block"
                      orientation="vertical"
                    />

                    <div
                      className={cn(
                        "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
                        "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                        "lg:pt-10 xl:py-10 4xl:my-auto",
                        // "xl:self-center",
                      )}
                    >
                      {canNameEvent && (
                        <>
                          <div className="input-section">
                            <p className="min-w-max font-bold lg:text-xl">
                              Step {categoryEvent ? 10 : 9}:{" "}
                            </p>
                            <p className="lg:text-xs">Open Call</p>
                          </div>
                          <div className="mx-auto mb-2 flex w-full max-w-[74dvw] flex-col gap-2 sm:mb-auto lg:min-w-[300px] lg:max-w-md">
                            <Label
                              htmlFor="event.hasOpenCall"
                              className="sr-only"
                            >
                              Open Call
                            </Label>
                            <Controller
                              name="event.hasOpenCall"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // setHasOpenCall(value);
                                  }}
                                  value={field.value ?? ""}
                                >
                                  <SelectTrigger className="h-12 w-full border text-center text-base sm:h-[50px]">
                                    <SelectValue
                                      placeholder={`Does your ${getEventCategoryLabelAbbr(category).toLowerCase()} have an open call?`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent className="min-w-auto">
                                    <SelectItem fit value="true">
                                      Yes, there&apos;s an Open Call
                                    </SelectItem>
                                    <SelectItem fit value="false">
                                      No, there&apos;s not an Open Call
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div className="input-section h-full">
                            <p className="min-w-max font-bold lg:text-xl">
                              Step {categoryEvent ? 11 : 10}:{" "}
                            </p>
                            <p className="lg:text-xs">Other Info</p>
                          </div>

                          <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                            <Label htmlFor="event.name" className="sr-only">
                              {getEventCategoryLabelAbbr(category)} Other Info
                            </Label>

                            <Controller
                              name="event.otherInfo"
                              control={control}
                              render={({ field }) => (
                                <RichTextEditor
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  placeholder="Add any other info about your project/event... (limit 500 characters)"
                                  charLimit={500}
                                />
                              )}
                            />
                            <span className="w-full text-center text-xs italic text-muted-foreground">
                              (Formatting is for preview and won&apos;t exactly
                              match the public version)
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeStep === 3 && (
              <p className="gap-4 xl:grid xl:grid-cols-2 xl:gap-6">Open Call</p>
            )}
            {activeStep === 4 && (
              <p className="gap-4 xl:grid xl:grid-cols-2 xl:gap-6">Budget</p>
            )}
            {activeStep === steps.length - 2 && (
              <>
                <div
                  id="step-2-container"
                  className={cn(
                    "flex h-full flex-col gap-4 xl:justify-center",
                    "mx-auto max-w-max",
                    "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[45%_10%_45%] xl:gap-0",
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
                      "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                      "lg:pb-10 xl:py-10 4xl:my-auto",

                      // "xl:self-center",
                    )}
                  >
                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">Step 1:</p>
                      <p className="lg:text-xs">Organizer Links</p>
                    </div>

                    <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                      <Label htmlFor="event.category" className="sr-only">
                        Organizer Links
                      </Label>

                      <FormLinksInput type="organization" />

                      {errors.event?.category && eventData?.category && (
                        <span className="mt-2 w-full text-center text-sm text-red-600">
                          {errors.event?.category?.message
                            ? errors.event?.category?.message
                            : "Please select a category from the dropdown"}
                        </span>
                      )}
                    </div>
                  </div>
                  {hasEventLocation && (
                    <>
                      <Separator
                        thickness={2}
                        className="mx-auto hidden xl:block"
                        orientation="vertical"
                      />

                      <div
                        className={cn(
                          "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
                          "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                          "lg:pt-10 xl:py-10 4xl:my-auto",
                          // "xl:self-center",
                        )}
                      >
                        {canNameEvent && (
                          <>
                            <div className="input-section">
                              <p className="min-w-max font-bold lg:text-xl">
                                Step 2
                              </p>
                              <p className="lg:text-xs">Primary Contact</p>
                            </div>
                            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                              <Label
                                htmlFor="event.hasOpenCall"
                                className="sr-only"
                              >
                                Change Me //TODO: change this
                              </Label>
                              <Controller
                                name="organization.contact.organizer"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    id="event.location"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    tabIndex={2}
                                    placeholder="Name of primary contact"
                                    className="mb-3 w-full rounded-lg border-foreground disabled:opacity-50 lg:mb-0"
                                  />
                                )}
                              />
                              {errors.event?.hasOpenCall && (
                                <span className="mt-2 w-full text-center text-sm text-red-600">
                                  {errors.event?.hasOpenCall?.message}
                                </span>
                              )}
                            </div>
                            <div className="input-section h-full">
                              <p className="min-w-max font-bold lg:text-xl">
                                Step 3:
                              </p>
                              <p className="lg:text-xs">Organizer - About</p>
                            </div>

                            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                              <Label
                                htmlFor="organization.about"
                                className="sr-only"
                              >
                                Organizer - About
                              </Label>

                              <Controller
                                name="organization.about"
                                control={control}
                                render={({ field }) => (
                                  <RichTextEditor
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    placeholder="Add any info about your organization... (limit 750 characters)"
                                    charLimit={750}
                                    purpose="organizerAbout"
                                  />
                                )}
                              />
                              <span className="w-full text-center text-xs italic text-muted-foreground">
                                (Formatting is for preview and won&apos;t
                                exactly match the public version)
                              </span>

                              {(errors.event?.name || eventNameExistsError) &&
                                eventNameIsDirty && (
                                  <span className="mt-2 w-full text-center text-sm text-red-600">
                                    {errors.event?.name?.message
                                      ? errors.event?.name?.message
                                      : category === "event"
                                        ? "An event with that name already exists."
                                        : `A ${getEventCategoryLabelAbbr(category)} with this name already exists.`}
                                  </span>
                                )}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {activeStep === steps.length - 1 && (
              <>
                <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded bg-muted p-4 text-sm lg:max-w-[90dvw]">
                  {JSON.stringify(getValues(), null, 2)}
                </pre>
              </>
            )}
            {/* {activeStep === 6 && (
              <p className="gap-4 xl:grid xl:grid-cols-2 xl:gap-6">Recap</p>
            )} */}
            <div ref={bottomRef} />
          </form>
        </FormProvider>
      </HorizontalLinearStepper>
      <AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved or invalid fields</AlertDialogTitle>
            <AlertDialogDescription>
              This step contains invalid or incomplete fields. Are you sure you
              want to go back? You may lose changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowBackConfirm(false);
                proceedBackStep();
              }}
            >
              Go back anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
