"use client";

import { User } from "@/types/user";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { isBefore } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogCloseBtn } from "@/components/ui/dialog-close-btn";
import { ArtistProfileForm } from "@/features/artists/artist-profile-form-dialog";
import { EventOCForm } from "@/features/events/event-add-form";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

// type BaseTaskValues = {
//   title: string

//   priority: "low" | "medium" | "high"
// }

export type ModeType = "artist" | "organizer";

interface AccountSubscribeFormProps {
  className?: string;
  mode: ModeType;
  user: User | undefined;
  onClick: () => void;
  children?: React.ReactNode;
  planKey: string;
  isEligibleForFree: boolean;
  isCurrentUserPlan?: boolean;
}

export const AccountSubscribeForm = ({
  className,
  mode,
  user,
  children,
  onClick,
  planKey,
  isEligibleForFree,
  isCurrentUserPlan,
}: AccountSubscribeFormProps) => {
  const { preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};
  const trialEndsAt = subData?.trialEndsAt;
  const trialEnded = trialEndsAt && isBefore(new Date(trialEndsAt), new Date());
  const activeSub = subData?.subStatus === "active";
  const router = useRouter();
  const isArtist = mode === "artist";
  const [open, setOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editedSections, setEditedSections] = useState<
    ("event" | "openCall")[]
  >([]);
  // const postType =
  //   planKey === "1" ? "eventOnly" : planKey === "2" ? "freeCall" : "paidCall";

  // console.log(isEligibleForFree, planKey, postType);

  const alertDialogDescription = isArtist
    ? hasUnsavedChanges
      ? "You have unsaved changes. Please save first to ensure that your changes are saved."
      : activeSub
        ? "You can always update your artist profile later"
        : "You can always continue the subscription process later"
    : activeStep > 0 && editedSections.length > 0
      ? "Sure? You can always continue the submission process at a later time. We've saved your event to a draft in your dashboard."
      : "Sure? You can always start the submission process at a later time.";

  const unsavedAlertDescription = isArtist
    ? "All unsaved changes will be lost. Please save first"
    : "Please save to ensure your changes aren't lost";

  const unsavedAlertTitle = isArtist
    ? "Discard unsaved changes?"
    : "Exit submission form?";

  const AlertTitle = isArtist
    ? "Exit artist profile form?"
    : "Exit submission form?";

  const handleClose = (withSave = false) => {
    if (withSave) {
      console.log("with save");
      setShouldExit(true);
      setTimeout(() => {
        setActiveStep(0);
        setShouldExit(false);
        setEditedSections([]);
      }, 5000);
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          if (!user) {
            e.preventDefault();
            e.stopPropagation();
            sessionStorage.setItem("src", "newUser");
            router.push("/auth/register");
          }
          if (
            hasActiveSubscription &&
            isCurrentUserPlan !== undefined &&
            !isCurrentUserPlan &&
            isArtist
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          "max-h-dvh w-full max-w-full bg-card md:h-auto",
          // "scrollable",
          className,
          isArtist && "md:max-w-[max(60rem,32vw)]",
          !isArtist &&
            "h-dvh md:h-full md:max-w-full xl:max-h-[95vh] xl:max-w-[min(1500px,95vw)]",
        )}
      >
        <DialogTitle className={cn(!isArtist && "sr-only")}>
          {isArtist
            ? activeSub
              ? "Update Artist Profile"
              : trialEnded
                ? "Update Artist Plan"
                : "Create Artist Profile"
            : "Add New Call"}
        </DialogTitle>
        {hasUnsavedChanges ? (
          <DialogCloseBtn
            title={unsavedAlertTitle}
            description={unsavedAlertDescription}
            onAction={() => {
              handleClose(false);
            }}
            primaryActionTitle="Save Draft & Exit"
            onPrimaryAction={() => {
              handleClose(true);
            }}
            actionTitle="Exit"
            className={cn("w-full")}
            triggerClassName={cn(isArtist && "right-2 top-2")}
          />
        ) : (
          <DialogCloseBtn
            title={AlertTitle}
            description={alertDialogDescription}
            onAction={() => {
              handleClose(editedSections.length > 0);
            }}
            actionTitle="Exit"
            className={cn("w-full")}
            triggerClassName={cn(isArtist && "right-2 top-2")}
          />
        )}

        <DialogDescription className={cn(!isArtist && "sr-only")}>
          {isArtist
            ? "Add information to your artist profile"
            : `Add an ${planKey === "1" ? "event" : "open call"} for your project or
            event`}
        </DialogDescription>

        <></>
        {isArtist ? (
          <ArtistProfileForm
            subData={subData}
            onClick={onClick}
            hasUnsavedChanges={hasUnsavedChanges}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        ) : (
          <EventOCForm
            user={user}
            onClick={onClick}
            hasUnsavedChanges={hasUnsavedChanges}
            setHasUnsavedChanges={setHasUnsavedChanges}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            shouldClose={shouldExit}
            setShouldClose={setShouldExit}
            setOpen={setOpen}
            editedSections={editedSections}
            setEditedSections={setEditedSections}
            isEligibleForFree={isEligibleForFree}
            planKey={planKey}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
