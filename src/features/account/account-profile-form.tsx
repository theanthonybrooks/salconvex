import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ArtistProfileForm } from "@/features/artists/artist-profile-form";
import { EventOCForm } from "@/features/events/event-add-form";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import React from "react";

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

  return (
    <Dialog>
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
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          "max-h-full w-full max-w-full bg-card md:h-auto md:max-w-lg",
          className,
          !isArtist &&
            "h-dvh lg:h-full lg:max-w-full xl:max-h-[95vh] xl:max-w-[98vw]",
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
          <ArtistProfileForm user={user} onClick={onClick} />
        ) : (
          <EventOCForm user={user} onClick={onClick} />
        )}
      </DialogContent>
    </Dialog>
  );
};
