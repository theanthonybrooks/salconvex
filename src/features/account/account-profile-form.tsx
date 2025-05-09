"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogCloseBtn } from "@/components/ui/dialog-close-btn";

import { ArtistProfileForm } from "@/features/artists/artist-profile-form";
import { EventOCForm } from "@/features/events/event-add-form";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { usePreloadedQuery } from "convex/react";
import { isBefore } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
}

export const AccountSubscribeForm = ({
  className,
  mode,
  user,
  children,
  onClick,
}: AccountSubscribeFormProps) => {
  const { preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const trialEndsAt = subData?.trialEndsAt;
  const trialEnded = trialEndsAt && isBefore(new Date(trialEndsAt), new Date());
  const activeSub = subData?.subStatus === "active";
  const router = useRouter();
  const isArtist = mode === "artist";
  const [open, setOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const alertDialogDescription = isArtist
    ? hasUnsavedChanges
      ? "You have unsaved changes. Please save first to ensure that your changes are saved."
      : "You can always continue the subscription process later."
    : activeStep > 0
      ? "Sure? You can always continue the submission process at a later time. We've saved your event to a draft in your dashboard."
      : "Sure? You can always start the submission process at a later time.";

  const unsavedAlertDescription = isArtist
    ? "All unsaved changes will be lost. Please save first"
    : "Please save to ensure your changes are saved";

  const unsavedAlertTitle = isArtist
    ? "Discard unsaved changes?"
    : "Exit submission form?";

  const AlertTitle = isArtist
    ? "Exit artist profile form?"
    : "Exit submission form?";

  const handleClose = (withSave = false) => {
    setActiveStep(0);
    if (withSave) {
      setShouldExit(true);
      setTimeout(() => {
        setShouldExit(false);
      }, 5000);
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DialogHeader
          className="w-full"
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              e.stopPropagation();
              sessionStorage.setItem("src", "newUser");
              router.push("/auth/register");
            }
          }}
        >
          {children}
        </DialogHeader>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          "max-h-full w-full max-w-full bg-card md:h-auto md:max-w-lg",
          className,
          !isArtist &&
            "h-dvh md:h-full md:max-w-full xl:max-h-[95vh] xl:max-w-[98vw]",
        )}
      >
        <>
          <DialogTitle className={cn(!isArtist && "sr-only")}>
            {isArtist
              ? activeSub
                ? "Update Artist Profile"
                : trialEnded
                  ? "Update Artist Plan"
                  : "Create Artist Profile"
              : "Add New Call"}
          </DialogTitle>
          {isArtist && (
            <DialogDescription>
              {isArtist
                ? "Add information needed to apply for open calls"
                : "Add open call for your project or event"}
            </DialogDescription>
          )}
        </>
        {isArtist ? (
          <ArtistProfileForm
            user={user}
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
          />
        )}
        {hasUnsavedChanges ? (
          <DialogCloseBtn
            title={unsavedAlertTitle}
            description={unsavedAlertDescription}
            onAction={() => {
              handleClose(true);
            }}
            actionTitle="Save Draft & Exit"
            onPrimaryAction={() => {
              handleClose(false);
            }}
            primaryActionTitle="Exit"
            className="w-full"
          />
        ) : (
          <DialogCloseBtn
            title={AlertTitle}
            description={alertDialogDescription}
            onAction={() => {
              handleClose(false);
            }}
            actionTitle="Exit"
            className="w-full"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
