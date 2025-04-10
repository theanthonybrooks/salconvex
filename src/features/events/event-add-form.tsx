import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import HorizontalLinearStepper from "@/components/ui/stepper";
import { User } from "@/types/user";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { eventDefaultValues } from "@/features/events/data/eventDefaultData"
import { Input } from "@/components/ui/input";
import { OrgSearch } from "@/features/organizers/components/org-search";
import {
  eventWithOCSchema,
  step1Schema,
} from "@/features/organizers/schemas/event-add-schema";

import AvatarUploader from "@/components/ui/logo-uploader";
import { MapboxInput } from "@/components/ui/mapbox-search";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
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
      organization: undefined,
      // orgLogo: undefined,
      // eventName: "",
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    setError,

    // setValue,
    handleSubmit: handleSubmit,
    formState: {
      // isValid,
      //   dirtyFields,
      isDirty,
      //   errors,
    },
    reset,
  } = form;

  //   const selectedOrg = useWatch({
  //     control,
  //     name: "organization",
  //   })
  const orgValue = watch("organization");

  const orgName =
    typeof orgValue === "string" ? orgValue : (orgValue?.name ?? "");

  const orgValidation = useQuery(
    api.organizer.organizations.isOwnerOrIsNewOrg,
    orgName.trim().length >= 3 ? { organizationName: orgName } : "skip",
  );
  const [activeStep, setActiveStep] = useState(0);
  const [createOrgError, setCreateOrgError] = useState("");
  const [isValidOrg, setIsValidOrg] = useState<string>("");
  const [existingOrg, setExistingOrg] = useState<Doc<"organizations"> | null>(
    null,
  );
  const [lastSaved, setLastSaved] = useState(
    existingOrg ? existingOrg.updatedAt : null,
  );

  const existingOrgs = typeof existingOrg === "object" && existingOrg !== null;
  const formIsValid = isValidOrg === "valid";
  const lastSavedDate = lastSaved
    ? new Date(Math.floor(lastSaved)).toLocaleString()
    : null;

  const watchedValues = useWatch({ control });
  const currentSchema = steps[activeStep]?.schema;

  const isStepValid = useMemo(() => {
    if (!currentSchema) return true;
    const result = currentSchema.safeParse(watchedValues);
    return result.success;
  }, [watchedValues, currentSchema]);

  const isValid = formIsValid && isStepValid;
  //
  //
  // ------------- Console Logs --------------
  //
  //
  // console.log(formIsValid);
  console.log("isValidOrg", isValidOrg);
  console.log("isStepValid", isStepValid);
  console.log("isValid", isValid);
  // console.log("orgValue", orgValue);
  // console.log("existing orgs", existingOrgs);
  // console.log("existingOrg", existingOrg);
  // console.log(existingOrg?.logo);
  // console.log("is valid org", isValidOrg);
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

  // -------------UseEffects --------------
  useEffect(() => {
    if (orgValidation === "available" || orgValidation === "ownedByUser") {
      setCreateOrgError("");
      setIsValidOrg("valid");
    } else if (!orgValidation) {
      setCreateOrgError("");
      setIsValidOrg("");
    } else {
      setCreateOrgError(
        "Organization already exists. Contact support for assistance.",
      );
      setIsValidOrg("invalid");
    }
  }, [orgValidation]);

  useEffect(() => {
    if (existingOrgs && isValidOrg === "valid") {
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
  }, [existingOrg, isValidOrg, existingOrgs, reset]);

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
          <div className="flex h-full flex-col gap-4 xl:grid xl:grid-cols-2 xl:gap-6 xl:divide-x-1.5">
            <section className="flex flex-col gap-2">
              <div className="flex flex-col items-center justify-center gap-y-6">
                <section className="flex flex-col items-center justify-center">
                  <div
                    id="welcome-text"
                    className="font-tanker text-[2.5em] lowercase tracking-wide text-foreground lg:text-[4em]"
                  >
                    Welcome{" "}
                    <AnimatePresence>
                      {existingOrgs && isValidOrg === "valid" && (
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
                <section className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[400px] lg:max-w-md">
                  <Label htmlFor="organization" className="">
                    Organization Name
                  </Label>
                  <div className="flex flex-col items-center gap-4 lg:flex-row">
                    {/* <div className="flex items-start gap-x-2 lg:flex-col">
                      <p className="font-bold lg:text-xl">Step 1: </p>
                      <p className="lg:text-xs">Organization</p>
                    </div> */}
                    <Controller
                      name="organization.name"
                      control={control}
                      render={({ field }) => (
                        <OrgSearch
                          value={field.value}
                          onChange={field.onChange}
                          isValid={isValidOrg}
                          onReset={() => {
                            setIsValidOrg("");
                            setCreateOrgError("");
                          }}
                          onLoadClick={setExistingOrg}
                          placeholder="Search or enter new name"
                          className="rounded-lg py-2 text-base lg:h-20 lg:text-xl"
                        />
                      )}
                    />
                  </div>
                  {createOrgError && (
                    <span className="mt-2 w-full text-right text-sm text-red-600">
                      {createOrgError}
                    </span>
                  )}
                </section>
                <section className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[400px] lg:max-w-md">
                  <Controller
                    name="organization.logo"
                    control={control}
                    render={({ field }) => (
                      <AvatarUploader
                        title="Organization Logo"
                        onChange={(file) => field.onChange(file)}
                        onRemove={() => field.onChange(undefined)}
                        reset={!formIsValid}
                        required
                        initialImage={existingOrg?.logo}
                        size={72}
                      />
                    )}
                  />
                </section>
                <section className="mx-auto flex w-full max-w-sm flex-col gap-2 lg:min-w-[400px] lg:max-w-md">
                  <Label htmlFor="residence">Organization Location</Label>
                  <Controller
                    name="organization.location.fullLocation"
                    control={control}
                    render={({ field }) => (
                      <MapboxInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        reset={!formIsValid}
                        onSelect={(location) => {
                          setValue(
                            "organization.location.fullLocation",
                            location.full,
                          );
                          setValue("organization.location.city", location.city);
                          setValue(
                            "organization.location.state",
                            location.state,
                          );
                          setValue(
                            "organization.location.stateAbbr",
                            location.stateAbbr,
                          );
                          setValue(
                            "organization.location.country",
                            location.country,
                          );
                          setValue(
                            "organization.location.countryAbbr",
                            location.countryAbbr,
                          );
                          setValue(
                            "organization.location.coordinates.latitude",
                            location.coordinates[0],
                          );
                          setValue(
                            "organization.location.coordinates.longitude",
                            location.coordinates[1],
                          );
                        }}
                        tabIndex={3}
                        placeholder="Organization Location (city, state, country, etc)..."
                        className="w-full"
                        inputClassName="rounded-lg border-foreground "
                      />
                    )}
                  />
                </section>
              </div>
            </section>
            <section className="xl:pl-18">
              {existingOrgs && (
                <Select onValueChange={() => {}} defaultValue={"1"}>
                  <SelectTrigger className="mt-6 max-w-sm p-8 text-center text-base">
                    <SelectValue placeholder="Select from your events " />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1">Event 1</SelectItem>
                    <SelectItem value="2">Event 2</SelectItem>
                    <SelectItem value="3">Event 3</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
