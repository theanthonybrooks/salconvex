"use client";

import { Button } from "@/components/ui/button";

import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
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
import { eventWithOCSchema } from "@/features/organizers/schemas/event-add-schema";

import SubmissionFormEventStep1 from "@/features/events/submission-form/steps/submission-form-event-1";
import SubmissionFormEventStep2 from "@/features/events/submission-form/steps/submission-form-event-2";
import SubmissionFormOC1 from "@/features/events/submission-form/steps/submission-form-oc-1";
import SubmissionFormOC2 from "@/features/events/submission-form/steps/submission-form-oc-2";
import SubmissionFormOrgStep from "@/features/events/submission-form/steps/submission-form-org-1";
import SubmissionFormOrgStep2 from "@/features/events/submission-form/steps/submission-form-org-2";
import { SubmissionFormRecapDesktop } from "@/features/events/submission-form/steps/submission-form-recap-desktop";
import { SubmissionFormRecapMobile } from "@/features/events/submission-form/steps/submission-form-recap-mobile";
import { toSeason, toYearMonth } from "@/lib/dateFns";
import { handleFileUrl, handleOrgFileUrl } from "@/lib/fileUploadFns";
import { getOcPricing } from "@/lib/pricingFns";
import { EnrichedEvent, EventCategory } from "@/types/event";
import { validOCVals } from "@/types/openCall";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useAction, useMutation } from "convex/react";
import { debounce, merge } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { Path } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";

import { steps } from "@/features/events/event-add-form";
import { LuBadge, LuBadgeCheck, LuBadgeDollarSign } from "react-icons/lu";

const formTypeOptions = [
  { value: 1, Icon: LuBadge },
  { value: 2, Icon: LuBadgeCheck },
  { value: 3, Icon: LuBadgeDollarSign },
];

interface AdminEventOCFormProps {
  user: User | undefined;
}

export type EventOCFormValues = z.infer<typeof eventWithOCSchema>;

