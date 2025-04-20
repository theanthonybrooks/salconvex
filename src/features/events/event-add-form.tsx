import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"
import {
  eventOnlySchema,
  eventWithOCSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";

import { MultiSelect } from "@/components/multi-select";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { FormDatePicker } from "@/components/ui/form-date-pickers";
import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
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
import { toSeason } from "@/lib/dateFns";
import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import { handleFileUrl } from "@/lib/fileUploadFns";
import { cn } from "@/lib/utils";
import { EventCategory, EventType } from "@/types/event";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useAction, useMutation } from "convex/react";
import { Path } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";

const steps = [
  {
    id: 1,
    label: "Organization Info",

    schema: step1Schema,
  },
  {
    id: 2,
    label: "Event, Project, Fund, etc",
    schema: eventOnlySchema,
  },
  {
    id: 3,
    label: "step 3",
  },
  {
    id: 4,
    label: "step 4",
  },
  {
    id: 5,
    label: "step 5",
  },
  {
    id: 6,
    label: "step 6",
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
        name: undefined,
        logo: undefined,
        location: undefined,
      },
      event: undefined,
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
    handleSubmit: handleSubmit,
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
  const generateUploadUrl = useMutation(api.uploads.user.generateUploadUrl);
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const [isMobile, setIsMobile] = useState(false);
  const [furthestStep, setFurthestStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [existingOrg, setExistingOrg] = useState<Doc<"organizations"> | null>(
    null,
  );
  const [newOrgEvent, setNewOrgEvent] = useState(false);
  const [existingEvent, setExistingEvent] = useState<Doc<"events"> | null>(
    null,
  );
  const [selectedRow, setSelectedRow] = useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = useState(
    existingEvent ? existingEvent.lastEditedAt : null,
  );
  const [pending, setPending] = useState(false);

  const hasExistingOrg =
    typeof existingOrg === "object" && existingOrg !== null;

  const lastSavedDate = lastSaved
    ? new Date(Math.floor(lastSaved)).toLocaleString()
    : null;

  const eventLastEditedAt =
    (existingEvent && existingEvent?.lastEditedAt) || null;

  // const watchedValues = useWatch({ control });
  // const currentSchema = steps[activeStep]?.schema;

  // const isStepValidZod = useMemo(() => {
  //   if (!currentSchema) return true;
  //   const result = currentSchema.safeParse(watchedValues);
  //   return result.success;
  // }, [watchedValues, currentSchema]);

  const isStepValidZod = true;

  //
  //
  // ------------- Step 1 - Organization & Event --------------
  //
  //
  const hasClosed = useRef(false);
  const isFirstRun = useRef(true);
  const savedState = useRef(false);
  const orgData = watch("organization");
  const orgName = orgData?.name ?? "";
  const eventData = watch("event");
  const eventName = eventData?.name ?? "";
  const clearEventDataTrigger =
    newOrgEvent && activeStep === 0 && furthestStep > 0 && eventData;

  const orgNameValid = !errors.organization?.name && Boolean(orgName?.trim());
  const orgLocationValid =
    !errors.organization?.location?.country && Boolean(orgData?.location?.full);
  const orgLogoValid = !errors.organization?.logo && Boolean(orgData?.logo);
  const orgDataValid = orgNameValid && orgLocationValid && orgLogoValid;
  // const data = useQuery(
  //   api.events.event.getEventByOrgId,
  //   existingOrg ? { orgId: existingOrg?._id } : "skip",
  // );
  const {
    data: orgEventsData,
    // isPending: orgEventsPending, //use this later for some loading state for the events table. Use skeleton loaders
    isSuccess: orgEventsSuccess,
  } = useQueryWithStatus(
    api.events.event.getEventByOrgId,
    existingOrg ? { orgId: existingOrg?._id } : "skip",
  );
  const eventsData = orgEventsData ?? [];
  const orgHasNoEvents =
    orgEventsSuccess && eventsData?.length === 0 && !!existingOrg;
  const eventChoiceMade = existingEvent || newOrgEvent || !existingOrg;

  const eventCategory = eventData?.category as EventCategory;
  const eventCategoryEvent = eventCategory === "event";

  const eventTypeEvent =
    ((eventData?.type && eventData?.type?.length > 0) ||
      (existingEvent && existingEvent?.eventType?.length > 0)) &&
    eventCategoryEvent;

  const canNameEvent =
    (eventCategoryEvent && eventTypeEvent) ||
    (eventCategory && !eventCategoryEvent);

  // Then use it like:
  const {
    // data: orgValidation,
    // status,
    // isPending,
    isSuccess: orgValidationSuccess,
    isError: orgValidationError,
    // error,
  } = useQueryWithStatus(
    api.organizer.organizations.isOwnerOrIsNewOrg,
    orgName.trim().length >= 3 ? { organizationName: orgName } : "skip",
  );
  const {
    // data: eventNameData,
    // status,
    // isPending,
    isSuccess: eventNameValid,
    isError: eventNameExistsError,
    // error,
  } = useQueryWithStatus(
    api.events.event.checkEventNameExists,
    eventName.trim().length >= 3
      ? { name: eventName, organizationId: existingOrg?._id }
      : "skip",
  );

  // const hasUserEditedStep0 =
  //   activeStep === 0 &&
  //   (orgData?.name?.trim() !== existingOrg?.name?.trim() ||
  //     orgData?.logo !== existingOrg?.logo ||
  //     orgData?.location?.full !== existingOrg?.location?.full);

  const hasUserEditedStep0 = JSON.stringify(
    dirtyFields?.organization ?? {},
  ).includes("true");
  const hasUserEditedStep1 = JSON.stringify(dirtyFields?.event ?? {}).includes(
    "true",
  );
  const hasUserEditedForm = !!(hasUserEditedStep1 || hasUserEditedStep0);
  const prevOrgRef = useRef(existingOrg);
  const prevEventRef = useRef(existingEvent);

  // const orgValidation = useQuery(
  //   api.organizer.organizations.isOwnerOrIsNewOrg,
  //   orgName.trim().length >= 3 ? { organizationName: orgName } : "skip",
  // );
  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;
  const isValid = validOrgWZod && isStepValidZod && eventChoiceMade;
  const hasErrors = !!errors && Object.keys(errors).length > 0;
  // const existingOrgUpdateTrigger =
  //   hasExistingOrg && validOrgWZod && hasUserEditedStep0;
  const eventNameIsDirty = dirtyFields.event?.name ?? false;
  const hasEventLocation =
    (dirtyFields.event?.location || eventData?.location?.full !== undefined) &&
    eventNameValid;
  const eventDates = eventData?.dates?.eventDates;
  const eventDatesFormat = eventData?.dates?.eventFormat;
  const hasNoEventDates = eventDates?.length === 0 || !eventDates;

  //

  //
  // ------------- Console Logs --------------

  // console.log(
  //   orgValidation,
  //   status,
  //   isPending,
  //   orgValidationSuccess,
  //   orgValidationError,
  //   validOrgWZod,
  //   invalidOrgWZod,

  //   // error,
  // );
  // console.log(clearEventDataTrigger);
  // console.log(validOrgWZod, isStepValidZod);
  // console.log(eventChoiceMade, newOrgEvent, orgHasNoEvents);
  // console.log("eventNameIsDirty", eventNameIsDirty);
  // console.log(hasUserEditedStep0);
  // if (activeStep === 0) {
  //   console.log("hasUserEditedStep0", hasUserEditedStep0);
  // } else if (activeStep === 1) {
  //   console.log("hasUserEditedStep1", hasUserEditedStep1);
  // }
  // console.log("hasUserEditedForm", hasUserEditedForm);

  // console.log("eventNameData", eventNameData);

  // console.log("eventNameExists", eventNameValid);
  // console.log("eventNameExistsError", eventNameExistsError);
  if (errors && Object.keys(errors).length > 0) {
    console.log(errors);
  }

  // console.log(hasUserEditedStep0);
  //
  //
  // console.log(formIsValid);
  // console.log("isValidOrg", isValidOrg);
  // console.log("isStepValid", isStepValid);
  // console.log("isValid", isValid);
  // console.log(orgNameValid, orgLocationValid);
  // console.log(newOrgEvent);
  // if (orgData.name !== undefined && orgData.name !== "") {
  //   console.log(orgData);
  //   console.log("existingOrg", existingOrg);
  // }
  // if (eventData) {
  //   console.log(eventData);
  // }
  // if (existingEvent) {
  //   console.log(existingEvent);
  // }

  // console.log(eventsData, "now");
  // console.log("orgValue", orgValue);
  // console.log("existing orgs", hasExistingOrg);
  // console.log(existingOrg?.logo);
  // console.log("is valid org", isValidOrg);
  //
  // console.log(isValid, "wZod:", validOrgWZod);

  // console.log("last saved", lastSavedDate);

  //
  //
  //
  // ------------- Function ToDos --------------
  //
  //
  //
  if (user?.accountType?.includes("rabbit")) {
    onClick();
  }

  // -------------Used Function --------------
  const onCancel = () => {
    setActiveStep(0);
  };

  const onSubmit = async (data: EventOCFormValues) => {
    //todo: insert some validation that checks for blob images (new submissions) or existing images (edits). Edits shouldn't submit anything to the db if the logo is the same. Only blobs, which I'm assuming that I would use typeof to check for.
    // if (typeof data.organization.logo === "string") {
    //   console.log("Logo is an existing image URL:", data.organization.logo);
    // } else {
    //   console.log("Logo is a new Blob upload:", data.organization.logo);
    // }

    console.log("data", data);
    try {
      // console.log("organizer mode)");
      reset();
      toast.success("Successfully updated profile! Forwarding to Stripe...", {
        onClick: () => toast.dismiss(), // dismisses the current toast
      });

      setTimeout(() => {
        // onClick()
      }, 2000);
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

    await handleSave();

    // setLoading(true);
    // handleFormValues();

    // if (activeStep === 0) {

    //   // setTimeout(() => {
    //   //   setActiveStep((prev) => prev + 1);
    //   //   setLoading(false);
    //   // }, 1000);
    //   setActiveStep((prev) => prev + 1);
    //   setLoading(false);
    // } else {
    setActiveStep((prev) => prev + 1);
    // }
  };

  const handleBackStep = async () => {
    const isStepValid = handleCheckSchema();
    if (!isStepValid) return;
    await handleSave();
    setActiveStep((prev) => prev - 1);
  };

  const handleCheckSchema = useCallback((): boolean => {
    if (!schema) return true;
    if (!hasUserEditedForm) return true;

    const result = schema.safeParse(currentValues);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as Path<EventOCFormValues>;
        setError(path, { type: "manual", message: issue.message });
        setErrorMsg(issue.message);
      });

      toast.dismiss("form-validation-error");
      toast.error("Please fix errors before continuing.", {
        toastId: "form-validation-error",
      });

      return false;
    }

    setErrorMsg("");
    return true;
  }, [schema, currentValues, hasUserEditedForm, setError]);

  const handleSave = useCallback(
    async (direct = false) => {
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
      if (activeStep === 0 && !hasUserEditedStep0) {
        const eventLinks = existingEvent?.links ?? { sameAsOrganizer: true };
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
          reset({
            ...currentValues,
            event: {
              ...existingEvent,
              category: existingEvent.eventCategory,
              type: existingEvent.eventType ?? [],
              location: locationFromEvent,
              links: {
                ...eventLinks,
              },
            },
          });
        } else {
          reset({
            ...currentValues,
            event: {
              name: "",
              logo: currentValues.organization.logo,
              location: {
                ...currentValues.organization.location,
                sameAsOrganizer: true,
              },
              dates: {
                ongoing: false,
                edition: new Date().getFullYear(),
              },
              links: {
                sameAsOrganizer: true,
              },
            },
          });
          console.log("waffles");
        }
      }
      if (hasUserEditedStep0) {
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
        const { logoUrl, logoId, timezone, timezoneOffset } = result;

        try {
          setPending(true);
          const { org } = await createNewOrg({
            organizationName: orgData.name,
            logoId,
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
        }

        const orgLogoFullUrl = orgResult?.logo ?? "/1.jpg";
        const eventFullUrl = eventData?.logo ?? "/1.jpg";
        console.log(eventFullUrl, orgLogoFullUrl);
        console.log("frogs");
        if (existingEvent) {
          console.log("existing event");
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
              links: {
                ...existingEvent.links,
                sameAsOrganizer: true,
              },
              category: existingEvent.eventCategory,
              type: existingEvent.eventType ?? [],
              location: locationFromEvent,
            },
          });
        } else {
          console.log("new event");
          reset({
            organization: {
              ...orgResult,
            },
            event: {
              name: "",
              logo: orgLogoFullUrl || eventFullUrl,
              links: {
                sameAsOrganizer: true,
              },
              location:
                orgResult?.location ?? currentValues.organization.location,
            },
          });
        }
      }
      // await handleFormValues();
      if (activeStep === 1 && hasUserEditedStep1) {
        const result = await handleFileUrl({
          data: eventData,
          generateUploadUrl,
          getTimezone,
        });

        console.log(result);

        if (!result) {
          toast.error("Failed to upload logo", {
            autoClose: 2000,
            pauseOnHover: false,
            hideProgressBar: true,
          });
          return;
        }
        const { logoUrl, logoId, timezone, timezoneOffset } = result;
        let eventResult = null;
        console.log(eventData.dates);
        try {
          setPending(true);
          const { event } = await createOrUpdateEvent({
            _id: eventData._id || "",
            name: eventData.name,
            slug: slugify(eventData.name),
            logoId,
            logo: logoUrl,
            eventType: eventData.type || [],
            eventCategory: eventData.category,
            dates: {
              edition: eventData.dates.edition,
              eventDates: eventData.dates.eventDates,
              ongoing: eventData.dates.ongoing,
              eventFormat: eventData.dates.eventFormat,
              prodDates: eventData.dates.prodDates,
              prodFormat: eventData.dates.prodFormat,
            },
            location: {
              ...eventData.location,
              timezone: timezone,
              timezoneOffset: timezoneOffset,
            },
            about: eventData.about,
            links: eventData.links,
            otherInfo: eventData.otherInfo || [],
            active: eventData.active,
            orgId: orgData._id as Id<"organizations">,
          });

          eventResult = event;

          setExistingEvent(eventResult);

          reset({
            ...currentValues,
            event: {
              ...event,
              category: event?.eventCategory || "",
              type: event?.eventType || [],
            },
          });
          setPending(false);
          // toast.success(existingEvent ? "Event updated!" : "Event created!", {
          //   onClick: () => toast.dismiss(), // dismisses the current toast
          // });
        } catch (error) {
          console.error("Failed to create new event:", error);
          toast.error("Failed to create new event");
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
      hasUserEditedStep1,
      eventData,
      createOrUpdateEvent,
      existingEvent,
      currentValues,
      setExistingEvent,
      handleCheckSchema,
    ],
  );

  const handleReset = () => {
    setActiveStep(0);
    setFurthestStep(0);
    setSelectedRow({ 0: false });
    setExistingOrg(null);
    prevOrgRef.current = null;
    setExistingEvent(null);
    setNewOrgEvent(false);
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

  // -------------UseEffects --------------

  useEffect(() => {
    if (orgData?.name !== undefined && orgData?.name !== "") {
      console.log(getValues("organization"));
      console.log(existingOrg);
    }
  }, [orgData, existingOrg, getValues]);

  useEffect(() => {
    if (eventData?.name !== undefined && eventData?.name !== "") {
      console.log(eventData);
      console.log(existingEvent);
    }
  }, [eventData, existingEvent]);

  useEffect(() => {
    if (!existingOrg) return;
    if (existingOrg?._id === prevOrgRef.current?._id) return;
    const orgReady =
      existingOrg &&
      typeof existingOrg._id === "string" &&
      existingOrg._id.length > 0;

    const orgChanged = orgReady && existingOrg._id !== prevOrgRef.current?._id;

    if (orgChanged) {
      reset({
        organization: {
          ...existingOrg,
          location: existingOrg?.location,
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
    const eventChanged =
      eventReady && existingEvent._id !== prevEventRef.current?._id;
    if (eventChanged) {
      if (existingEvent?.lastEditedAt) {
        setLastSaved(existingEvent.lastEditedAt);
      } else if (existingEvent?._creationTime) {
        setLastSaved(existingEvent._creationTime);
      }
      reset({
        ...currentValues,
        event: {
          ...existingEvent,
        },
      });
      prevEventRef.current = existingEvent;
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

  //todo: add logic to autosave every... X minutes? but only save if changes have been made since last save

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

  useEffect(() => {
    if (orgHasNoEvents && activeStep === 0) {
      setNewOrgEvent(true);
    }
  }, [orgHasNoEvents, activeStep]);

  useEffect(() => {
    setFurthestStep((prev) => Math.max(prev, activeStep));
  }, [activeStep, furthestStep]);

  useEffect(() => {
    if (clearEventDataTrigger) {
      setFurthestStep(0);
      reset({
        organization: {
          ...existingOrg,
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
    }
  }, [clearEventDataTrigger, reset, existingOrg]);

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

    if (eventDatesFormat === "ongoing") {
      setValue("event.dates.ongoing", true);
    }

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
          end: new Date().getFullYear().toString(),
        },
      ]);
    }

    if (eventDatesFormat === "seasonRange") {
      setValue("event.dates.eventDates", [
        {
          start: toSeason(new Date()),
          end: toSeason(new Date()),
        },
      ]);
    }
    if (otherFormats.includes(eventDatesFormat)) {
      setValue("event.dates.ongoing", false);
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

  return (
    <HorizontalLinearStepper
      errorMsg={errorMsg}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      onNextStep={handleNextStep}
      onBackStep={handleBackStep}
      steps={steps}
      className="px-2 xl:px-8"
      finalLabel="Submit"
      onFinalSubmit={handleSubmit(onSubmit)}
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
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full min-h-96 grow flex-col p-4 xl:mx-auto xl:max-w-[1500px]"
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
                  "py-10",
                  // "xl:self-center",
                )}
              >
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
                  <p className="lg:text-xs">Category</p>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
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
                          defaultValue={field.value ?? ""}
                        >
                          <SelectTrigger className="h-12 w-full border text-center text-base sm:h-[50px]">
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
                  {errors.event?.category && eventData?.category && (
                    <span className="mt-2 w-full text-center text-sm text-red-600">
                      {errors.event?.category?.message
                        ? errors.event?.category?.message
                        : "Please select a category from the dropdown"}
                    </span>
                  )}
                </div>

                {eventCategoryEvent && (
                  <>
                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">Step 2: </p>
                      <p className="lg:text-xs">Event Type</p>
                    </div>

                    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                      <Label htmlFor="event.type" className="sr-only">
                        Event Type
                      </Label>
                      <Controller
                        name="event.type"
                        control={control}
                        render={({ field }) => (
                          <MultiSelect
                            id="event.type"
                            className="h-12 border sm:h-[50px]"
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
                      {errors.organization?.location && orgData?.location && (
                        <span className="mt-2 w-full text-center text-sm text-red-600">
                          {errors.organization?.location?.country?.message
                            ? errors.organization?.location?.country?.message
                            : errors.organization?.location?.full?.message
                              ? errors.organization?.location?.full?.message
                              : "Please select a location from the dropdown"}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {canNameEvent && (
                  <>
                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">
                        Step {eventCategoryEvent ? 3 : 2}:{" "}
                      </p>
                      <p className="lg:text-xs">
                        {getEventCategoryLabelAbbr(eventCategory)} Name
                      </p>
                    </div>

                    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                      <Label htmlFor="event.name" className="sr-only">
                        {getEventCategoryLabelAbbr(eventCategory)} Name
                      </Label>
                      <Controller
                        name="event.name"
                        control={control}
                        render={({ field }) => (
                          <EventNameSearch
                            value={field.value ?? ""}
                            isExisting={eventNameExistsError}
                            onChange={field.onChange}
                            className="border !text-base sm:h-[50px]"
                          />
                        )}
                      />
                      {(errors.event?.name || eventNameExistsError) &&
                        eventNameIsDirty && (
                          <span className="mt-2 w-full text-center text-sm text-red-600">
                            {errors.event?.name?.message
                              ? errors.event?.name?.message
                              : eventCategory === "event"
                                ? "An event with that name already exists."
                                : `A ${getEventCategoryLabelAbbr(eventCategory)} with this name already exists.`}
                          </span>
                        )}
                    </div>
                    {eventNameValid && (
                      <>
                        <div className="input-section">
                          <p className="min-w-max font-bold lg:text-xl">
                            Step {eventCategoryEvent ? 4 : 3}:{" "}
                          </p>
                          <p className="lg:text-xs">Location</p>
                        </div>

                        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                          <Label htmlFor="event.name" className="sr-only">
                            {getEventCategoryLabelAbbr(eventCategory)} Location
                          </Label>

                          {/*TODO: Add ability to enter in address for this part, since it's the event itself. The organization may actually benefit from this as well? Not that I'm thinking about it */}
                          <Controller
                            name="event.location"
                            control={control}
                            render={({ field }) => (
                              <MapboxInputFull
                                id="event.location"
                                isEvent
                                value={field.value}
                                onChange={field.onChange}
                                reset={!validOrgWZod}
                                tabIndex={2}
                                placeholder="Event Location (if different from organization)..."
                                className="mb-3 w-full lg:mb-0"
                                inputClassName="rounded-lg border-foreground disabled:opacity-50"
                              />
                            )}
                          />
                          {errors.event?.location && eventData?.location && (
                            <span className="mt-2 w-full text-center text-sm text-red-600">
                              {errors.event?.location?.country?.message
                                ? errors.event?.location?.country?.message
                                : errors.event?.location?.full?.message
                                  ? errors.event?.location?.full?.message
                                  : "Please select a location from the dropdown"}
                            </span>
                          )}
                        </div>
                        <div className="input-section">
                          <p className="min-w-max font-bold lg:text-xl">
                            Step {eventCategoryEvent ? 5 : 4}:{" "}
                          </p>
                          <p className="lg:text-xs">
                            {getEventCategoryLabelAbbr(eventCategory)} Logo
                          </p>
                        </div>
                        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
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
                                onRemove={() => field.onChange(undefined)}
                                reset={!validOrgWZod}
                                disabled={!orgNameValid}
                                initialImage={
                                  typeof field.value === "string"
                                    ? field.value
                                    : undefined
                                }
                                size={72}
                                tabIndex={3}
                              />
                            )}
                          />
                        </div>
                        {canNameEvent && (
                          <>
                            <div className="input-section h-full">
                              <p className="min-w-max font-bold lg:text-xl">
                                Step {eventCategoryEvent ? 6 : 5}:{" "}
                              </p>
                              <p className="lg:text-xs">
                                {getEventCategoryLabelAbbr(eventCategory)}{" "}
                                (About)
                              </p>
                            </div>

                            <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                              <Label htmlFor="event.name" className="sr-only">
                                {getEventCategoryLabelAbbr(eventCategory)} About
                              </Label>
                              <Controller
                                name="event.about"
                                control={control}
                                render={({ field }) => (
                                  <DebouncedTextarea
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    delay={500}
                                    className="border border-foreground sm:h-25"
                                  />
                                )}
                              />
                              {(errors.event?.name || eventNameExistsError) &&
                                eventNameIsDirty && (
                                  <span className="mt-2 w-full text-center text-sm text-red-600">
                                    {errors.event?.name?.message
                                      ? errors.event?.name?.message
                                      : eventCategory === "event"
                                        ? "An event with that name already exists."
                                        : `A ${getEventCategoryLabelAbbr(eventCategory)} with this name already exists.`}
                                  </span>
                                )}
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
                      "py-10",
                      // "xl:self-center",
                    )}
                  >
                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">
                        Step {eventCategoryEvent ? 7 : 6}:{" "}
                      </p>
                      <p className="lg:text-xs">
                        {getEventCategoryLabelAbbr(eventCategory)} Dates
                      </p>
                    </div>

                    <FormDatePicker
                      isAdmin={isAdmin}
                      title="Event Dates Format"
                      nameBase="event.dates"
                      type="event"
                      watchPath="event"
                    />

                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">
                        Step {eventCategoryEvent ? 8 : 7}:{" "}
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
                  </div>
                </>
              )}
            </div>
          )}
          {activeStep === 2 && (
            <p className="gap-4 xl:grid xl:grid-cols-2 xl:gap-6">Third Step </p>
          )}
          {activeStep === 3 && (
            <p className="gap-4 xl:grid xl:grid-cols-2 xl:gap-6">Final Step</p>
          )}
        </form>
      </FormProvider>
    </HorizontalLinearStepper>
  );
};
