import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"
import { OrgSearch } from "@/features/organizers/components/org-search";
import {
  eventOnlySchema,
  eventWithOCSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";

import { MultiSelect } from "@/components/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { columns } from "@/features/artists/applications/data-table/columns";
import { DataTable } from "@/features/artists/applications/data-table/data-table";
import { EventNameSearch } from "@/features/events/components/event-search";
import {
  fromSeason,
  toDateString,
  toSeason,
  toYear,
  toYearMonth,
} from "@/lib/dateFns";
import { getEventCategoryLabelAbbr } from "@/lib/eventFns";
import { handleFileUrl } from "@/lib/fileUploadFns";
import { cn } from "@/lib/utils";
import { EventCategory, EventType } from "@/types/event";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useAction, useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Path, useWatch } from "react-hook-form";
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
  children?: React.ReactNode;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

type EventOCFormValues = z.infer<typeof eventWithOCSchema>;

export const EventOCForm = ({
  user,
  onClick,
  shouldClose,
  // hasUnsavedChanges,
  setHasUnsavedChanges,
  activeStep,
  setActiveStep,
}: EventOCFormProps) => {
  const currentStep = steps[activeStep];
  const schema = currentStep.schema;
  const isAdmin = user?.role?.includes("admin");
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
      isDirty,
      errors,
    },
    reset,
  } = form;
  const currentValues = getValues();
  console.log(dirtyFields.event);
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const createNewOrg = useMutation(api.organizer.organizations.createNewOrg);
  const createOrUpdateEvent = useMutation(api.events.event.createOrUpdateEvent);
  const generateUploadUrl = useMutation(api.uploads.user.generateUploadUrl);
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const [isMobile, setIsMobile] = useState(false);
  // const [activeStep, setActiveStep] = useState(0);
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
    existingOrg ? existingOrg.updatedAt : null,
  );

  const existingOrgs = typeof existingOrg === "object" && existingOrg !== null;

  const lastSavedDate = lastSaved
    ? new Date(Math.floor(lastSaved)).toLocaleString()
    : null;

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

  const hasUserEditedStep0 =
    activeStep === 0 &&
    (orgData?.name?.trim() !== existingOrg?.name?.trim() ||
      orgData?.logo !== existingOrg?.logo ||
      orgData?.location?.full !== existingOrg?.location?.full);

  const hasUserEditedStep1 = dirtyFields.event ?? false;
  const hasUserEditedForm = hasUserEditedStep1 || hasUserEditedStep0;
  const prevOrgRef = useRef(existingOrg);

  // const orgValidation = useQuery(
  //   api.organizer.organizations.isOwnerOrIsNewOrg,
  //   orgName.trim().length >= 3 ? { organizationName: orgName } : "skip",
  // );
  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;
  console.log(validOrgWZod, isStepValidZod);
  const isValid = validOrgWZod && isStepValidZod && eventChoiceMade;
  console.log(eventChoiceMade, newOrgEvent, orgHasNoEvents);
  const existingOrgUpdateTrigger =
    existingOrgs && validOrgWZod && hasUserEditedStep0;
  const eventNameIsDirty = dirtyFields.event?.name ?? false;
  console.log("eventNameIsDirty", eventNameIsDirty);
  const hasEventLocation =
    (dirtyFields.event?.location || eventData?.location?.full !== undefined) &&
    eventNameValid;
  const hasNoEventDatesEdition =
    eventData?.dates?.edition === undefined &&
    eventData?.dates?.eventDates?.length === 0;
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
  console.log(hasUserEditedStep0);
  console.log("hasUserEditedStep1", hasUserEditedStep1);
  console.log("hasUserEditedForm", hasUserEditedForm);

  // console.log("eventNameData", eventNameData);

  // console.log("eventNameExists", eventNameValid);
  // console.log("eventNameExistsError", eventNameExistsError);
  console.log(errors);
  // console.log(hasUserEditedStep0);
  //
  //
  // console.log(formIsValid);
  // console.log("isValidOrg", isValidOrg);
  // console.log("isStepValid", isStepValid);
  console.log("isValid", isValid);
  // console.log(orgNameValid, orgLocationValid);
  console.log(orgData);
  // console.log(newOrgEvent);
  console.log(eventData);
  // console.log(eventsData, "now");
  console.log(existingEvent);
  // console.log("orgValue", orgValue);
  // console.log("existing orgs", existingOrgs);
  console.log("existingOrg", existingOrg);
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
      toast.success("Successfully updated profile! Forwarding to Stripe...");

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
    handleCheckSchema();
    await handleSave();
    handleFormValues();
    setActiveStep((prev) => prev + 1);
  };

  const handleBackStep = async () => {
    handleCheckSchema();

    if (activeStep === 1) {
      if (hasUserEditedStep1) {
        // let eventLogoUrl: string = "/1.jpg";
        // let eventLogoId: Id<"_storage"> | undefined;
        // let timezone: string | undefined;
        // let timezoneOffset: number | undefined;
        // if (eventData.location?.coordinates) {
        //   const timezoneData = await getTimezone({
        //     latitude: eventData.location.coordinates?.latitude || 52,
        //     longitude: eventData.location.coordinates?.longitude || 13.4,
        //   });
        //   timezone = timezoneData?.zoneName;
        //   timezoneOffset = timezoneData?.gmtOffset;
        // }
        // if (eventData.logo && typeof eventData.logo !== "string") {
        //   const uploadUrl = await generateUploadUrl();
        //   const uploadRes = await fetch(uploadUrl, {
        //     method: "POST",
        //     headers: { "Content-Type": eventData.logo.type },
        //     body: eventData.logo,
        //   });
        //   if (!uploadRes.ok) {
        //     toast.error("Failed to upload logo", {
        //       autoClose: 2000,
        //       pauseOnHover: false,
        //       hideProgressBar: true,
        //     });
        //     return;
        //   }
        //   const { storageId } = await uploadRes.json();
        //   eventLogoId = storageId;
        // } else if (eventData.logo && typeof eventData.logo === "string") {
        //   eventLogoUrl = eventData.logo;
        // }

        const result = await handleFileUrl({
          data: eventData,
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
        console.log(eventData.dates);
        try {
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
          console.log("event", event);

          reset({
            ...currentValues,
            event: {
              ...event,
              category: event?.eventCategory || "",
              type: event?.eventType || [],
            },
          });
          toast.success(
            existingOrg
              ? "Organization updated!"
              : "Organization created! Going to step 2...",
          );
        } catch (error) {
          console.error("Failed to create new organization:", error);
          toast.error("Failed to create new organization");
        }
      }
    }
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    let orgResult = null;
    console.log("handleSave");
    if (hasUserEditedStep0) {
      let orgLogoUrl: string = "/1.jpg";
      let orgLogoId: Id<"_storage"> | undefined;
      let timezone: string | undefined;
      let timezoneOffset: number | undefined;
      const data = watch("organization");
      if (data.location?.coordinates) {
        const timezoneData = await getTimezone({
          latitude: data.location.coordinates?.latitude || 52,
          longitude: data.location.coordinates?.longitude || 13.4,
        });
        timezone = timezoneData?.zoneName;
        timezoneOffset = timezoneData?.gmtOffset;
      }
      if (data.logo && typeof data.logo !== "string") {
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
        orgLogoId = storageId;
      } else if (data.logo && typeof data.logo === "string") {
        orgLogoUrl = data.logo;
      }

      try {
        const { org } = await createNewOrg({
          organizationName: data.name,
          logoId: orgLogoId,
          logo: orgLogoUrl,
          location: {
            full: data.location.full,
            locale: data.location.locale,
            city: data.location.city,
            state: data.location.state,
            stateAbbr: data.location.stateAbbr,
            region: data.location.region,
            country: data.location.country,
            countryAbbr: data.location.countryAbbr,
            continent: data.location?.continent || "",
            coordinates: {
              latitude: data.location.coordinates?.latitude || 0,
              longitude: data.location.coordinates?.longitude || 0,
            },
            currency: {
              code: data.location?.currency?.code || "",
              name: data.location?.currency?.name || "",
              symbol: data.location?.currency?.symbol || "",
            },
            demonym: data.location.demonym,
            timezone: timezone,
            timezoneOffset: timezoneOffset,
          },
        });
        orgResult = org;
        toast.success(
          existingOrg
            ? "Organization updated!"
            : "Organization created! Going to step 2...",
        );

        // Updating existingOrg state with new values
        //TODO: Check if this is still needed as I'm already taking the resulting organization and updating the form's organization state.
        if (existingOrg) {
          setExistingOrg({
            ...existingOrg,
            logo: typeof data.logo === "string" ? data.logo : orgLogoUrl,
            location: {
              ...existingOrg.location,
              ...data.location,
              continent: data.location?.continent ?? "",
              timezone,
              timezoneOffset,
            },
          });
        }
      } catch (error) {
        console.error("Failed to create new organization:", error);
        toast.error("Failed to create new organization");
      }

      //save logic here
      // get timezone
      // use existing event as default values for next step if applicable
      // if past event (or past open call), the event cannot be changed an selecting it will create a new event using the old one as a template.

      const orgLogoFullUrl = orgResult?.logo ?? "/1.jpg";

      if (existingEvent) {
        const locationFromEvent = existingEvent.location?.sameAsOrganizer
          ? {
              ...currentValues.organization?.location,
              sameAsOrganizer: true,
            }
          : {
              ...existingEvent.location,
            };
        reset({
          organization: {
            ...orgResult,
          },
          event: {
            ...existingEvent,
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
        reset({
          organization: {
            ...orgResult,
          },
          event: {
            name: "",
            logo: orgLogoFullUrl,
            links: {
              sameAsOrganizer: true,
            },
            location:
              orgResult?.location ?? currentValues.organization.location,
          },
        });
      }
    }
  };

  const handleCheckSchema = () => {
    if (schema) {
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

        return;
      }
      setErrorMsg("");
    }
  };

  const handleFormValues = () => {
    if (activeStep === 0 && !hasUserEditedStep0 && furthestStep === 0) {
      if (existingEvent) {
        const locationFromEvent = existingEvent.location?.sameAsOrganizer
          ? {
              ...currentValues.organization?.location,
              sameAsOrganizer: true,
            }
          : {
              ...existingEvent.location,
            };

        reset({
          ...currentValues,
          event: {
            ...existingEvent,
            category: existingEvent.eventCategory,
            type: existingEvent.eventType ?? [],
            location: locationFromEvent,
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
      }
    } else if (
      activeStep === 0 &&
      existingEvent &&
      eventData &&
      eventData?._id !== existingEvent?._id
    ) {
      reset({
        ...currentValues,
        event: {
          ...existingEvent,
          category: existingEvent.eventCategory,
          type: existingEvent.eventType ?? [],
          location: existingEvent.location,
        },
      });
    }
  };

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
        name: undefined,
        logo: undefined,
        location: undefined,
      },
      event: undefined,
    });
  };

  // -------------UseEffects --------------

  //checking if/when the existingOrg changes and loading new info
  useEffect(() => {
    const orgChanged = existingOrg?._id !== prevOrgRef.current?._id;
    if (orgChanged && existingOrgUpdateTrigger) {
      if (existingOrg?.updatedAt) {
        setLastSaved(existingOrg.updatedAt);
      } else if (existingOrg?._creationTime) {
        setLastSaved(existingOrg._creationTime);
      }
      reset({
        organization: {
          ...existingOrg,
        },
      });

      prevOrgRef.current = existingOrg;
    } else {
      setLastSaved(null);
    }
  }, [existingOrg, existingOrgUpdateTrigger, reset]);

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
        ...existingOrg,
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
    const format = eventData?.dates?.eventFormat;
    const otherFormats = [
      "noEvent",
      "setDates",
      "monthRange",
      "yearRange",
      "seasonRange",
    ];

    if (!format) return;

    if (format === "ongoing") {
      setValue("event.dates.ongoing", true);
    }

    if (format === "noEvent" || format === "setDates" || format === "ongoing") {
      setValue("event.dates.eventDates", [{ start: "", end: "" }]);
    }

    if (format === "yearRange") {
      setValue("event.dates.eventDates", [
        {
          start: new Date().getFullYear().toString(),
          end: new Date().getFullYear().toString(),
        },
      ]);
    }

    if (format === "seasonRange") {
      setValue("event.dates.eventDates", [
        {
          start: toSeason(new Date()),
          end: toSeason(new Date()),
        },
      ]);
    }
    if (otherFormats.includes(format)) {
      setValue("event.dates.ongoing", false);
      setValue("event.dates.edition", new Date().getFullYear());
    }
  }, [eventData?.dates?.eventFormat, setValue, hasNoEventDatesEdition]);

  useEffect(() => {
    if (hasUserEditedForm) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [setHasUnsavedChanges, hasUserEditedForm]);

  useEffect(() => {
    console.log("shouldClose", shouldClose);
    if (shouldClose) {
      console.log("onClose");
    } else {
      console.log("after timeout");
    }
  }, [shouldClose]);

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
      isDirty={isDirty}
      onSave={handleSubmit(onSubmit)}
      lastSaved={lastSavedDate}
      disabled={!isValid}
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full min-h-96 grow flex-col p-4 xl:mx-auto xl:max-w-[1500px]"
      >
        {activeStep === 0 && (
          <div
            id="step-1-container"
            className={cn(
              "flex h-full flex-col gap-4 xl:justify-center",
              existingOrg && "xl:grid xl:grid-cols-[40%_10%_50%] xl:gap-0",
            )}
          >
            <section
              id="first-section"
              className="mx-auto flex flex-col items-center gap-y-6 self-start xl:justify-center xl:self-center"
            >
              <section className="flex flex-col items-center justify-center">
                <div
                  id="welcome-text"
                  className="font-tanker text-[2.5em] lowercase tracking-wide text-foreground lg:text-[4em]"
                >
                  Welcome{" "}
                  <AnimatePresence>
                    {existingOrgs && validOrgWZod && (
                      <motion.span
                        key="back-text"
                        initial={{ opacity: 0, rotate: -10 }}
                        animate={{
                          opacity: 1,
                          rotate: [0, -10, 10, -8, 8, -5, 5, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className="inline-block"
                      >
                        Back
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="hidden text-balance text-center text-xl lg:block lg:text-base">
                  To start, select from an existing organization or create a new
                  one!
                </p>
              </section>
              <div
                className={cn(
                  "flex w-full grid-cols-[20%_auto] flex-col items-center lg:mx-auto lg:grid lg:max-w-[500px] lg:gap-6 lg:gap-x-4",
                  "[&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                )}
              >
                <div className="input-section">
                  <p className="min-w-max font-bold lg:text-xl">Step 1: </p>
                  <p className="lg:text-xs">Organization</p>
                </div>
                <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                  <Label htmlFor="organization.name" className="sr-only">
                    Organization Name
                  </Label>
                  <Controller
                    name="organization.name"
                    control={control}
                    render={({ field }) => (
                      <OrgSearch
                        id="organization.name"
                        value={field.value}
                        onChange={field.onChange}
                        isValid={validOrgWZod}
                        validationError={invalidOrgWZod}
                        onLoadClick={setExistingOrg}
                        onReset={handleReset}
                        placeholder="Search or enter new name"
                        className="mb-3 h-12 lg:mb-0 lg:h-20"
                        inputClassName="rounded-lg py-2 text-base lg:text-xl"
                        tabIndex={1}
                      />
                    )}
                  />
                  {(orgValidationError ||
                    (errors.organization?.name && orgName.length > 3)) && (
                    <span className="mt-2 w-full text-center text-sm text-red-600">
                      {errors.organization?.name?.message ||
                        "Organization already exists. Contact support for assistance"}
                    </span>
                  )}
                </div>

                {orgNameValid && (
                  <>
                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">Step 2: </p>
                      <p className="lg:text-xs">Location</p>
                    </div>
                    <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                      <Label
                        htmlFor="organization.location"
                        className="sr-only"
                      >
                        Organization Location
                      </Label>
                      <Controller
                        name="organization.location"
                        control={control}
                        render={({ field }) => (
                          <MapboxInputFull
                            id="organization.location"
                            value={field.value}
                            onChange={field.onChange}
                            reset={!validOrgWZod}
                            tabIndex={2}
                            disabled={!orgNameValid}
                            placeholder="Organization Location (city, state, country, etc)..."
                            className="mb-3 w-full lg:mb-0"
                            inputClassName="rounded-lg border-foreground "
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

                {orgLocationValid && (
                  <>
                    <div className="input-section">
                      <p className="min-w-max font-bold lg:text-xl">Step 3: </p>
                      <p className="lg:text-xs">Logo</p>
                    </div>
                    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                      <Label htmlFor="organization.logo" className="sr-only">
                        Organization Logo
                        {/* <span className="text-xs italic text-muted-foreground">
                    {required ? "(required)" : "(optional)"}
                  </span> */}
                      </Label>
                      <Controller
                        name="organization.logo"
                        control={control}
                        render={({ field }) => (
                          <AvatarUploader
                            id="organization.logo"
                            onChange={(file) => field.onChange(file)}
                            onRemove={() => field.onChange(undefined)}
                            reset={!validOrgWZod}
                            disabled={!orgNameValid}
                            initialImage={existingOrg?.logo}
                            size={72}
                            tabIndex={3}
                          />
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
            {/* second half of first page */}
            {orgDataValid && existingOrg && (
              <>
                <Separator thickness={2} className="my-4 xl:hidden" />
                {existingOrg && (
                  <Separator
                    thickness={2}
                    className="mx-auto hidden xl:block"
                    orientation="vertical"
                  />
                )}
                <section className="flex flex-col items-center justify-center gap-4">
                  <div
                    id="event-header"
                    className="mb-2 flex w-full flex-col items-center justify-center gap-2 sm:flex-row"
                  >
                    <p className="font-tanker text-xl lowercase tracking-wide text-foreground sm:text-2xl">
                      Select an existing Event/Project
                    </p>
                    <p className="text-sm italic text-muted-foreground">
                      (or continue a draft)
                    </p>
                  </div>
                  <DataTable
                    columns={columns}
                    data={eventsData}
                    defaultVisibility={{
                      eventCategory: false,
                      lastEditedAt: false,
                    }}
                    onRowSelect={(event, selection) => {
                      if (newOrgEvent) {
                        setNewOrgEvent(false);
                      }
                      setExistingEvent(event as Doc<"events">);
                      setSelectedRow(selection);
                    }}
                    selectedRow={selectedRow}
                    className="w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
                    containerClassName={cn(
                      "lg:hidden",
                      newOrgEvent && "opacity-50",
                    )}
                  />
                  <DataTable
                    columns={columns}
                    data={eventsData}
                    onRowSelect={(event, selection) => {
                      if (newOrgEvent) {
                        setNewOrgEvent(false);
                      }
                      setExistingEvent(event as Doc<"events">);
                      setSelectedRow(selection);
                    }}
                    selectedRow={selectedRow}
                    className="flex w-full max-w-[90vw] overflow-x-auto"
                    containerClassName={cn(
                      "hidden lg:block xl:hidden  ",
                      newOrgEvent && "opacity-50",
                    )}
                  />
                  <DataTable
                    columns={columns}
                    data={eventsData}
                    onRowSelect={(event, selection) => {
                      if (newOrgEvent) {
                        setNewOrgEvent(false);
                      }
                      setExistingEvent(event as Doc<"events">);
                      setSelectedRow(selection);
                    }}
                    selectedRow={selectedRow}
                    defaultVisibility={{
                      eventCategory: false,
                      // lastEditedAt: false,
                    }}
                    className="flex w-full max-w-[90vw] overflow-x-auto"
                    containerClassName={cn(
                      "hidden xl:block ",
                      newOrgEvent && "opacity-50 pointer-events-none",
                    )}
                  />
                  {/* 
                  <span>or</span> */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setExistingEvent(null);
                    }}
                  >
                    Create New Event
                  </Button> */}

                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-2 md:items-center",
                      existingEvent !== null &&
                        "pointer-events-none opacity-50 hover:cursor-default",
                    )}
                  >
                    <Checkbox
                      disabled={existingEvent !== null}
                      tabIndex={4} //todo: update this to check if user has existing events and if so, direct them to the search input on the data table
                      id="newEvent"
                      className="focus-visible:bg-salPink/50 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-salPink focus-visible:ring-offset-1 focus-visible:data-[selected=true]:bg-salPink/50"
                      checked={eventsData?.length === 0 ? true : newOrgEvent}
                      onCheckedChange={(checked) => {
                        setExistingEvent(null);
                        if (eventsData?.length === 0) {
                          setNewOrgEvent(true);
                        } else {
                          setNewOrgEvent(!!checked);
                        }
                      }}
                    />
                    {eventsData?.length > 0 ? (
                      <span className={cn("text-sm")}>
                        No thanks, I&apos;d like to create a new event/project
                      </span>
                    ) : (
                      <span className="text-sm">
                        I&apos;d like to create a new event/project
                      </span>
                    )}
                  </label>
                  <p className="mt-2 text-center text-xs italic text-muted-foreground">
                    Past events are no longer editable but are still viewable
                    and able to be used as a template for new events.
                  </p>
                </section>
              </>
            )}
          </div>
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
                "self-start xl:self-center [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
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
                        <Label htmlFor="organization.logo" className="sr-only">
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
                    "self-start lg:items-start xl:self-center [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
                  )}
                >
                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step {eventCategoryEvent ? 6 : 5}:{" "}
                    </p>
                    <p className="lg:text-xs">
                      {getEventCategoryLabelAbbr(eventCategory)} Dates
                    </p>
                  </div>

                  <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label
                      htmlFor="event.dates.eventFormat"
                      className="sr-only"
                    >
                      Event Dates Format
                    </Label>
                    <Controller
                      name="event.dates.eventFormat"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            onValueChange={(value: EventCategory) => {
                              field.onChange(value);
                            }}
                            defaultValue={field.value ?? ""}
                          >
                            <SelectTrigger className="h-12 w-full border text-center text-base placeholder:text-muted-foreground/70 sm:h-[50px]">
                              <SelectValue
                                placeholder="*If there's an event (select one)"
                                className="placeholder:text-muted-foreground/70"
                              />
                            </SelectTrigger>
                            <SelectContent className="min-w-auto">
                              <SelectItem fit value="noEvent">
                                No Event
                              </SelectItem>
                              <SelectItem fit value="setDates">
                                Set Dates (MM DD YYYY)
                              </SelectItem>
                              <SelectItem fit value="monthRange">
                                Month Range
                              </SelectItem>
                              <SelectItem fit value="yearRange">
                                Year Range
                              </SelectItem>
                              <SelectItem fit value="seasonRange">
                                Season Range
                              </SelectItem>
                              <SelectItem fit value="ongoing">
                                Ongoing
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                    {errors.event?.dates?.eventFormat &&
                      eventData?.dates?.eventFormat && (
                        <span className="mt-2 w-full text-center text-sm text-red-600">
                          {errors.event?.dates?.eventFormat?.message
                            ? errors.event?.dates?.eventFormat?.message
                            : "Please select a date format from the dropdown"}
                        </span>
                      )}
                    {eventData?.dates?.eventFormat &&
                      eventData.dates.eventFormat !== "ongoing" &&
                      eventData.dates.eventFormat !== "noEvent" && (
                        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                          <Label
                            htmlFor="event.dates.eventDates"
                            className="sr-only"
                          >
                            Event Dates Format
                          </Label>
                          {eventData.dates.eventFormat === "setDates" && (
                            <div className="flex max-w-full items-center gap-x-2">
                              <Controller
                                name="event.dates.eventDates.0.start"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="dates"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toDateString(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      maxDate={
                                        eventData?.dates?.eventDates[0]?.end
                                      }
                                    />
                                  );
                                }}
                              />
                              -
                              <Controller
                                name="event.dates.eventDates.0.end"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="dates"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toDateString(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      minDate={
                                        eventData?.dates?.eventDates[0]?.start
                                      }
                                    />
                                  );
                                }}
                              />
                            </div>
                          )}
                          {eventData.dates.eventFormat === "monthRange" && (
                            <div className="flex max-w-full items-center gap-x-2">
                              <Controller
                                name="event.dates.eventDates.0.start"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="month"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toYearMonth(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      maxDate={
                                        eventData?.dates?.eventDates[0]?.end
                                      }
                                    />
                                  );
                                }}
                              />
                              -
                              <Controller
                                name="event.dates.eventDates.0.end"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="month"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toYearMonth(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      minDate={
                                        eventData?.dates?.eventDates[0]?.start
                                      }
                                    />
                                  );
                                }}
                              />
                            </div>
                          )}
                          {eventData.dates.eventFormat === "yearRange" && (
                            <div className="flex max-w-full items-center gap-x-2">
                              <Controller
                                name="event.dates.eventDates.0.start"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="year"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toYear(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      maxDate={
                                        eventData?.dates?.eventDates[0]?.end
                                      }
                                    />
                                  );
                                }}
                              />
                              -
                              <Controller
                                name="event.dates.eventDates.0.end"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="year"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toYear(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      minDate={
                                        eventData?.dates?.eventDates[0]?.start
                                      }
                                    />
                                  );
                                }}
                              />
                            </div>
                          )}
                          {eventData.dates.eventFormat === "seasonRange" && (
                            <div className="flex max-w-full items-center gap-x-2">
                              <Controller
                                name="event.dates.eventDates.0.start"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="season"
                                      value={field.value}
                                      onChange={(date) => {
                                        field.onChange(toSeason(date));
                                      }}
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      maxDate={
                                        fromSeason(
                                          eventData?.dates?.eventDates[0]?.end,
                                        ) ?? new Date()
                                      }
                                    />
                                  );
                                }}
                              />
                              -
                              <Controller
                                name="event.dates.eventDates.0.end"
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CustomDatePicker
                                      isAdmin={isAdmin}
                                      pickerType="season"
                                      value={field.value}
                                      onChange={(date) =>
                                        field.onChange(toSeason(date))
                                      }
                                      className="w-full rounded border p-2 text-center"
                                      inputClassName="h-12"
                                      minDate={
                                        fromSeason(
                                          eventData?.dates?.eventDates[0]
                                            ?.start,
                                        ) ?? new Date()
                                      }
                                    />
                                  );
                                }}
                              />
                            </div>
                          )}
                          {errors.event?.location &&
                            eventData?.dates?.eventFormat && (
                              <span className="mt-2 w-full text-center text-sm text-red-600">
                                {errors.event?.dates?.eventFormat?.message
                                  ? errors.event?.dates?.eventFormat?.message
                                  : "Please select a date format from the dropdown"}
                              </span>
                            )}
                        </div>
                      )}
                  </div>

                  <div className="input-section">
                    <p className="min-w-max font-bold lg:text-xl">
                      Step {eventCategoryEvent ? 7 : 6}:{" "}
                    </p>
                    <p className="lg:text-xs">Production Dates</p>
                  </div>

                  <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label htmlFor="event.dates.prodFormat" className="sr-only">
                      Production Dates Format
                    </Label>
                    <Controller
                      name="event.dates.prodFormat"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            onValueChange={(value: EventCategory) => {
                              field.onChange(value);
                            }}
                            defaultValue={field.value ?? ""}
                          >
                            <SelectTrigger className="h-12 w-full border text-center text-base placeholder:text-muted-foreground/70 sm:h-[50px]">
                              <SelectValue
                                placeholder="Select artist dates format"
                                className="placeholder:text-muted-foreground/70"
                              />
                            </SelectTrigger>
                            <SelectContent className="min-w-auto">
                              <SelectItem fit value="setDates">
                                Set Dates (MM DD YYYY)
                              </SelectItem>
                              <SelectItem fit value="monthRange">
                                Month Range
                              </SelectItem>
                              <SelectItem fit value="yearRange">
                                Year Range
                              </SelectItem>
                              <SelectItem fit value="seasonRange">
                                Season Range
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                    {errors.event?.dates?.prodFormat &&
                      eventData?.dates?.prodFormat && (
                        <span className="mt-2 w-full text-center text-sm text-red-600">
                          {errors.event?.dates?.prodFormat?.message
                            ? errors.event?.dates?.prodFormat?.message
                            : "Please select a date format from the dropdown"}
                        </span>
                      )}
                    {eventData?.dates?.prodFormat && (
                      <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                        <Label
                          htmlFor="event.dates.artistStart"
                          className="sr-only"
                        >
                          Artist Dates
                        </Label>
                        <div className="flex items-center gap-x-2">
                          <Controller
                            name="event.dates.artistStart"
                            control={control}
                            render={({ field }) => {
                              return (
                                <Input
                                  type="date"
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  placeholder="MM DD YYYY"
                                  className="h-12 border-foreground text-center"
                                />
                              );
                            }}
                          />
                          -
                          <Controller
                            name="event.dates.artistEnd"
                            control={control}
                            render={({ field }) => {
                              return (
                                <Input
                                  type="date"
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  placeholder="MM DD YYYY"
                                  className="h-12 border-foreground text-center"
                                />
                              );
                            }}
                          />
                        </div>
                        {errors.event?.dates?.eventFormat &&
                          eventData?.dates?.eventFormat && (
                            <span className="mt-2 w-full text-center text-sm text-red-600">
                              {errors.event?.dates?.eventFormat?.message
                                ? errors.event?.dates?.eventFormat?.message
                                : "Please select a date format from the dropdown"}
                            </span>
                          )}
                      </div>
                    )}
                  </div>

                  {canNameEvent && (
                    <>
                      <div className="input-section">
                        <p className="min-w-max font-bold lg:text-xl">
                          Step {eventCategoryEvent ? 8 : 7}:{" "}
                        </p>
                        <p className="lg:text-xs">
                          {getEventCategoryLabelAbbr(eventCategory)} (About)
                        </p>
                      </div>

                      <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                        <Label htmlFor="event.name" className="sr-only">
                          {getEventCategoryLabelAbbr(eventCategory)} Name
                        </Label>
                        <Controller
                          name="event.about"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              value={field.value ?? ""}
                              onChange={field.onChange}
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
    </HorizontalLinearStepper>
  );
};