export const AdminEventForm = ({ user }: AdminEventOCFormProps) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formType, setFormType] = useState<number>(0);

  const eventOnly = formType === 1;

  const finalStep = activeStep === steps.length - 1;
  const isAdmin = user?.role?.includes("admin") || false;
  // const freeCall = formType === 2;
  const currentStep = steps[activeStep];
  const schema = currentStep.schema;
  const form = useForm<z.infer<typeof eventWithOCSchema>>({
    resolver: zodResolver(eventWithOCSchema),
    defaultValues: {
      organization: {
        name: "",
        logo: "",
        location: undefined,
      },
      event: {
        formType,
        name: "",
        hasOpenCall: eventOnly ? "False" : "Fixed",
      },
      openCall: {
        basicInfo: {
          appFee: 0,
        },
        eligibility: {
          whom: [],
        },
      },
      // orgLogo: undefined,
      // eventName: "",
    },
    mode: "onChange",
  });

  const {
    control,
    watch,
    setValue,
    getValues,
    setError,
    unregister,

    handleSubmit,
    formState: {
      // isValid,
      dirtyFields,
      // isDirty,
      errors,
    },
    reset,
  } = form;
  // #region ------------- Definitions --------------
  // #region ------------- Actions, Mutations, Queries --------------

  const searchParams = useSearchParams();
  const eventId = searchParams.get("_id");
  const currentValues = getValues();
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);

  const createNewOrg = useMutation(api.organizer.organizations.createNewOrg);
  const createOrUpdateEvent = useMutation(api.events.event.createOrUpdateEvent);
  const saveOrgFile = useMutation(api.uploads.files.saveOrgFile);
  const createOrUpdateOpenCall = useMutation(
    api.openCalls.openCall.createOrUpdateOpenCall,
  );
  const updateEventLastEditedAt = useMutation(
    api.events.event.updateEventLastEditedAt,
  );
  const markOrganizationComplete = useMutation(
    api.organizer.organizations.markOrganizationComplete,
  );
  const updateOrg = useMutation(api.organizer.organizations.updateOrganization);
  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  // #endregion
  // #region ------------- State --------------
  const [acceptedTerms, setAcceptedTerms] = useState(isAdmin);
  const [isMobile, setIsMobile] = useState(false);
  const [furthestStep, setFurthestStep] = useState(0);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [existingOrg, setExistingOrg] = useState<Doc<"organizations"> | null>(
    null,
  );
  const [newOrgEvent, setNewOrgEvent] = useState(false);
  const [existingEvent, setExistingEvent] = useState<EnrichedEvent | null>(
    null,
  );

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
    console.log(result);
    return result.success;
  }, [watchedValues, currentSchema]);
  // #endregion
  //
  //
  // ------------- Step 1 - Organization & Event --------------
  //
  //
  // #region ------------- Refs --------------
  const prevErrorJson = useRef<string>("");
  const lastChangedRef = useRef<number | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const canCheckSchema = useRef(false);
  const canClearEventData = useRef(true);
  const isFirstRun = useRef(true);
  const savedState = useRef(false);
  // #endregion
  // #region ------------- Watch --------------
  const orgData = watch("organization");
  const eventData = watch("event");
  const openCallData = watch("openCall");
  const eventFormType = eventData?.formType;
  const hasEventId = !!eventData?._id;

  // const eventDatesWatch = watch("event.dates");
  // #endregion
  // #region ------------- Variables --------------
  const userAcceptedTerms = acceptedTerms;
  const firstTimeOnStep = furthestStep <= activeStep;
  const orgName = orgData?.name ?? "";
  const eventOpenCall = eventData?.hasOpenCall ?? "";
  const now = new Date();
  const openCallEnd = openCallData?.basicInfo?.dates?.ocEnd
    ? new Date(openCallData?.basicInfo?.dates?.ocEnd)
    : null;

  //   console.log(eventOpenCall);
  const pastEvent = !!openCallEnd && openCallEnd < now;
  //note-to-self: this is what's hiding the open call sections from users (non-admins). The idea being that they shouldn't be able to change anything. Perhaps the better way would be to still show it, but have it disabled/read only? It's confusing at the moment.
  const hasOpenCall =
    (validOCVals.includes(eventOpenCall) && formType > 1) || formType >= 2;

  const eventName = eventData?.name;
  // const eventLogo = eventData?.logo;

  const clearEventDataTrigger =
    (newOrgEvent &&
      activeStep === 0 &&
      eventData &&
      hasEventId &&
      canClearEventData.current) ||
    (isSelectedRowEmpty && hasEventId && activeStep === 0);

  const orgNameValid = !errors.organization?.name && Boolean(orgName?.trim());
  const orgLocationValid =
    !errors.organization?.location?.country && Boolean(orgData?.location?.full);
  const orgLogoValid = !errors.organization?.logo && Boolean(orgData?.logo);
  const orgDataValid = orgNameValid && orgLocationValid && orgLogoValid;
  const { data: preloadData } = useQueryWithStatus(
    api.events.event.preloadEventAndOrgById,
    typeof eventId === "string" && isAdmin
      ? { eventId: eventId as Id<"events"> }
      : "skip",
  );

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
  const eventChoiceMade = !!(
    existingEvent ||
    (newOrgEvent && isAdmin) ||
    !existingOrg
  );

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

  const { data: ocData, isSuccess: openCallSuccess } = useQueryWithStatus(
    api.openCalls.openCall.getOpenCallByEventId,
    existingEvent && hasOpenCall ? { eventId: existingEvent._id } : "skip",
  );
  const eventDates = eventData?.dates?.eventDates;
  const eventDatesFormat = eventData?.dates?.eventFormat;
  const hasNoEventDates = eventDates?.length === 0 || !eventDates;
  const prodDatesStart = eventData?.dates?.prodDates?.[0]?.start;
  const noProdStart =
    eventData?.dates?.noProdStart ||
    (existingEvent?.dates?.prodDates?.[0]?.start === "" &&
      existingEvent?.dates?.prodDates?.[0]?.end !== "") ||
    false;

  const eventLinks = useMemo(() => {
    if (existingEvent?.links) return existingEvent.links;
    if (existingOrg?.links)
      return { ...existingOrg.links, sameAsOrganizer: true };
    return { sameAsOrganizer: false };
  }, [existingEvent?.links, existingOrg?.links]);

  const hasUserEditedStep0 =
    JSON.stringify(dirtyFields?.organization ?? {}).includes("true") &&
    activeStep === 0;
  const hasUserEditedStep3 =
    JSON.stringify(dirtyFields?.openCall ?? {}).includes("true") &&
    activeStep === 3;
  const hasUserEditedStep4 =
    JSON.stringify(dirtyFields?.openCall ?? {}).includes("true") &&
    activeStep === 4;

  const hasUserEditedStep5 =
    JSON.stringify(dirtyFields?.organization ?? {}).includes("true") &&
    activeStep === 5;
  const hasUserEditedEventSteps = JSON.stringify(
    dirtyFields?.event ?? {},
  ).includes("true");
  const hasUserEditedForm = !!(
    hasUserEditedEventSteps ||
    hasUserEditedStep0 ||
    hasUserEditedStep3 ||
    hasUserEditedStep4 ||
    hasUserEditedStep5
  );

  const preloadFlag = useRef(false);
  const preloadOrgRef = useRef(false);
  const preloadEventRef = useRef(false);
  const prevOrgRef = useRef(existingOrg);
  const prevEventRef = useRef(existingEvent);
  const validStep1 =
    activeStep > 0
      ? !!(eventName && eventName.trim().length > 3 && !!eventDatesFormat)
      : true;
  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;
  const isValid =
    validOrgWZod && isStepValidZod && eventChoiceMade && validStep1;

  const projectMaxBudget = ocData?.compensation?.budget?.max;
  const projectMinBudget = ocData?.compensation?.budget?.min;
  const projectBudget = (projectMaxBudget || projectMinBudget) ?? 0;
  const submissionCost = getOcPricing(projectBudget);
  const alreadyPaid = !!openCallData?.paid;
  const alreadyApprovedOC = !!openCallData?.approvedBy;
  const alreadyApprovedEvent = !!eventData?.approvedBy;
  const alreadyApproved = alreadyApprovedOC || alreadyApprovedEvent;

  // console.log(finalStep, acceptedTerms, isAdmin);
  // #endregion
  // #endregion
  //

  //
  // #region ------------- Console Logs --------------
  if (errors && Object.keys(errors).length > 0) {
    console.log("errors", errors);
  }
  // console.log(
  //   isValid,
  //   validOrgWZod,
  //   isStepValidZod,
  //   eventChoiceMade,
  //   validStep1,
  // );
  // console.log(openCallData);
  // #endregion
  // console.log(!isValid);
  //
  //
  //
  // #region -------------Used Function --------------
  const onCancel = () => {
    setActiveStep(0);
  };

  const onSubmit = async () => {
    try {
      // console.log("organizer mode)");
      setValue("event.state", "submitted");

      await handleSave(true);

      toast.success(
        "Successfully updated project!",

        {
          onClick: () => toast.dismiss(),
        },
      );
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    } finally {
      setActiveStep(0);
      router.push("/dashboard/");
    }
  };

  const handleNextStep = async () => {
    const isStepValid = handleCheckSchema();
    if (!isStepValid) return;
    if (hasUserEditedForm) {
      // console.log("hasUserEditedForm 440");
      await handleSave();
    }
    if (formType === 1 && eventData?.hasOpenCall === "Fixed") {
      setValue("event.hasOpenCall", "False");
    }
    handleFirstStep();
    if (activeStep === 2 && !hasOpenCall) {
      unregister("openCall");

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
    if (activeStep === 4 && !hasOpenCall) {
      setActiveStep((prev) => prev - 3);
    } else if (activeStep === 5) {
      if (!orgData?.contact?.primaryContact) {
        unregister("organization.contact");
        unregister("organization.links");
        // console.log(getValues("organization"));
      }
      if (!hasOpenCall) {
        // console.log("heya");
        unregister("openCall");
        setActiveStep((prev) => prev - 3);
      } else {
        setActiveStep((prev) => prev - 1);
      }
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleFirstStep = () => {
    if (activeStep === 0 && !hasUserEditedForm && furthestStep === 0) {
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
              formType,
              ...currentValues.event,
              location: locationFromEvent,
              links: {
                ...eventLinks,
              },
              category: eventData.category ?? "event",

              hasOpenCall: !eventOnly
                ? (eventData.hasOpenCall ?? "Fixed")
                : "False",
            },
          }),
        );
      } else {
        reset({
          ...currentValues,
          event: {
            formType,
            name: "",
            logo: currentValues.organization.logo,
            logoStorageId: currentValues.organization.logoStorageId,
            location: {
              ...currentValues.organization.location,
              sameAsOrganizer: true,
            },
            category: eventData.category ?? "event",

            dates: {
              edition: new Date().getFullYear(),
              noProdStart: false,
            },
            links: {
              ...eventLinks,
            },
            hasOpenCall: !eventOnly ? "Fixed" : "False",
          },
        });
        // console.log("waffles");
        // console.log(currentValues, eventData);
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
        const userRelevantIssues = issues.filter(
          (i) =>
            i.message && !["Required", "Invalid input"].includes(i.message),
        );

        const firstMessage = userRelevantIssues[0]?.message || "";

        setErrorMsg(firstMessage || "");

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
    async (direct = false, publish = false) => {
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
      let orgLogoFullUrl = "/1.jpg";
      if (hasUserEditedForm) {
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
        const { logoStorageId, timezone, timezoneOffset } = result;
        const logo = typeof orgData.logo === "string" ? orgData.logo : "1.jpg";
        console.log(result);
        try {
          setPending(true);
          const { org } = await createNewOrg({
            organizationName: orgData.name,
            logoStorageId,
            logo,
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
          // orgLogoFullUrl = fileUrl ?? orgResult?.logo ?? "/1.jpg";
          orgLogoFullUrl =
            orgResult?.logo ??
            (orgData.logo === "string" ? orgData.logo : "/1.jpg");

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
              logo: orgLogoFullUrl,
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

        const eventFullUrl = eventData?.logo ?? orgLogoFullUrl;

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
              formType,
              ...existingEvent,
              logo: eventFullUrl,
              logoStorageId: existingEvent?.logoStorageId ?? logoStorageId,
              links: eventLinks,
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
              formType,
              name: "",
              logo: orgLogoFullUrl || eventFullUrl,
              logoStorageId,
              links: eventLinks,
              location: {
                ...(orgResult?.location ||
                  currentValues.organization?.location),
                sameAsOrganizer: true,
              },
              dates: {
                edition: new Date().getFullYear(),
                noProdStart: false,
              },
              hasOpenCall:
                eventData.hasOpenCall ?? (eventOnly ? "False" : "Fixed"),
            },
          });
        }
      }
      // await handleFormValues();
      if (activeStep === 1 && hasUserEditedForm) {
        let result = {
          logoStorageId: eventData?.logoStorageId as Id<"_storage"> | undefined,
          timezone: existingEvent?.location?.timezone,
          timezoneOffset: existingEvent?.location?.timezoneOffset,
        };

        const needsUpload =
          (eventData?.logo && typeof eventData.logo !== "string") ||
          !eventData?.logoStorageId;

        if (needsUpload) {
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
          // console.log(result);
        }
        // console.log("doesnt need upload");
        const { logoStorageId, timezone, timezoneOffset } = result;
        // console.log(logoStorageId, timezone, timezoneOffset);
        let eventResult = null;
        const eventLogo =
          typeof eventData.logo === "string" ? eventData.logo : "1.jpg";

        try {
          setPending(true);
          const prodDates =
            eventData.dates.prodFormat === "sameAsEvent"
              ? eventData.dates.eventDates
              : eventData.dates.prodDates;

          const { event } = await createOrUpdateEvent({
            formType,
            _id: eventData._id || "",
            name: eventData.name,
            slug:
              existingEvent?.slug ??
              slugify(eventData.name, { lower: true, strict: true }),
            logoStorageId,
            logo: eventLogo,
            type: eventData.type || [],
            category: eventData.category ?? "event",
            hasOpenCall:
              eventData.hasOpenCall ?? (eventOnly ? "False" : "Fixed"),

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
            timeLine: eventData.timeLine,
            adminNote: eventData.adminNote || undefined,
            active: eventData.active,
            orgId: orgData._id as Id<"organizations">,
          });

          eventResult = event;

          setExistingEvent(eventResult);
          // console.log(event);
          // console.log(currentValues.event);

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
      if (activeStep === 2 && hasUserEditedForm) {
        let eventResult = null;

        try {
          setPending(true);

          const { event } = await createOrUpdateEvent({
            _id: eventData._id || "",
            name: eventData.name,
            slug:
              existingEvent?.slug ??
              slugify(eventData.name, { lower: true, strict: true }),

            logo: eventData.logo as string | "1.jpg",
            type: eventData.type || [],
            category: eventData.category ?? "event",
            hasOpenCall:
              eventData.hasOpenCall ?? (eventOnly ? "False" : "Fixed"),
            dates: {
              ...eventData.dates,
            },
            location: {
              ...eventData.location,
            },
            about: eventData.about,
            links: eventData.links,
            otherInfo: eventData.otherInfo || undefined,
            timeLine: eventData.timeLine,
            adminNote: eventData.adminNote || undefined,
            active: eventData.active,
            orgId: orgData._id as Id<"organizations">,
          });

          eventResult = event;

          setExistingEvent(eventResult);

          reset(
            merge({}, currentValues, {
              event: {
                formType,
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
      if (activeStep === 3 && hasUserEditedForm) {
        let openCallFiles = null;
        let saveResults: {
          id: Id<"openCallFiles">;
          url: string;
          fileName?: string;
          storageId: Id<"_storage">;
        }[] = [];

        if (!openCallData) return;

        if (openCallData.tempFiles && openCallData.tempFiles?.length > 0) {
          const result = await handleOrgFileUrl({
            data: { files: openCallData.tempFiles },
            generateUploadUrl,
          });

          if (!result) {
            toast.error("Failed to upload files", {
              autoClose: 2000,
              pauseOnHover: false,
              hideProgressBar: true,
            });
            return;
          }
          openCallFiles = result;

          saveResults = await saveOrgFile({
            files: result,
            reason: "docs",
            organizationId: orgData._id as Id<"organizations">,
            eventId: eventData._id as Id<"events">,
            openCallId: openCallData._id
              ? (openCallData._id as Id<"openCalls">)
              : undefined,
          });
        }
        const documents = saveResults.map((saved, i) => {
          const matched = openCallFiles?.find(
            (original) => original.storageId === saved.storageId,
          );

          return {
            id: saved.id,
            title:
              matched?.fileName ??
              `${eventData.name}(${eventData.dates.edition}) - Document ${i + 1}`,
            href: saved.url,
          };
        });

        try {
          setPending(true);
          const ocResult = await createOrUpdateOpenCall({
            orgId: orgData._id as Id<"organizations">,
            eventId: eventData._id as Id<"events">,
            openCallId: openCallData?._id as Id<"openCalls">,
            basicInfo: {
              appFee: openCallData.basicInfo?.appFee ?? 0,
              callFormat: openCallData.basicInfo.callFormat ?? "RFQ",
              callType: eventData.hasOpenCall ?? "False",
              dates: {
                ocStart: openCallData.basicInfo?.dates?.ocStart ?? "",
                ocEnd: openCallData.basicInfo?.dates?.ocEnd ?? "",
                timezone: orgData.location?.timezone ?? "",
                edition: eventData.dates.edition,
              },
            },
            eligibility: {
              type: openCallData.eligibility.type,
              whom: openCallData.eligibility?.whom ?? [],
              details: openCallData.eligibility.details,
            },
            compensation: {
              budget: {
                hasBudget:
                  openCallData.compensation?.budget?.hasBudget ?? false,
                min: openCallData.compensation?.budget?.min ?? 0,
                max: openCallData.compensation?.budget?.max ?? 0,
                rate: openCallData.compensation?.budget?.rate ?? 0,
                unit: openCallData.compensation?.budget?.unit ?? "",
                currency: orgData.location?.currency?.code ?? "",
                allInclusive:
                  openCallData.compensation?.budget?.allInclusive ?? false,
                moreInfo: openCallData.compensation?.budget?.moreInfo,
              },
              categories: {
                artistStipend:
                  openCallData.compensation?.categories?.artistStipend ??
                  undefined,
                designFee:
                  openCallData.compensation?.categories?.designFee ?? undefined,
                accommodation:
                  openCallData.compensation?.categories?.accommodation ??
                  undefined,
                food: openCallData.compensation?.categories?.food ?? undefined,
                travelCosts:
                  openCallData.compensation?.categories?.travelCosts ??
                  undefined,
                materials:
                  openCallData.compensation?.categories?.materials ?? undefined,
                equipment:
                  openCallData.compensation?.categories?.equipment ?? undefined,
              },
            },
            requirements: {
              requirements: openCallData.requirements.requirements,
              more: "reqsMore",
              destination: "reqsDestination",
              links: openCallData.requirements.links,
              applicationLink: openCallData.requirements.applicationLink,
              applicationLinkFormat:
                openCallData.requirements.applicationLinkFormat,
              applicationLinkSubject:
                openCallData.requirements.applicationLinkSubject,
              otherInfo: openCallData.requirements.otherInfo,
            },
            documents,
            paid: openCallData.paid ?? false,
          });

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

          // reset({
          //   ...currentValues,
          //   openCall: {
          //     ...(ocResult || currentValues.openCall),
          //   },
          // });
          reset(
            merge({}, currentValues, {
              openCall: {
                ...(ocResult || currentValues.openCall),
              },
            }),
          );
        } catch (error) {
          console.error("Failed to create or update open call:", error);
          toast.error("Failed to create or update open call");
        } finally {
          setPending(false);
        }
      }
      if (activeStep === 4 && hasUserEditedForm) {
        if (!openCallData) return;

        try {
          setPending(true);
          await createOrUpdateOpenCall({
            orgId: orgData._id as Id<"organizations">,
            eventId: eventData._id as Id<"events">,
            openCallId: openCallData?._id as Id<"openCalls">,
            basicInfo: {
              appFee: openCallData.basicInfo?.appFee ?? 0,
              callFormat: openCallData.basicInfo.callFormat ?? "RFQ",
              callType: eventData.hasOpenCall ?? "False",
              dates: {
                ocStart: openCallData.basicInfo?.dates?.ocStart ?? "",
                ocEnd: openCallData.basicInfo?.dates?.ocEnd ?? "",
                timezone: orgData.location?.timezone ?? "",
                edition: eventData.dates.edition,
              },
            },
            eligibility: {
              type: openCallData.eligibility.type,
              whom: openCallData.eligibility?.whom ?? [],
              details: openCallData.eligibility.details,
            },
            compensation: {
              budget: {
                hasBudget: openCallData.compensation.budget.hasBudget ?? false,
                min: openCallData.compensation.budget.min,
                max: openCallData.compensation.budget.max,
                rate: openCallData.compensation.budget.rate,
                unit: openCallData.compensation.budget.unit,
                currency: openCallData.compensation.budget.currency,
                allInclusive: openCallData.compensation.budget.allInclusive,
                moreInfo: openCallData.compensation.budget.moreInfo,
              },
              categories: {
                artistStipend:
                  openCallData.compensation.categories.artistStipend,
                designFee: openCallData.compensation.categories.designFee,
                accommodation:
                  openCallData.compensation.categories.accommodation,
                food: openCallData.compensation.categories.food,
                travelCosts: openCallData.compensation.categories.travelCosts,
                materials: openCallData.compensation.categories.materials,
                equipment: openCallData.compensation.categories.equipment,
              },
            },
            requirements: {
              requirements: openCallData.requirements.requirements,
              more: undefined,
              destination: undefined,
              links: openCallData.requirements.links,
              applicationLink: openCallData.requirements.applicationLink,
              applicationLinkFormat:
                openCallData.requirements.applicationLinkFormat,
              applicationLinkSubject:
                openCallData.requirements.applicationLinkSubject,
              otherInfo: openCallData.requirements.otherInfo,
            },
            documents: openCallData.documents as
              | {
                  id: Id<"openCallFiles">;
                  title: string;
                  href: string;
                }[]
              | undefined,
            paid: openCallData.paid ?? false,
          });
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
            openCall: {
              ...currentValues.openCall,
            },
          });
        } catch (error) {
          console.error("Failed to create or update open call:", error);
          toast.error("Failed to create or update open call");
        } finally {
          setPending(false);
        }
      }
      if (activeStep === steps.length - 2) {
        // console.log("saving org details");

        try {
          setPending(true);
          // console.log("orgData presave", orgData);

          const result = await updateOrg({
            orgId: orgData._id as Id<"organizations">,
            name: orgData.name,
            slug:
              existingOrg?.slug ??
              slugify(orgData.name?.trim(), { lower: true, strict: true }),
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
            isComplete: true,
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

          // console.log("result", result);

          setPending(false);
        } catch (error) {
          console.error("Failed to submit event:", error);
          toast.error("Failed to submit event");
          setPending(false);
        }
      }
      if (activeStep === steps.length - 1) {
        let eventResult = null;
        const eventLinks =
          eventData.links && Object.keys(eventData.links).length > 1
            ? eventData.links
            : orgData.links && {
                ...orgData.links,
                sameAsOrganizer: true,
              };

        // console.log(eventLinks);
        try {
          setPending(true);

          if (existingOrg?.isComplete !== true) {
            await markOrganizationComplete({
              orgId: (orgData?._id || existingOrg?._id) as Id<"organizations">,
            });
          }

          const { event } = await createOrUpdateEvent({
            formType,
            _id: eventData._id || "",
            name: eventData.name,
            slug:
              existingEvent?.slug ??
              slugify(eventData.name, { lower: true, strict: true }),
            logo: eventData.logo as string,
            type: eventData.type || [],
            category: eventData.category ?? "event",
            hasOpenCall:
              eventData.hasOpenCall ?? (eventOnly ? "False" : "Fixed"),
            dates: {
              ...eventData.dates,
            },
            location: {
              ...eventData.location,
            },
            about: eventData.about,
            links: eventLinks,
            otherInfo: eventData.otherInfo || undefined,
            timeLine: eventData.timeLine,
            adminNote: eventData.adminNote || undefined,

            active: eventData.active,

            finalStep,
            publish,
            orgId: orgData._id as Id<"organizations">,
          });
          if (hasOpenCall && openCallData) {
            await createOrUpdateOpenCall({
              orgId: orgData._id as Id<"organizations">,
              eventId: eventData._id as Id<"events">,
              openCallId: openCallData?._id as Id<"openCalls">,
              basicInfo: {
                appFee: openCallData.basicInfo?.appFee ?? 0,
                callFormat: openCallData.basicInfo.callFormat,
                callType: eventData.hasOpenCall ?? "False",
                dates: {
                  ocStart: openCallData.basicInfo?.dates?.ocStart ?? "",
                  ocEnd: openCallData.basicInfo?.dates?.ocEnd ?? "",
                  timezone: orgData.location?.timezone ?? "",
                  edition: eventData.dates.edition,
                },
              },
              eligibility: {
                type: openCallData.eligibility.type,
                whom: openCallData.eligibility?.whom ?? [],
                details: openCallData.eligibility.details,
              },
              compensation: {
                budget: {
                  hasBudget:
                    openCallData.compensation.budget.hasBudget ?? false,
                  min: openCallData.compensation.budget.min,
                  max: openCallData.compensation.budget.max,
                  rate: openCallData.compensation.budget.rate,
                  unit: openCallData.compensation.budget.unit,
                  currency: openCallData.compensation.budget.currency,
                  allInclusive: openCallData.compensation.budget.allInclusive,
                  moreInfo: openCallData.compensation.budget.moreInfo,
                },
                categories: {
                  artistStipend:
                    openCallData.compensation.categories.artistStipend,
                  designFee: openCallData.compensation.categories.designFee,
                  accommodation:
                    openCallData.compensation.categories.accommodation,
                  food: openCallData.compensation.categories.food,
                  travelCosts: openCallData.compensation.categories.travelCosts,
                  materials: openCallData.compensation.categories.materials,
                  equipment: openCallData.compensation.categories.equipment,
                },
              },
              requirements: {
                requirements: openCallData.requirements.requirements,
                more: undefined,
                destination: undefined,

                links: openCallData.requirements.links,
                applicationLink: openCallData.requirements.applicationLink,
                applicationLinkFormat:
                  openCallData.requirements.applicationLinkFormat,
                applicationLinkSubject:
                  openCallData.requirements.applicationLinkSubject,
                otherInfo: openCallData.requirements.otherInfo,
              },
              documents: openCallData.documents as
                | {
                    id: Id<"openCallFiles">;
                    title: string;
                    href: string;
                  }[]
                | undefined,
              state: publish ? "published" : "submitted",
              finalStep,
              approved: publish,
              paid: formType === 3 && !alreadyPaid ? false : true,
            });
          }
          eventResult = event;
          setExistingEvent(eventResult);
        } catch (error) {
          console.error("Failed to submit:", error);
          toast.error("Failed to submit");
        } finally {
          setPending(false);
          if (isAdmin) {
            window.location.href = "/dashboard/admin/event";
          }
        }
      }
    },
    [
      isAdmin,
      finalStep,
      alreadyPaid,
      formType,
      eventOnly,
      saveOrgFile,
      hasOpenCall,
      openCallData,
      createOrUpdateOpenCall,
      markOrganizationComplete,

      orgData,
      generateUploadUrl,
      getTimezone,
      createNewOrg,
      existingOrg,
      reset,
      activeStep,
      hasUserEditedForm,
      eventData,
      eventLinks,
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
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", newUrl);
    window.location.reload();
  };

  const updateLastChanged = useMemo(
    () =>
      debounce(() => {
        lastChangedRef.current = Date.now();
      }, 500),
    [],
  );
  // #endregion

  // #region -------------UseEffects --------------
  // console.log(eventData);
  useEffect(() => {
    console.log(formType, hasUserEditedForm);
  }, [formType, hasUserEditedForm]);
  useEffect(() => {
    if (eventFormType === undefined || eventFormType === 0 || formType !== 0)
      return;
    if (eventFormType > 0 && formType === 0) {
      setFormType(eventFormType);
    } else {
      setFormType(1);
    }
  }, [eventFormType, formType]);

  useEffect(() => {
    if (!preloadData) return;
    const { event, organization } = preloadData;
    preloadFlag.current = true;
    if (organization) {
      preloadOrgRef.current = true;
      setExistingOrg(organization);
      if (event) {
        preloadEventRef.current = true;
        setExistingEvent(event);
      }
    }
  }, [preloadData]);

  useEffect(() => {
    if (!alreadyPaid) return;
    if (alreadyPaid) {
      setAcceptedTerms(true);
    }
  }, [alreadyPaid]);

  useEffect(() => {
    if (hasUserEditedForm) {
      updateLastChanged();
    }
  }, [watchedValues, updateLastChanged, hasUserEditedForm]);

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
      // console.log("errors changed", serialized);
      if (serialized !== prevErrorJson.current) {
        // console.log("error changed");
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
    // console.log(isStepValidZod, hasUserEditedForm, canCheckSchema.current);
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

  //NOTE: Removing autosave for admin version of form. For now. I don't want to accidentally save over a submission while viewing it.
  // useEffect(() => {
  //   if (!isValid || !hasUserEditedForm || pending || activeStep === 0) return;
  //   const interval = setInterval(() => {
  //     // console.log("checking");
  //     const now = Date.now();

  //     const last =
  //       typeof lastSaved === "number"
  //         ? lastSaved
  //         : new Date(lastSaved ?? 0).getTime();
  //     const lastChanged = lastChangedRef.current ?? 0;
  //     const shouldSave = now - last >= 60000 && now - lastChanged >= 15000;
  //     // console.log(now, last);

  //     if (shouldSave) {
  //       handleSave().then(() => {
  //         // console.log("Autosaved at", new Date().toLocaleTimeString());
  //         setPending(false);
  //       });
  //     }
  //   }, 5000); // check every 5 seconds (adjustable)

  //   return () => clearInterval(interval);
  // }, [isValid, lastSaved, hasUserEditedForm, pending, handleSave, activeStep]);

  useEffect(() => {
    if (!existingOrg) return;
    if (existingOrg?._id === prevOrgRef.current?._id) return;
    const orgReady =
      existingOrg &&
      typeof existingOrg._id === "string" &&
      existingOrg._id.length > 0;

    const orgChanged = orgReady && existingOrg._id !== prevOrgRef.current?._id;

    if (orgChanged && !preloadOrgRef.current) {
      console.log("meow meow mcPoundTown");

      // console.log("resetting");
      setFurthestStep(0);
      reset({
        organization: {
          ...existingOrg,
        },
        event: {
          formType: 1,
          name: "",
        },
      });
      prevOrgRef.current = existingOrg;
    } else {
      setLastSaved(null);
    }
  }, [existingOrg, reset]);

  useEffect(() => {
    if (
      existingOrg &&
      existingEvent &&
      preloadOrgRef.current &&
      preloadEventRef.current
    ) {
      prevEventRef.current = existingEvent;
      reset({
        organization: {
          ...existingOrg,
        },
        event: {
          ...existingEvent,
        },
      });
      setNewOrgEvent(false);
      setSelectedRow({ 1: true });
      preloadOrgRef.current = false;
      preloadEventRef.current = false;
    }
  }, [existingOrg, existingEvent, reset, preloadOrgRef]);

  useEffect(() => {
    if (existingEvent?._id === undefined) return;
    if (existingEvent?._id === prevEventRef.current?._id) return;
    const eventReady =
      existingEvent &&
      typeof existingEvent._id === "string" &&
      existingEvent._id.length > 0;
    if (!eventReady && !existingEvent && prevEventRef.current !== null) {
      prevEventRef.current = null;
    }
    console.log(existingEvent?._id, prevEventRef.current?._id);
    const eventChanged =
      eventReady && existingEvent._id !== prevEventRef.current?._id;
    if (eventChanged && !preloadEventRef.current) {
      preloadFlag.current = false;
      // if (prevEventRef.current) {
      //   router.push("/dashboard/admin/event");
      // }
      isFirstRun.current = true;
      if (existingEvent?.lastEditedAt) {
        setLastSaved(existingEvent.lastEditedAt);
      } else if (existingEvent?._creationTime) {
        setLastSaved(existingEvent._creationTime);
      }
      // console.log("resetting event");
      setFormType(existingEvent?.formType ?? formType);
      reset({
        ...currentValues,
        event: {
          ...existingEvent,
          formType: existingEvent?.formType ?? formType,
          category: existingEvent?.category ?? "event",
          hasOpenCall: existingEvent?.hasOpenCall ?? "Unknown",
        },
        openCall: {
          ...(ocData ?? {}),
        },
      });
      prevEventRef.current = existingEvent;
      canClearEventData.current = true;
    } else if (!existingEvent) {
      setLastSaved(null);
    }
  }, [existingEvent, reset, currentValues, ocData, formType, router]);

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

  useEffect(() => {
    setFurthestStep((prev) => Math.max(prev, activeStep));
  }, [activeStep, furthestStep]);

  useEffect(() => {
    if (selectedRow && Object.keys(selectedRow).length > 0) {
      canClearEventData.current = true;
    } else if (isSelectedRowEmpty) {
      setNewOrgEvent(true);
    }
  }, [selectedRow, isSelectedRowEmpty]);

  //todo: if necessary, perhaps unregister open call in this?
  useEffect(() => {
    if (clearEventDataTrigger && !preloadFlag.current) {
      // console.log("hmm");
      setFurthestStep(0);
      setSelectedRow({});
      // console.log("clearing event data", eventData);
      reset({
        organization: {
          ...currentValues.organization,
          logo: currentValues?.organization?.logo || "/1.jpg",
        },

        event: {
          formType,
          name: "",
          logo: currentValues?.organization?.logo || "/1.jpg",
          location: {
            ...(currentValues?.organization?.location ?? {}),
            sameAsOrganizer: true,
          },
        },
      });
      canClearEventData.current = false;
    }
  }, [clearEventDataTrigger, reset, currentValues, eventData, formType]);

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
    if (!orgData?.name && activeStep > 0) {
      setActiveStep(0);
    }
  }, [orgData, activeStep, setActiveStep]);

  // 1. Create a stable callback that saves and then closes:

  useEffect(() => {
    if (!hasOpenCall) {
      setSkipped(new Set([3, 4]));
    } else if (hasOpenCall) {
      setSkipped(new Set());
    }
  }, [hasOpenCall]);

  useEffect(() => {
    if (!openCallSuccess) return;
    if (ocData) {
      // console.log(ocData);
      setValue("openCall", ocData);
    }
  }, [openCallSuccess, ocData, setValue, reset]);

  useEffect(() => {
    const prodStart = getValues("event.dates.prodDates.0.start");
    if (!noProdStart || !prodStart) return;
    if (noProdStart && prodStart) {
      setValue("event.dates.noProdStart", false);
    }
  }, [prodDatesStart, noProdStart, setValue, getValues]);
  // #endregion
  return (
    <>
      <HorizontalLinearStepper
        isAdmin={isAdmin}
        isMobile={isMobile}
        onCheckSchema={handleCheckSchema}
        errorMsg={errorMsg}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNextStep={handleNextStep}
        onBackStep={handleBackStep}
        steps={steps}
        skipped={skipped}
        className="px-2 xl:px-8"
        finalLabel={alreadyPaid || alreadyApproved ? "Update" : "Submit"}
        onFinalSubmit={handleSubmit(() => onSubmit())}
        isDirty={hasUserEditedForm}
        onSave={() => handleSave(true)}
        onPublish={() => handleSave(true, true)}
        lastSaved={lastSavedDate}
        disabled={!isValid || pending || (finalStep && !userAcceptedTerms)}
        pending={pending}
        adminMode={isAdmin}
        formType={formType}
        setFormType={setFormType}
        formTypeOptions={formTypeOptions}
        cancelButton={
          <Button
            type="button"
            variant="salWithShadowHiddenYlw"
            className="hidden lg:min-w-24"
            onClick={onCancel}
          >
            Cancel
          </Button>
        }
      >
        <div ref={topRef} />
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(() => {
              // console.log("submitting:", data);
              onSubmit();
            })}
            className="flex h-full min-h-96 grow flex-col p-4 xl:mx-auto xl:max-w-[1500px] 3xl:max-w-[2000px]"
          >
            {/* //------ 1st Step: Org & Event Selection ------ */}
            {activeStep === 0 && (
              <SubmissionFormOrgStep
                dashboardView={true}
                isAdmin={isAdmin}
                isMobile={isMobile}
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
                preloadFlag={preloadFlag.current}
              />
            )}
            {/* //------ 2nd: Event Basics  ------ */}
            {activeStep === 1 && (
              <SubmissionFormEventStep1
                user={user}
                isAdmin={isAdmin}
                isMobile={isMobile}
                existingOrg={existingOrg}
                categoryEvent={categoryEvent}
                canNameEvent={canNameEvent}
                existingEvent={existingEvent}
                formType={formType}
              />
            )}

            {/* //------ 3rd Step: Event Details  ------ */}

            {activeStep === 2 && (
              <SubmissionFormEventStep2
                user={user}
                isAdmin={isAdmin}
                isMobile={isMobile}
                existingOrg={existingOrg}
                categoryEvent={categoryEvent}
                canNameEvent={canNameEvent}
                existingEvent={existingEvent}
                handleCheckSchema={() => handleCheckSchema(false)}
                formType={formType}
              />
            )}
            {/* //------ 4th Step: OC Start & Budget  ------ */}

            {activeStep === 3 && (
              <SubmissionFormOC1
                user={user}
                isAdmin={isAdmin}
                isMobile={isMobile}
                categoryEvent={categoryEvent}
                canNameEvent={canNameEvent}
                handleCheckSchema={() => handleCheckSchema(false)}
                formType={formType}
                pastEvent={pastEvent}
              />
            )}
            {/* //------ 5th Step: OC Reqs & Other Info  ------ */}
            {activeStep === 4 && (
              <SubmissionFormOC2
                user={user}
                isAdmin={isAdmin}
                isMobile={isMobile}
                categoryEvent={categoryEvent}
                canNameEvent={canNameEvent}
                handleCheckSchema={() => handleCheckSchema(false)}
                formType={formType}
                pastEvent={pastEvent}
              />
            )}

            {/* //------ 6th Step: Organization Details  ------ */}

            {activeStep === steps.length - 2 && (
              <SubmissionFormOrgStep2
                handleCheckSchema={() => handleCheckSchema(false)}
              />
            )}
            {/* //------ Final Step: Recap  ------ */}
            {activeStep === steps.length - 1 && (
              <>
                {/* <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded bg-muted p-4 text-sm lg:max-w-[90dvw]">
                  {JSON.stringify(getValues(), null, 2)}
                </pre> */}
                <SubmissionFormRecapDesktop
                  formType={formType}
                  isAdmin={isAdmin}
                  setAcceptedTerms={setAcceptedTerms}
                  acceptedTerms={acceptedTerms}
                  submissionCost={submissionCost?.price}
                  isEligibleForFree={true}
                  alreadyPaid={alreadyPaid}
                />
                {isMobile && (
                  <SubmissionFormRecapMobile
                    formType={formType}
                    isAdmin={isAdmin}
                    setAcceptedTerms={setAcceptedTerms}
                    acceptedTerms={acceptedTerms}
                    submissionCost={submissionCost?.price}
                    isEligibleForFree={true}
                    alreadyPaid={alreadyPaid}
                  />
                )}
              </>
            )}

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
