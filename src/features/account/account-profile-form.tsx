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
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
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
  const router = useRouter();
  const isArtist = mode === "artist";
  const [open, setOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const alertDialogDescription = isArtist
    ? "You can always continue the subscription process later."
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

  const handleClose = () => {
    setActiveStep(0);
    setShouldExit(true);
    //save changes if necessary (within the form)

    if (!hasUnsavedChanges) {
      setOpen(false);
    }
    console.log("clicked exit");
    setTimeout(() => {
      setOpen(false);
      setShouldExit(false);
    }, 100);
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
            {isArtist ? "Create Artist Profile" : "Add New Call"}
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
          />
        )}
        {hasUnsavedChanges ? (
          <DialogCloseBtn
            title={unsavedAlertTitle}
            description={unsavedAlertDescription}
            onAction={handleClose}
            actionTitle="Save Draft & Exit"
            onPrimaryAction={handleClose}
            primaryActionTitle="Exit"
            className="w-full"
          />
        ) : (
          <DialogCloseBtn
            title={AlertTitle}
            description={alertDialogDescription}
            onAction={handleClose}
            actionTitle="Exit"
            className="w-full"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
