import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"
import { Input } from "@/components/ui/input";
import { OrgSearch } from "@/features/organizers/components/org-search";
import {
  eventWithOCSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";

import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Path, useWatch } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";

const steps = [
  {
    id: 1,
    label: "Add/Update Open Call",

    schema: step1Schema,
  },
  {
    id: 2,
    label: "Create New Event",
    schema: eventWithOCSchema,
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

interface EventOCFormProps {
  user: User | undefined;
  onClick: () => void;
  children?: React.ReactNode;
}

type EventOCFormValues = z.infer<typeof eventWithOCSchema>;

export const EventOCForm = ({ user, onClick }: EventOCFormProps) => {
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
    register,
    control,
    watch,
    // setValue,
    getValues,
    setError,
    // trigger,
    // setValue,
    handleSubmit: handleSubmit,
    formState: {
      // isValid,
      //   dirtyFields,
      isDirty,
      errors,
    },
    reset,
  } = form;

  //   const selectedOrg = useWatch({
  //     control,
  //     name: "organization",
  //   })
  // const orgValue = watch("organization");

  // const orgName =
  //   typeof orgValue === "string" ? orgValue : (orgValue?.name ?? "");

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const [activeStep, setActiveStep] = useState(0);
  // const [createOrgError, setCreateOrgError] = useState("");
  // const [isValidOrg, setIsValidOrg] = useState<string>("");
  const [existingOrg, setExistingOrg] = useState<Doc<"organizations"> | null>(
    null,
  );
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
  // ------------- Step 1 - Organization --------------
  //
  //
  // TODO: Timezone and timezone offset will be gathered on submit (existing convex action)
  const orgData = watch("organization");
  const orgName = orgData?.name ?? "";

  const orgNameValid = !errors.organization?.name && Boolean(orgName?.trim());
  const orgLocationValid =
    !errors.organization?.location?.country && Boolean(orgData?.location?.full);
  const orgLogoValid = !errors.organization?.logo && Boolean(orgData?.logo);
  const orgDataValid = orgNameValid && orgLocationValid && orgLogoValid;
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

  // const orgValidation = useQuery(
  //   api.organizer.organizations.isOwnerOrIsNewOrg,
  //   orgName.trim().length >= 3 ? { organizationName: orgName } : "skip",
  // );
  const validOrgWZod = orgValidationSuccess && orgNameValid;
  const invalidOrgWZod = orgValidationError && orgNameValid;

  const isValid = validOrgWZod && isStepValidZod;

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

  console.log(errors);
  //
  //
  // console.log(formIsValid);
  // console.log("isValidOrg", isValidOrg);
  // console.log("isStepValid", isStepValid);
  // console.log("isValid", isValid);
  // console.log(orgNameValid, orgLocationValid);
  console.log(orgData);
  // console.log("orgValue", orgValue);
  // console.log("existing orgs", existingOrgs);
  console.log("existingOrg", existingOrg);
  // console.log(existingOrg?.logo);
  // console.log("is valid org", isValidOrg);
  console.log(isValid, "wZod:", validOrgWZod);

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
    if (typeof data.organization.logo === "string") {
      console.log("Logo is an existing image URL:", data.organization.logo);
    } else {
      console.log("Logo is a new Blob upload:", data.organization.logo);
    }

    console.log("data", data);
    try {
      console.log("organizer mode)");
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

  const handleNextStep = async () => {
    const currentStep = steps[activeStep];
    const schema = currentStep.schema;

    if (schema) {
      const values = getValues();
      console.log(values);
      const result = schema.safeParse(values);
      console.log(result);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".") as Path<EventOCFormValues>;
          setError(path, { type: "manual", message: issue.message });
        });

        toast.error("Please fix errors before continuing.");
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    console.log("reset");
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

  useEffect(() => {
    if (existingOrgs && validOrgWZod) {
      if (existingOrg?.updatedAt) {
        setLastSaved(existingOrg.updatedAt);
      } else if (existingOrg?._creationTime) {
        setLastSaved(existingOrg._creationTime);
      }
      reset({
        organization: {
          name: existingOrg.name,
          logo: existingOrg.logo,
          location: existingOrg.location,
        },
      });
    } else {
      setLastSaved(null);
    }
  }, [existingOrg, validOrgWZod, existingOrgs, reset]);

  //todo: add logic to autosave every... X minutes? but only save if changes have been made since last save

  return (
    <HorizontalLinearStepper
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      onNextStep={handleNextStep}
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
        className="flex h-full min-h-96 grow flex-col p-4"
      >
        {activeStep === 0 && (
          <div
            id="form-container"
            className="flex h-full flex-col gap-4 xl:grid xl:grid-cols-2 xl:gap-6 xl:divide-x-1.5"
          >
            <section className="flex flex-col items-center justify-center gap-y-6 lg:mx-auto lg:max-w-[80%]">
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
                <p className="text-balance text-center">
                  {existingOrgs
                    ? "Please select from your existing events or create a new open call"
                    : "To start, select from an existing organization or create a new one!"}
                </p>
              </section>
              <section
                className={cn(
                  "flex w-full flex-col items-center gap-4 transition-opacity lg:flex-row",
                )}
              >
                <div className="flex w-full items-start gap-x-2 lg:w-28 lg:flex-col">
                  <p className="font-bold lg:text-xl">Step 1: </p>
                  <p className="lg:text-xs">Organization</p>
                </div>
                <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[400px] lg:max-w-md">
                  <Label htmlFor="organization.name" className="sr-only">
                    Organization Name
                  </Label>
                  <Controller
                    name="organization.name"
                    control={control}
                    render={({ field }) => (
                      <OrgSearch
                        value={field.value}
                        onChange={field.onChange}
                        isValid={validOrgWZod}
                        validationError={invalidOrgWZod}
                        onLoadClick={setExistingOrg}
                        onReset={handleReset}
                        placeholder="Search or enter new name"
                        className="rounded-lg py-2 text-base lg:h-20 lg:text-xl"
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
              </section>

              {orgNameValid && (
                <section
                  className={cn(
                    "flex w-full flex-col items-center gap-4 transition-opacity lg:flex-row",
                    orgNameValid ? "opacity-100" : "opacity-0",
                  )}
                >
                  <div className="flex w-full items-start gap-x-2 lg:w-28 lg:flex-col">
                    <p className="font-bold lg:text-xl">Step 2: </p>
                    <p className="lg:text-xs">Location</p>
                  </div>
                  <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[400px] lg:max-w-md">
                    <Label
                      htmlFor="organization.location.fullLocation"
                      className="sr-only"
                    >
                      Organization Location
                    </Label>
                    <Controller
                      name="organization.location"
                      control={control}
                      render={({ field }) => (
                        <MapboxInputFull
                          value={field.value}
                          onChange={field.onChange}
                          reset={!validOrgWZod}
                          tabIndex={3}
                          disabled={!orgNameValid}
                          placeholder="Organization Location (city, state, country, etc)..."
                          className="w-full"
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
                </section>
              )}

              {orgLocationValid && (
                <section
                  className={cn(
                    "flex w-full flex-col items-center gap-4 transition-opacity lg:flex-row",
                    orgLocationValid ? "opacity-100" : "opacity-0",
                  )}
                >
                  <div className="flex w-full items-start gap-x-2 lg:w-28 lg:flex-col">
                    <p className="font-bold lg:text-xl">Step 3: </p>
                    <p className="lg:text-xs">Logo</p>
                  </div>
                  <div className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[400px] lg:max-w-md">
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
                          onChange={(file) => field.onChange(file)}
                          onRemove={() => field.onChange(undefined)}
                          reset={!validOrgWZod}
                          disabled={!orgNameValid}
                          initialImage={existingOrg?.logo}
                          size={72}
                        />
                      )}
                    />
                  </div>
                </section>
              )}
            </section>
            <Separator thickness={2} className="my-4 lg:hidden" />
            {orgDataValid && (
              <section className="xl:pl-18">
                <Label>Event Name</Label>
                <Input
                  {...register("event.name")}
                  placeholder="Task title..."
                  className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-base placeholder-violet-300 focus:outline-none lg:text-sm"
                />
                {/* <p>
                Check here if the organizer (a) already exists,
                <br /> (b) has any current events (that they may want to add a
                new open call for) ,
                <br /> (c)has any current open calls (so they don&apos;t
                accidentally create a duplicate) and
                <br /> (d) to give a brief intro and ask the MOST basic event
                info if this is their first. If no existing events, use this as
                a starting point and a sort of welcome/intro page to posting an
                open call here.
              </p> */}
              </section>
            )}
          </div>
        )}
        {activeStep === 1 && (
          <p className="gap-4 xl:grid xl:grid-cols-2 xl:gap-6">Second Step</p>
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
