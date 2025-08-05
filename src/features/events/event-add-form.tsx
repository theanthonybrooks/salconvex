import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  eventDetailsSchema,
  eventOnlySchema,
  eventWithOCSchema,
  openCallStep1Schema,
  openCallStep2Schema,
  orgDetailsSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";

import { DialogCloseBtn } from "@/components/ui/dialog-close-btn";
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
import { cn } from "@/lib/utils";
import { EnrichedEvent, EventCategory } from "@/types/event";
import { validOCVals } from "@/types/openCall";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
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

export const steps = [
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
    label: "Event/Project Details Pt.2",
    mobileLabel: "Event/Project Details",
    schema: eventDetailsSchema,
  },
  {
    id: 4,
    label: "Open Call",
    mobileLabel: "Open Call",
    schema: openCallStep1Schema,
  },
  {
    id: 5,
    label: "Budget & Compensation",
    mobileLabel: "Budget/Compensation",
    schema: openCallStep2Schema,
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
    // schema: eventSubmitSchema,
    schema: eventWithOCSchema,
  },
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
  isEligibleForFree: boolean;
  planKey: string;
}

export type EventOCFormValues = z.infer<typeof eventWithOCSchema>;

export const EventOCForm = ({
  user,
  // onClick,
  shouldClose,
  setOpen,
  setShouldClose,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  activeStep,
  setActiveStep,
  isEligibleForFree,
  planKey,
}: EventOCFormProps) => {
  const finalStep = activeStep === steps.length - 1;
  const isAdmin = user?.role?.includes("admin") || false;
  const formType = Number(planKey);
  const eventOnly = formType === 1;
  // const freeCall = formType === 2;
  const paidCall = formType === 3 && !isAdmin;
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
        hasOpenCall: !eventOnly ? "Fixed" : "False",
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

  // const paidCall = formType === 3 && !isAdmin;

  const currentValues = getValues();
  const getTimezone = useAction(api.actions.getTimezone.getTimezone);
  const getCheckoutUrl = useAction(
    api.stripeSubscriptions.createStripeCheckoutSession,
  );
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
  const [newOrgEvent, setNewOrgEvent] = useState(true);
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
    // console.log(result);
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
  const hasClosed = useRef(false);
  const isFirstRun = useRef(true);
  const savedState = useRef(false);
  // #endregion
  // #region ------------- Watch --------------
  const orgData = watch("organization");
  const eventData = watch("event");
  const openCallData = watch("openCall");
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

  const pastEvent = !!openCallEnd && openCallEnd < now;
  //note-to-self: this is what's hiding the open call sections from users (non-admins). The idea being that they shouldn't be able to change anything. Perhaps the better way would be to still show it, but have it disabled/read only? It's confusing at the moment.
  const hasOpenCall = validOCVals.includes(eventOpenCall) && formType !== 1;

  const eventName = eventData?.name;
  const eventSlug = eventData?.slug;
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
  const categoryEvent = category === "event" || formType === 1;

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
  const prevOrgRef = useRef(existingOrg);
  const prevEventRef = useRef(existingEvent);
  const validStep1 =
    activeStep > 0
      ? !!(eventName && eventName.trim().length >= 3 && !!eventDatesFormat)
      : true;
  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;
  const isValid =
    validOrgWZod && isStepValidZod && eventChoiceMade && validStep1;

  const hasErrors = !!errors && Object.keys(errors).length > 0;

  const projectBudget = ocData?.compensation?.budget;
  const projectMaxBudget = projectBudget?.max;
  const projectMinBudget = projectBudget?.min;
  const projectBudgetAmt = (projectMaxBudget || projectMinBudget) ?? 0;
  const submissionCost = getOcPricing(projectBudgetAmt);
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
  // console.log(errors);
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

  //
  //
  //
  // #region -------------Used Function --------------
  // const onCancel = () => {
  //   setActiveStep(0);
  // };

  const submissionUrl = `${
    eventSlug || existingEvent?.slug
  }/${eventData?.dates?.edition}${hasOpenCall ? "/call" : ""}`;

  const onSubmit = async () => {
    let url: string | undefined;
    let newTab: Window | null = null;
    // console.log(paidCall);
    // console.log("data", data);
    if (paidCall && !alreadyPaid && !isAdmin) {
      newTab = window.open("about:blank");
    }

    try {
      // console.log("organizer mode)");
      setValue("event.state", "submitted");
      console.log(existingOrg?.isComplete);

      await handleSave(true);

      if (paidCall && !alreadyPaid) {
        const result = await getCheckoutUrl({
          planKey,
          slidingPrice:
            typeof submissionCost?.price === "number" &&
            submissionCost?.price > 0
              ? submissionCost?.price
              : 50,
          accountType: "organizer",
          isEligibleForFree,
          openCallId: ocData?._id as Id<"openCalls">,
        });
        url = result.url;
      }
      if (!paidCall) {
        toast.success(
          alreadyPaid || alreadyApproved
            ? "Successfully updated project!"
            : "Successfully submitted event!",
          {
            onClick: () => toast.dismiss(),
          },
        );
      }
      // console.log("submitting: ", paidCall, isAdmin);
      if (paidCall && !alreadyPaid && !isAdmin) {
        if (!newTab) {
          toast.error(
            "Stripe redirect blocked. Please enable popups for this site.",
          );
          console.error("Popup was blocked");
          return;
        }
        if (url) {
          newTab.document.write(getExternalRedirectHtml(url, 1));
          newTab.document.close();
          newTab.location.href = url;
          // onClick();
          // onClick()
        }
      } else {
        //TODO: Make some sort of confirmation page and/or forward the user to... dashboard? The list? Their event (?)
        // handleReset();
        setOpen(false);
      }
      setTimeout(() => {
        window.location.href = `/thelist/event/${submissionUrl}`;
      }, 1000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
      if (!newTab?.closed) {
        newTab?.document.close();
      }
    }
  };
  const handleNextStep = async () => {
    const isStepValid = handleCheckSchema();
    if (!isStepValid) return;
    if (hasUserEditedForm) {
      // console.log("hasUserEditedForm 440");
      await handleSave();
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
    if (activeStep === 0 && !hasUserEditedStep0 && furthestStep === 0) {
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
              category: !eventOnly ? eventData.category : "event",

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
            category: !eventOnly ? eventData.category : "event",

            dates: {
              edition: new Date().getFullYear(),
              noProdStart: false,
            },
            links: {
              ...eventLinks,
            },
            //TODO: cOME BACK TO THIS!
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
        // const firstMessage =
        //   issues.find(
        //     (i) =>
        //       i.message &&
        //       i.message !== "Required" &&
        //       i.message !== "Invalid input",
        //   )?.message ?? issues[0]?.message;
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
      // console.log(hasUserEditedStep0);
      if (hasUserEditedStep0) {
        // console.log("user edited step 0");
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
        // console.log(result);
        try {
          setPending(true);
          const { org } = await createNewOrg({
            organizationName: orgData.name?.trim(),
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
      if (activeStep === 1 && hasUserEditedEventSteps) {
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
            category: !eventOnly ? eventData.category : "event",
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
            timeLine: eventData.timeLine,
            links: eventData.links,
            otherInfo: eventData.otherInfo || undefined,
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
      if (activeStep === 2 && hasUserEditedEventSteps) {
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
            category: !eventOnly ? eventData.category : "event",
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
      if (activeStep === 3 && hasUserEditedStep3) {
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
              appFee: paidCall ? openCallData.basicInfo.appFee : 0,
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
                  projectBudget?.hasBudget ??
                  openCallData.compensation?.budget?.hasBudget ??
                  (formType === 3 ? true : false),
                min:
                  projectBudget?.min ??
                  openCallData.compensation?.budget?.min ??
                  0,
                max:
                  projectBudget?.max ??
                  openCallData.compensation?.budget?.max ??
                  0,
                rate:
                  projectBudget?.rate ??
                  openCallData.compensation?.budget?.rate ??
                  0,
                unit:
                  projectBudget?.unit ??
                  openCallData.compensation?.budget?.unit ??
                  "",
                currency: orgData.location?.currency?.code ?? "",
                allInclusive:
                  projectBudget?.allInclusive ??
                  openCallData.compensation?.budget?.allInclusive ??
                  false,
                moreInfo:
                  projectBudget?.moreInfo ??
                  openCallData.compensation?.budget?.moreInfo,
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
      if (activeStep === 4 && hasUserEditedStep4) {
        if (!openCallData) return;

        try {
          setPending(true);
          await createOrUpdateOpenCall({
            orgId: orgData._id as Id<"organizations">,
            eventId: eventData._id as Id<"events">,
            openCallId: openCallData?._id as Id<"openCalls">,
            basicInfo: {
              appFee: paidCall ? openCallData.basicInfo.appFee : 0,
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
                  openCallData.compensation?.budget?.hasBudget ??
                  (formType === 3 ? true : false),
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
            name: orgData.name?.trim(),
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
        // console.log("saving final step");
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
            category: !eventOnly ? eventData.category : "event",
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
                appFee: paidCall ? openCallData.basicInfo.appFee : 0,
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
                    openCallData.compensation?.budget?.hasBudget ??
                    (formType === 3 ? true : false),
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
          setOpen(false);
        }
      }
    },
    [
      projectBudget,
      paidCall,
      finalStep,
      alreadyPaid,
      formType,
      eventOnly,
      saveOrgFile,
      setOpen,
      hasOpenCall,
      openCallData,
      createOrUpdateOpenCall,
      hasUserEditedStep0,
      hasUserEditedStep3,
      hasUserEditedStep4,
      orgData,
      generateUploadUrl,
      getTimezone,
      createNewOrg,
      existingOrg,
      reset,
      activeStep,
      hasUserEditedEventSteps,
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
      markOrganizationComplete,
    ],
  );

  const handleReset = () => {
    setActiveStep(0);
    setFurthestStep(0);
    setSelectedRow({ 0: false });
    setExistingOrg(null);
    prevOrgRef.current = null;
    isFirstRun.current = true;
    lastChangedRef.current = null;
    setExistingEvent(null);
    setNewOrgEvent(true);
    // reset();
    reset({
      organization: {
        name: "",
        logo: "",
        location: { ...orgData.location, full: "" },
      },
      event: {
        formType,
        name: "",
        logo: "/1.jpg",
        location: { ...orgData.location, full: "" },
        hasOpenCall: "False",
      },
      openCall: {
        basicInfo: {
          appFee: 0,
        },
        eligibility: {
          whom: [],
        },
      },
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
  // #endregion

  // #region -------------UseEffects --------------

  useEffect(() => {
    if (eventData?.formType) {
      if (formType > eventData.formType) {
        setValue("event.formType", formType);
      }
      // console.log(eventData.formType, formType);
    }
  }, [eventData, formType, setValue]);

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

  useEffect(() => {
    if (!isValid || !hasUserEditedForm || pending || activeStep === 0) return;
    const interval = setInterval(() => {
      // console.log("checking");
      const now = Date.now();

      const last =
        typeof lastSaved === "number"
          ? lastSaved
          : new Date(lastSaved ?? 0).getTime();
      const lastChanged = lastChangedRef.current ?? 0;
      const shouldSave = now - last >= 60000 && now - lastChanged >= 15000;
      // console.log(now, last);

      if (shouldSave) {
        handleSave().then(() => {
          // console.log("Autosaved at", new Date().toLocaleTimeString());
          setPending(false);
        });
      }
    }, 5000); // check every 5 seconds (adjustable)

    return () => clearInterval(interval);
  }, [isValid, lastSaved, hasUserEditedForm, pending, handleSave, activeStep]);

  useEffect(() => {
    if (!existingOrg) return;
    if (existingOrg?._id === prevOrgRef.current?._id) return;
    const orgReady =
      existingOrg &&
      typeof existingOrg._id === "string" &&
      existingOrg._id.length > 0;

    const orgChanged = orgReady && existingOrg._id !== prevOrgRef.current?._id;

    if (orgChanged) {
      // console.log("resetting");
      setFurthestStep(0);
      reset({
        organization: {
          ...existingOrg,
        },
        event: {
          formType,
          name: "",
        },
      });
      prevOrgRef.current = existingOrg;
    } else {
      setLastSaved(null);
    }
  }, [existingOrg, reset, getValues, formType, orgData]);

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
      // console.log("resetting event");
      reset({
        ...currentValues,
        event: {
          formType,
          ...existingEvent,
          category: !eventOnly ? existingEvent.category : "event",
          hasOpenCall:
            existingEvent.hasOpenCall ?? (eventOnly ? "False" : "Fixed"),
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
  }, [existingEvent, reset, currentValues, ocData, eventOnly, formType]);

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
    if (newOrgEvent) return;
    if (!newOrgEvent && isSelectedRowEmpty) {
      setSelectedRow({ 0: true });
    }
  }, [newOrgEvent, isSelectedRowEmpty]);

  useEffect(() => {
    if (selectedRow && Object.keys(selectedRow).length > 0) {
      canClearEventData.current = true;
    } else if (isSelectedRowEmpty) {
      setNewOrgEvent(true);
    }
  }, [selectedRow, isSelectedRowEmpty]);

  //todo: if necessary, perhaps unregister open call in this?
  useEffect(() => {
    if (clearEventDataTrigger) {
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
          logo: currentValues?.organization?.logo || "",
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
        cancelButton={
          <DialogCloseBtn
            className="w-full"
            title={
              hasUnsavedChanges
                ? "Discard unsaved changes?"
                : "Exit submission form?"
            }
            description={
              activeStep > 0
                ? hasUnsavedChanges
                  ? "Sure? You can always start the submission process at a later time. Save your event to a draft in your dashboard."
                  : "Sure? You can always continue the submission process at a later time. We've saved your event to a draft in your dashboard."
                : "Sure? You can always start the submission process at a later time. "
            }
            actionTitle={hasUnsavedChanges ? "Discard" : "Exit"}
            cancelTitle={hasUnsavedChanges ? "Cancel" : "Back"}
            primaryActionTitle="Save & Exit"
            onAction={() => {
              setOpen(false);
            }}
            onPrimaryAction={
              activeStep > 0 && hasUnsavedChanges
                ? () => {
                    handleSave();
                    setOpen(false);
                  }
                : undefined
            }
            // triggerVariant="salWithShadowHiddenPink"
            triggerTitle="Cancel"
            triggerSize="default"
            triggerClassName={cn(activeStep === 0 && isMobile && "flex-1")}
            type="button"
          />
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
                  isEligibleForFree={isEligibleForFree}
                  alreadyPaid={alreadyPaid}
                />
                {isMobile && (
                  <SubmissionFormRecapMobile
                    formType={formType}
                    isAdmin={isAdmin}
                    setAcceptedTerms={setAcceptedTerms}
                    acceptedTerms={acceptedTerms}
                    submissionCost={submissionCost?.price}
                    isEligibleForFree={isEligibleForFree}
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
