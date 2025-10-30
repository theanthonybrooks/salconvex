//TODO: Replace current loading/reloading logic with queries first, then using that data in the default values. Reset when the search param is changed. perhaps also just combine multiple forms rather than one giant one. I don't know why I went that approach anyways?

import { validOCVals } from "@/constants/openCallConsts";

import { EnrichedEvent, EventCategory } from "@/types/eventTypes";
import { OpenCallState } from "@/types/openCallTypes";
import { User } from "@/types/user";

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce, merge } from "lodash";
import { FormProvider, Path, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";
import { z } from "zod";

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
import { DialogCloseBtn } from "@/components/ui/dialog-close-btn";
import HorizontalLinearStepper from "@/components/ui/stepper";
import SubmissionFormEventStep1 from "@/features/events/submission-form/steps/submission-form-event-1";
import SubmissionFormEventStep2 from "@/features/events/submission-form/steps/submission-form-event-2";
import SubmissionFormOC1 from "@/features/events/submission-form/steps/submission-form-oc-1";
import SubmissionFormOC2 from "@/features/events/submission-form/steps/submission-form-oc-2";
import SubmissionFormOrgStep from "@/features/events/submission-form/steps/submission-form-org-1";
import SubmissionFormOrgStep2 from "@/features/events/submission-form/steps/submission-form-org-2";
import { SubmissionFormRecapDesktop } from "@/features/events/submission-form/steps/submission-form-recap-desktop";
import { SubmissionFormRecapMobile } from "@/features/events/submission-form/steps/submission-form-recap-mobile";
import {
  eventWithOCSchema,
  getEventDetailsSchema,
  getEventOnlySchema,
  getEventWithOCSchema,
  getOpenCallStep1Schema,
  openCallStep2Schema,
  orgDetailsSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";
import { toSeason, toYear, toYearMonth } from "@/helpers/dateFns";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { getOcPricing } from "@/helpers/pricingFns";
import { cn } from "@/helpers/utilsFns";
import { handleFileUrl, handleOrgFileUrl } from "@/lib/fileUploadFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQuery } from "convex-helpers/react/cache";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useAction, useMutation } from "convex/react";

export const getSteps = (isAdmin: boolean = false) => [
  {
    id: 1,
    label: "Organization Info",
    mobileLabel: "Organization Info",
    schema: step1Schema,
  },
  {
    id: 2,
    label: "Organization Pt.2",
    mobileLabel: "Organizer Details",
    schema: orgDetailsSchema,
  },
  {
    id: 3,
    label: "Event, Project, Fund, etc",
    mobileLabel: "Event, Project, Fund, etc",
    schema: getEventOnlySchema(isAdmin),
  },
  {
    id: 4,
    label: "Event/Project Details Pt.2",
    mobileLabel: "Event/Project Details",
    schema: getEventDetailsSchema(isAdmin),
  },
  {
    id: 5,
    label: "Open Call",
    mobileLabel: "Open Call",
    schema: getOpenCallStep1Schema(isAdmin),
  },
  {
    id: 6,
    label: "Budget & Compensation",
    mobileLabel: "Budget/Compensation",
    schema: openCallStep2Schema,
  },
  {
    id: 7,
    label: "Recap",
    mobileLabel: "Recap",
    schema: getEventWithOCSchema(isAdmin),
  },
];

// In your component

interface EventOCFormProps {
  user: User | undefined;
  onClick: () => void;
  shouldClose: boolean;
  editedSections: ("event" | "openCall")[];
  setEditedSections: Dispatch<SetStateAction<("event" | "openCall")[]>>;
  setShouldClose: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children?: ReactNode;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  isEligibleForFree: boolean;
  planKey: string;
}

export type EventOCFormValues = z.infer<typeof eventWithOCSchema>;

export const EventOCForm = ({
  user,
  // onClick,
  editedSections,
  setEditedSections,
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
  // const convex = useConvex();
  const router = useRouter();
  const { isMobile } = useDevice();
  const isAdmin = user?.role?.includes("admin") || false;
  const steps = getSteps(isAdmin);
  const finalStep = activeStep === steps.length - 1;
  const [formType, setFormType] = useState<number>(Number(planKey));
  const eventOnly = formType === 1;
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
        contact: {
          primaryContact: "",
        },
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
    delayError: 1000,
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
    api.stripe.stripeOrganizations.createStripeOrgCheckoutSession,
  );
  const createNewOrg = useMutation(api.organizer.organizations.createNewOrg);
  const saveOrgFile = useMutation(api.uploads.files.saveOrgFile);
  const createOrUpdateEvent = useMutation(api.events.event.createOrUpdateEvent);
  const updateEventStatus = useMutation(api.events.event.updateEventStatus);
  const createNewOpenCall = useMutation(
    api.openCalls.openCall.createNewOpenCall,
  );
  const updateOpenCall = useMutation(api.openCalls.openCall.updateOpenCall);
  const changeOCStatus = useMutation(api.openCalls.openCall.changeOCStatus);
  const updateEventLookup = useMutation(
    api.events.eventLookup.eventLookupUpdateHelper,
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
  const [openCallId, setOpenCallId] = useState<Id<"openCalls"> | null>(null);

  const [selectedRow, setSelectedRow] = useState<Record<string, boolean>>({});
  const isSelectedRowEmpty =
    selectedRow && Object.keys(selectedRow).length === 0;
  const [skipped, setSkipped] = useState<Set<number>>(new Set([3, 4]));

  const [lastSaved, setLastSaved] = useState(
    existingEvent ? existingEvent.lastEditedAt : null,
  );

  const [savedCount, setSavedCount] = useState(0);
  const [pending, setPending] = useState(false);

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

  // #endregion
  //
  //
  // ------------- Step 1 - Organization & Event --------------
  //
  //
  // #region ------------- Refs --------------
  const prevIssues = useRef<string | null>(null);
  const prevErrorJson = useRef<string>("{}");
  const lastChangedRef = useRef<number | null>(null);
  const canCheckSchema = useRef(false);
  const canClearEventData = useRef(true);
  const hasClosed = useRef(false);
  const isFirstRun = useRef(true);
  const savedState = useRef(false);
  const latestSaveId = useRef<symbol | null>(null);
  const initialFormType = useRef<number | undefined>(undefined);
  const prevFilesRef = useRef<string>("");

  // #endregion
  // #region ------------- Watch --------------
  const orgData = watch("organization");
  const eventData = watch("event");
  const eventEdition = watch("event.dates.edition");
  const openCallData = watch("openCall");
  const ocEdition = watch("openCall.basicInfo.dates.edition");
  const ocBudget = watch("openCall.compensation.budget");
  const tempFiles = watch("openCall.tempFiles");

  // const eventDatesWatch = watch("event.dates");
  // #endregion
  // #region ------------- Variables --------------
  const hasEventId = !!eventData?._id;
  const userAcceptedTerms = acceptedTerms;
  const orgName = orgData?.name ?? "";
  const eventOpenCall = eventData?.hasOpenCall ?? "";
  const now = new Date();
  const openCallEnd = openCallData?.basicInfo?.dates?.ocEnd
    ? new Date(openCallData?.basicInfo?.dates?.ocEnd)
    : null;
  const alreadyPaid = !!openCallData?.paid;
  const alreadyApprovedOC = !!openCallData?.approvedBy;
  const alreadyApprovedEvent = !!eventData?.approvedBy;
  const alreadyApproved =
    (alreadyApprovedOC && alreadyApprovedEvent) ||
    (alreadyApprovedEvent && eventOnly);

  const pastEvent = !!openCallEnd && openCallEnd < now && alreadyApproved;
  //note-to-self: this is what's hiding the open call sections from users (non-admins). The idea being that they shouldn't be able to change anything. Perhaps the better way would be to still show it, but have it disabled/read only? It's confusing at the moment.
  const hasOpenCall = validOCVals.includes(eventOpenCall) && formType !== 1;

  const eventName = eventData?.name;
  const eventSlug = eventData?.slug;
  const eventCategory = eventData?.category;
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

  const openCallDocs = useQuery(
    api.openCalls.openCall.getOpenCallDocuments,
    ocData?._id ? { openCallId: ocData._id } : "skip",
  );
  const currentDocs = openCallDocs?.documents;
  const normalizedCurrentDocs = (currentDocs ?? []).filter(
    (doc): doc is { id: Id<"openCallFiles">; title: string; href: string } =>
      !!doc.id,
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

  const eventLink = `/thelist/event/${eventData?.slug}/${eventData?.dates?.edition}${hasOpenCall ? "/call" : ""}`;
  const eventState = eventData?.state;
  const ocState = openCallData?.state;
  const unpublished =
    !["published", "submitted"].includes(eventState ?? "") ||
    !["published", "submitted"].includes(ocState ?? "");

  const hasUserEditedStep0 =
    JSON.stringify(dirtyFields?.organization ?? {}).includes("true") &&
    activeStep === 0;

  const hasUserEditedStep4 =
    JSON.stringify(dirtyFields?.openCall ?? {}).includes("true") &&
    activeStep === 4;
  const hasUserEditedStep5 =
    JSON.stringify(dirtyFields?.openCall ?? {}).includes("true") &&
    activeStep === 5;

  const hasUserEditedStep1 =
    JSON.stringify(dirtyFields?.organization ?? {}).includes("true") &&
    activeStep === 1;
  const hasUserEditedEventSteps = JSON.stringify(
    dirtyFields?.event ?? {},
  ).includes("true");
  const hasUserEditedForm = !!(
    hasUserEditedEventSteps ||
    hasUserEditedStep0 ||
    hasUserEditedStep4 ||
    hasUserEditedStep5 ||
    hasUserEditedStep1
  );
  const prevOrgRef = useRef(existingOrg);
  const prevEventRef = useRef(existingEvent);
  const validStep2 =
    activeStep > 1
      ? !!(eventName && eventName.trim().length >= 3 && !!eventDatesFormat)
      : true;
  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;
  const isValid =
    validOrgWZod && isStepValidZod && eventChoiceMade && validStep2;

  const hasErrors = !!errors && Object.keys(errors).length > 0;

  const projectBudget = ocData?.compensation?.budget;
  const projectMaxBudget = projectBudget?.max;
  const projectMinBudget = projectBudget?.min;
  const projectBudgetLg = ocBudget?.max && ocBudget.max > 1000;

  const projectBudgetAmt = (projectMaxBudget || projectMinBudget) ?? 0;
  const submissionCost = getOcPricing(projectBudgetAmt);

  // console.log(finalStep, acceptedTerms, isAdmin);
  // #endregion
  // #endregion
  //

  //
  // #region ------------- Console Logs --------------
  // console.log(errors);
  // if (errors && Object.keys(errors).length > 0) {
  //   console.log("errors", errors);
  // }

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

  const handleDraftUpdate = useCallback(async () => {
    try {
      const bothEdited =
        editedSections.includes("event") && editedSections.includes("openCall");

      if (editedSections.includes("openCall") && openCallId) {
        await changeOCStatus({
          openCallId: openCallId as Id<"openCalls">,
          newStatus: "draft",
          target: bothEdited ? "both" : "oc",
        });
      } else if (editedSections.includes("event") && existingEvent?._id) {
        await updateEventStatus({
          eventId: existingEvent._id as Id<"events">,
          status: "draft",
        });
      }

      setSavedCount(0);
      setEditedSections([]);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }, [
    editedSections,
    changeOCStatus,
    updateEventStatus,
    openCallId,
    existingEvent,
    setEditedSections,
    setSavedCount,
  ]);

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
      setValue("event.state", "submitted");

      await handleSave(true);

      if (paidCall && !alreadyPaid) {
        const result = await getCheckoutUrl({
          orgId: orgData._id as Id<"organizations">,
          eventId: eventData._id as Id<"events">,
          slidingPrice:
            typeof submissionCost?.price === "number" &&
            submissionCost?.price > 0
              ? submissionCost?.price
              : 50,
          isEligibleForFree,
          openCallId,
        });
        url = result.url;
      }
      if (!paidCall) {
        toast.success(
          alreadyPaid || alreadyApproved
            ? "Successfully updated project!"
            : `Successfully submitted ${eventOnly ? "event" : getEventCategoryLabel(category, true).toLowerCase() + " and open call"}!`,
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
      } else if (paidCall && alreadyPaid) {
        //TODO: Make some sort of confirmation page and/or forward the user to... dashboard? The list? Their event (?)
        // handleReset();
        toast.success(
          `You've successfully updated your ${getEventCategoryLabel(eventCategory)}!`,
        );
      }
      setTimeout(() => {
        setOpen(false);
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
    console.log("savedCount: ", savedCount);
    if (savedCount > 0 && activeStep === steps.length - 1) {
      handleDraftUpdate();
    }
    if (activeStep === 3) {
      if (!hasOpenCall) {
        unregister("openCall");
        setActiveStep((prev) => prev + 3);
        setValue("event.state", eventData?.state ?? "draft");
      } else {
        if (!openCallId) {
          const openCallResult = await createNewOpenCall({
            orgId: orgData._id as Id<"organizations">,
            eventId: eventData._id as Id<"events">,
            edition: eventData.dates.edition,
          });

          setOpenCallId(openCallResult);
        }
        if (eventEdition !== ocEdition) {
          setValue("openCall.basicInfo.dates.edition", eventEdition);
        }

        setActiveStep((prev) => prev + 1);
      }
    } else {
      setActiveStep((prev) => prev + 1);
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
  };

  const proceedBackStep = () => {
    if (activeStep === steps.length - 1) {
      if (!hasOpenCall) {
        unregister("openCall");
        setActiveStep((prev) => prev - 3);
      } else {
        setActiveStep((prev) => prev - 1);
      }
    } else if (activeStep === 1) {
      if (savedCount > 0 && activeStep > 0) {
        handleDraftUpdate();
      }
      if (!orgData?.contact?.primaryContact) {
        unregister("organization.contact");
        unregister("organization.links");
        // console.log(getValues("organization"));
      }
      setActiveStep((prev) => prev - 1);
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
    (shouldToast: boolean = true, manualCheck: boolean = false): boolean => {
      if (!schema) return true;
      if (!hasUserEditedForm) return true;

      const result = schema.safeParse(currentValues);

      console.log("safeParse result: ", result);
      if (isAdmin) {
        console.log("safeParse result: ", result);
      }

      if (!result.success) {
        const issues = result.error.issues;
        if (isAdmin) {
          console.log("issues: ", issues);
        }
        console.log("issues: ", issues);

        issues.forEach((issue) => {
          const path = issue.path.join(".") as Path<EventOCFormValues>;
          setError(path, { type: "manual", message: issue.message });
        });

        const userRelevantIssues = issues.filter(
          (i) =>
            i.message &&
            !(
              i.message === "Required" ||
              i.message === "invalid_union" ||
              i.message.toLowerCase().includes("invalid input")
            ),
        );

        const serializedIssues = JSON.stringify(userRelevantIssues);

        const messagesHaveChanged = serializedIssues !== prevIssues.current;

        prevIssues.current = serializedIssues;

        const firstMessage = userRelevantIssues[0]?.message || "";
        const latestMessage =
          userRelevantIssues[userRelevantIssues.length - 1]?.message || "";

        setErrorMsg(messagesHaveChanged ? latestMessage : firstMessage || "");

        if (shouldToast) {
          toast.dismiss("form-validation-error");
          toast.error("Please fix errors before continuing.", {
            toastId: "form-validation-error",
          });
        }

        return false;
      } else {
        if (isAdmin && manualCheck) {
          toast.success("Everything is looking good!", {
            toastId: "form-validation-success",
          });
        }
      }

      setErrorMsg("");
      return true;
    },
    [schema, currentValues, hasUserEditedForm, setError, isAdmin],
  );

  const handleSave = useCallback(
    async (direct = false, publish = false, exit = false) => {
      if (pending) return;

      setPending(true);
      const saveId = Symbol("save");
      latestSaveId.current = saveId;
      try {
        if (direct) {
          const isStepValid = handleCheckSchema();
          if (!isStepValid) {
            toast.error("Please fix errors before continuing.", {
              toastId: "form-validation-error",
            });
            throw new Error("validation_failed");
            // return;
          }
        }
        let orgResult;
        let orgLogoFullUrl = "/1.jpg";
        let orgLogoStorageId: Id<"_storage"> | undefined;
        let timezone: string | undefined;
        let timezoneOffset: number | undefined;
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
            // return;
            throw new Error("org_logo_upload_failed");
          }

          orgLogoStorageId = result.logoStorageId;
          timezone = result.timezone;
          timezoneOffset = result.timezoneOffset;

          try {
            const { org } = await createNewOrg({
              organizationName: orgData.name?.trim(),
              logoStorageId: orgLogoStorageId,

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
            orgLogoFullUrl =
              orgResult?.logo ??
              (orgData.logo === "string" ? orgData.logo : "/1.jpg");

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
                contact: {
                  primaryContact: orgData.contact?.primaryContact || "",
                },
              });
            }
          } catch (error) {
            console.error("Failed to create new organization:", error);
            toast.error("Failed to create new organization");
            throw new Error("org_creation_failed");
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
                logoStorageId: existingEvent?.logoStorageId ?? orgLogoStorageId,
                links: eventLinks,
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
                logoStorageId: orgLogoStorageId,
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
        //TODO: Check if any of these 'has user edited' things are even doing anything, since the handleNext/BackStep already has the check.
        if (activeStep === 1) {
          try {
            const result = await updateOrg({
              orgId: orgData._id as Id<"organizations">,
              name: orgData.name?.trim(),
              slug: slugify(orgData.name?.trim(), {
                lower: true,
                strict: true,
              }),
              logo: orgData.logo as string,
              location: {
                ...orgData.location,
              },
              contact: {
                organizer: orgData.contact?.organizer,
                organizerTitle: orgData.contact?.organizerTitle,
                primaryContact: orgData.contact?.primaryContact || "",
              },
              about: orgData.about,
              links: orgData.links,
              isComplete: true,
            });

            if (!result) {
              toast.error("Failed to update organization");
              throw new Error("org_update_failed");
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
          } catch (error) {
            console.error("Failed to update organization final step:", error);
            toast.error("Failed to update organization");
            throw new Error("org_final_step_failed");
          }
        }
        if (activeStep === 2 && hasUserEditedEventSteps) {
          let result = {
            logoStorageId: eventData?.logoStorageId as
              | Id<"_storage">
              | undefined,
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
              throw new Error("event_logo_upload_failed");
            }
            result = uploadResult;
          }
          const { logoStorageId, timezone, timezoneOffset } = result;
          let eventResult = null;
          const eventLogo =
            typeof eventData.logo === "string" ? eventData.logo : "1.jpg";

          try {
            const prodDates =
              eventData.dates.prodFormat === "sameAsEvent"
                ? eventData.dates.eventDates
                : eventData.dates.prodDates;

            const { event } = await createOrUpdateEvent({
              formType,
              eventId: eventData._id || "",
              name: eventData.name,
              slug: slugify(eventData.name, { lower: true, strict: true }),
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
              blurb: eventData.blurb,
              about: eventData.about,
              timeLine: eventData.timeLine,
              links: eventData.links,
              otherInfo: eventData.otherInfo || undefined,
              adminNote: eventData.adminNote || undefined,
              active: eventData.active,
              mainOrgId: orgData._id as Id<"organizations">,
              organizerId: [orgData._id] as Id<"organizations">[],
            });

            eventResult = event;

            setExistingEvent(eventResult);

            reset(
              merge({}, currentValues, {
                event,
              }),
            );
          } catch (error) {
            console.error("Failed to create new event:", error);
            toast.error("Failed to create new event");
            throw new Error("event_creation_failed");
          }
        }
        if (activeStep === 3 && hasUserEditedEventSteps) {
          let eventResult = null;

          try {
            const { event } = await createOrUpdateEvent({
              eventId: eventData._id || "",
              name: eventData.name,
              slug: slugify(eventData.name, { lower: true, strict: true }),

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
              blurb: eventData.blurb,
              about: eventData.about,
              links: eventData.links,
              otherInfo: eventData.otherInfo || undefined,
              timeLine: eventData.timeLine,
              adminNote: eventData.adminNote || undefined,
              active: eventData.active,
              mainOrgId: orgData._id as Id<"organizations">,
              organizerId: [orgData._id] as Id<"organizations">[],
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
          } catch (error) {
            console.error("Failed to update event:", error);
            toast.error("Failed to update event");
            throw new Error("event_update_failed");
          }
        }
        if (activeStep === 4 && hasUserEditedStep4) {
          try {
            let openCallFiles = null;
            let saveResults: {
              id: Id<"openCallFiles">;
              url: string;
              fileName?: string;
              storageId: Id<"_storage">;
            }[] = [];

            if (!openCallData) return;

            if (openCallData.tempFiles) {
              if (openCallData.tempFiles?.length > 0) {
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
                  throw new Error("open_call_file_upload_failed");
                  // return;
                }
                openCallFiles = result;

                saveResults = await saveOrgFile({
                  files: result,
                  reason: "docs",
                  organizationId: orgData._id as Id<"organizations">,
                  eventId: eventData._id as Id<"events">,
                  openCallId,
                });
              } else {
                unregister("openCall.tempFiles");
              }
            }

            const newDocs = saveResults.map((saved, i) => {
              const matched = openCallFiles?.find(
                (original) => original.storageId === saved.storageId,
              );

              return {
                id: saved.id,
                title:
                  matched?.fileName ??
                  `${eventData.name} (${eventData.dates.edition}) - Document ${i + 1}`,
                href: saved.url,
              };
            });

            const mergedDocs = [
              ...(normalizedCurrentDocs ?? []),
              ...newDocs,
            ].reduce(
              (acc, doc) => {
                if (!acc.find((d) => d.id === doc.id)) {
                  acc.push(doc);
                }
                return acc;
              },
              [] as typeof newDocs,
            );

            const ocResult = await updateOpenCall({
              organizerId: [orgData._id] as Id<"organizations">[],
              mainOrgId: orgData._id as Id<"organizations">,
              eventId: eventData._id as Id<"events">,
              openCallId,
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
              selectionCriteria: openCallData.selectionCriteria,
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
                    openCallData.compensation?.categories?.designFee ??
                    undefined,
                  accommodation:
                    openCallData.compensation?.categories?.accommodation ??
                    undefined,
                  food:
                    openCallData.compensation?.categories?.food ?? undefined,
                  travelCosts:
                    openCallData.compensation?.categories?.travelCosts ??
                    undefined,
                  materials:
                    openCallData.compensation?.categories?.materials ??
                    undefined,
                  equipment:
                    openCallData.compensation?.categories?.equipment ??
                    undefined,
                },
              },
              requirements: {
                requirements: openCallData.requirements.requirements,
                more: undefined,
                destination: "reqsDestination",
                links: openCallData.requirements.links ?? [],
                applicationLink: openCallData.requirements.applicationLink,
                applicationLinkFormat:
                  openCallData.requirements.applicationLinkFormat,
                applicationLinkSubject:
                  openCallData.requirements.applicationLinkSubject,
                otherInfo: openCallData.requirements.otherInfo,
              },
              documents: mergedDocs,
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
            throw new Error("open_call_create_update_failed");
          }
        }
        if (activeStep === 5 && hasUserEditedStep5) {
          if (!openCallData) return;

          try {
            await updateOpenCall({
              organizerId: [orgData._id] as Id<"organizations">[],
              mainOrgId: orgData._id as Id<"organizations">,
              eventId: eventData._id as Id<"events">,
              openCallId,
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
              selectionCriteria: openCallData.selectionCriteria,

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
                links: openCallData.requirements.links ?? [],
                applicationLink: openCallData.requirements.applicationLink,
                applicationLinkFormat:
                  openCallData.requirements.applicationLinkFormat,
                applicationLinkSubject:
                  openCallData.requirements.applicationLinkSubject,
                otherInfo: openCallData.requirements.otherInfo,
              },
              documents: normalizedCurrentDocs,
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
            console.error("Failed to update open call:", error);
            toast.error("Failed to update open call");
            throw new Error("open_call_update_failed");
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

          try {
            if (existingOrg?.isComplete !== true) {
              await markOrganizationComplete({
                orgId: (orgData?._id ||
                  existingOrg?._id) as Id<"organizations">,
              });
            }

            const { event } = await createOrUpdateEvent({
              formType,
              eventId: eventData._id || "",
              name: eventData.name,
              slug: slugify(eventData.name, { lower: true, strict: true }),
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
              blurb: eventData.blurb,
              about: eventData.about,
              links: eventLinks,
              otherInfo: eventData.otherInfo || undefined,
              timeLine: eventData.timeLine,
              adminNote: eventData.adminNote || undefined,

              active: eventData.active,
              ...(exit && {
                state:
                  eventData.state === "editing" ? "draft" : eventData.state,
              }),
              finalStep,
              publish,
              mainOrgId: orgData._id as Id<"organizations">,
              organizerId: [orgData._id] as Id<"organizations">[],
            });
            if (hasOpenCall && openCallData) {
              await updateOpenCall({
                organizerId: [orgData._id] as Id<"organizations">[],
                mainOrgId: orgData._id as Id<"organizations">,
                eventId: eventData._id as Id<"events">,
                openCallId,
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
                selectionCriteria: openCallData.selectionCriteria,
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
                    travelCosts:
                      openCallData.compensation.categories.travelCosts,
                    materials: openCallData.compensation.categories.materials,
                    equipment: openCallData.compensation.categories.equipment,
                  },
                },
                requirements: {
                  requirements: openCallData.requirements.requirements,
                  more: undefined,
                  destination: undefined,

                  links: openCallData.requirements.links ?? [],
                  applicationLink: openCallData.requirements.applicationLink,
                  applicationLinkFormat:
                    openCallData.requirements.applicationLinkFormat,
                  applicationLinkSubject:
                    openCallData.requirements.applicationLinkSubject,
                  otherInfo: openCallData.requirements.otherInfo,
                },
                documents: normalizedCurrentDocs,
                // state: publish ? "published" : "submitted",
                state: publish
                  ? "published"
                  : exit
                    ? openCallData.state === "editing"
                      ? "draft"
                      : (openCallData.state as OpenCallState)
                    : "submitted",
                finalStep,
                approved: publish,
                paid: formType === 3 && !alreadyPaid ? false : true,
              });
            }
            if (event && publish) {
              await updateEventLookup({
                eventId: event._id,
                openCallId: openCallId ?? undefined,
              });
            }
            eventResult = event;
            setExistingEvent(eventResult);
          } catch (error) {
            console.error("Failed to submit:", error);
            toast.error("Failed to submit");
            throw new Error("final_submit_failed");
          }
        }
      } catch (err) {
        // console.error("Failed to submit:", error);
        if ((err as Error)?.message !== "validation_failed") {
          toast.error("Save failed");
          console.error(err);
        }
      } finally {
        if (latestSaveId.current === saveId) {
          setPending(false);
        }
        if (isAdmin && publish) {
          console.log(publish);
          toast.success("Published!");
          setTimeout(() => {
            window.location.href = `/thelist/event/${submissionUrl}`;
            setOpen(false);
          }, 1500);
        }

        if (activeStep > 1 && !exit && !finalStep) {
          setSavedCount(savedCount + 1);

          switch (activeStep) {
            case 2:
            case 3:
              setEditedSections((prev) =>
                prev.includes("event") ? prev : [...prev, "event"],
              );
              break;

            case 4:
            case 5:
              setEditedSections((prev) =>
                prev.includes("openCall") ? prev : [...prev, "openCall"],
              );
              break;

            default:
              break;
          }
        }

        if (exit && savedCount > 0 && activeStep > 0) {
          handleDraftUpdate();
        }
      }
    },
    [
      handleDraftUpdate,
      savedCount,
      setEditedSections,
      submissionUrl,
      isAdmin,
      setOpen,
      steps.length,
      openCallId,
      projectBudget,
      paidCall,
      finalStep,
      alreadyPaid,
      formType,
      eventOnly,
      saveOrgFile,
      hasOpenCall,
      openCallData,
      normalizedCurrentDocs,
      updateOpenCall,
      hasUserEditedStep0,
      hasUserEditedStep4,
      hasUserEditedStep5,
      orgData,
      generateUploadUrl,
      getTimezone,
      createNewOrg,
      existingOrg,
      unregister,
      reset,
      activeStep,
      hasUserEditedEventSteps,
      eventData,
      eventLinks,
      updateOrg,
      updateEventLastEditedAt,
      createOrUpdateEvent,
      updateEventLookup,
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
    setOpenCallId(null);
    setNewOrgEvent(true);
    // reset();
    reset({
      organization: {
        name: "",
        logo: "",
        location: undefined,
        contact: {
          primaryContact: "",
        },
      },
      event: {
        formType,
        name: "",
        logo: "/1.jpg",
        location: undefined,
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
    if (!initialFormType.current && hasEventId) {
      initialFormType.current = formType;
    }
  }, [formType, hasEventId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editedSections.length > 0) {
        handleDraftUpdate();
      }
    };

    window.addEventListener("unload", handleBeforeUnload);
    return () => {
      window.removeEventListener("unload", handleBeforeUnload);
    };
  }, [editedSections, handleDraftUpdate]);

  useEffect(() => {
    if (formType === 1 || !initialFormType.current) return;
    if (projectBudgetLg && initialFormType.current < 3 && formType === 2) {
      setFormType(3);
      setValue("event.formType", 3);
    } else if (
      !projectBudgetLg &&
      initialFormType.current < 3 &&
      formType === 3
    ) {
      setFormType(2);
      setValue("event.formType", 2);
    }
  }, [formType, projectBudgetLg, setValue]);

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

  // useEffect(() => {
  //   if (!schema || !hasUserEditedForm) return;
  //   const serialized = JSON.stringify(errors);

  //   // Only run handleCheckSchema if error content has changed
  //   if (serialized !== prevErrorJson.current) {
  //     prevErrorJson.current = serialized;
  //     canCheckSchema.current = true;
  //   }
  // }, [schema, hasUserEditedForm, errors]);

  const serializedErrors = JSON.stringify(errors);
  // console.log("serializedErrors", serializedErrors);
  useEffect(() => {
    if (!schema || !hasUserEditedForm) return;
    // console.log("has edited me");
    const debouncedCheck = debounce(() => {
      // if (!prevFormValues.current && dirtyFields)
      // console.log("with debounce");
      if (serializedErrors !== prevErrorJson.current) {
        // console.log("error changed");
        prevErrorJson.current = serializedErrors;
        canCheckSchema.current = true;
      }
    }, 300);

    debouncedCheck();

    return () => {
      debouncedCheck.cancel();
    };
  }, [serializedErrors, schema, hasUserEditedForm]);

  useEffect(() => {
    console.log({
      isStepValidZod,
      hasUserEditedForm,
      canCheck: canCheckSchema.current,
    });
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
        // handleSave().then(() => {
        //   // console.log("Autosaved at", new Date().toLocaleTimeString());
        //   setPending(false);
        // });
        handleSave();
      }
    }, 5000); // check every 5 seconds (adjustable)

    return () => clearInterval(interval);
  }, [isValid, lastSaved, hasUserEditedForm, pending, handleSave, activeStep]);

  useEffect(() => {
    if (!tempFiles) return;
    const currentFiles = JSON.stringify(
      (tempFiles ?? []).map((f) => ({
        name: f?.name,
        size: f?.size,
        lastModified: f?.lastModified,
      })),
    );

    if (currentFiles !== prevFilesRef.current) {
      handleSave(true);
      prevFilesRef.current = currentFiles;
      unregister("openCall.tempFiles");
    }
  }, [tempFiles, handleSave, unregister]);

  useEffect(() => {
    if (!existingOrg) return;
    if (existingOrg?._id === prevOrgRef.current?._id) return;
    const orgReady =
      existingOrg &&
      typeof existingOrg._id === "string" &&
      existingOrg._id.length > 0;

    const orgChanged = orgReady && existingOrg._id !== prevOrgRef.current?._id;

    if (orgChanged) {
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
      setOpenCallId(null);
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
      const y = toYear(new Date());
      setValue("event.dates.eventDates", [
        {
          start: y,
          end: y,
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

  const saveAndClose = useCallback(async () => {
    console.log("saving and closing");
    await handleSave(true, false, true);
    setShouldClose(false);
    setOpen(false);
  }, [handleSave, setOpen, setShouldClose]);

  useEffect(() => {
    if (shouldClose && !hasClosed.current) {
      hasClosed.current = true;
      saveAndClose();
    } else if (!shouldClose) {
      hasClosed.current = false;
    }
  }, [shouldClose, saveAndClose]);

  //TODO: Add this to admin/org form

  useEffect(() => {
    if (!hasOpenCall) {
      setSkipped(new Set([4, 5]));
    } else if (hasOpenCall) {
      setSkipped(new Set());
    }
  }, [hasOpenCall]);

  useEffect(() => {
    if (!openCallSuccess) return;
    if (ocData) {
      // console.log(ocData);
      setValue("openCall", ocData);
      setOpenCallId(ocData._id);
    } else {
      setOpenCallId(null);
    }
  }, [openCallSuccess, ocData, setValue]);

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
        onCheckSchema={() => handleCheckSchema(false, true)}
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
        onViewEvent={() => router.push(eventLink)}
        isDirty={hasUserEditedForm}
        onSave={() => handleSave(true)}
        onPublish={() => handleSave(true, true)}
        lastSaved={lastSavedDate}
        disabled={!isValid || pending || (finalStep && !userAcceptedTerms)}
        pending={pending}
        formTouched={
          hasUserEditedForm || savedCount > 0 || !alreadyApproved || unpublished
        }
        cancelButton={
          <DialogCloseBtn
            tabIndex={4}
            className="w-full"
            title={
              hasUnsavedChanges
                ? "Discard unsaved changes?"
                : "Exit submission form?"
            }
            description={
              activeStep > 0 && savedCount > 0
                ? hasUnsavedChanges
                  ? "Sure? You can always start the submission process at a later time. Save your event to a draft in your dashboard."
                  : "Sure? You can always continue the submission process at a later time. We've saved your event to a draft in your dashboard."
                : "Sure? You can always start the submission process at a later time. "
            }
            actionTitle={hasUnsavedChanges ? "Discard" : "Exit"}
            cancelTitle={hasUnsavedChanges ? "Cancel" : "Back"}
            primaryActionTitle="Save & Exit"
            onAction={() => {
              //TODO: Update this to also/or change the open call. Whichever part was actually edited.
              if (activeStep > 0 && editedSections.length > 0) {
                saveAndClose();
              }
              setOpen(false);
            }}
            onPrimaryAction={
              activeStep > 0 && hasUnsavedChanges
                ? () => {
                    saveAndClose();
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

            {/* //------ 6th Step: Organization Details  ------ */}

            {activeStep === 1 && (
              <SubmissionFormOrgStep2
                handleCheckSchema={() => handleCheckSchema(false)}
              />
            )}
            {/* //------ 2nd: Event Basics  ------ */}
            {activeStep === 2 && (
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

            {activeStep === 3 && (
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

            {activeStep === 4 && (
              <SubmissionFormOC1
                user={user}
                isAdmin={isAdmin}
                isMobile={isMobile}
                categoryEvent={categoryEvent}
                canNameEvent={canNameEvent}
                handleCheckSchema={() => handleCheckSchema(false)}
                formType={formType}
                pastEvent={pastEvent}
                documents={currentDocs}
              />
            )}
            {/* //------ 5th Step: OC Reqs & Other Info  ------ */}
            {activeStep === steps.length - 2 && (
              <SubmissionFormOC2
                user={user}
                isAdmin={isAdmin}
                isMobile={isMobile}
                categoryEvent={categoryEvent}
                canNameEvent={canNameEvent}
                handleCheckSchema={() => handleCheckSchema(false)}
                formType={formType}
                pastEvent={pastEvent}
                initialFormType={initialFormType.current}
              />
            )}

            {/* //------ Final Step: Recap  ------ */}
            {activeStep === steps.length - 1 && (
              <>
                <SubmissionFormRecapDesktop
                  formType={formType}
                  isAdmin={isAdmin}
                  setAcceptedTerms={setAcceptedTerms}
                  acceptedTerms={acceptedTerms}
                  submissionCost={submissionCost?.price}
                  isEligibleForFree={isEligibleForFree}
                  alreadyPaid={alreadyPaid}
                />

                <SubmissionFormRecapMobile
                  formType={formType}
                  isAdmin={isAdmin}
                  setAcceptedTerms={setAcceptedTerms}
                  acceptedTerms={acceptedTerms}
                  submissionCost={submissionCost?.price}
                  isEligibleForFree={isEligibleForFree}
                  alreadyPaid={alreadyPaid}
                />
              </>
            )}
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
