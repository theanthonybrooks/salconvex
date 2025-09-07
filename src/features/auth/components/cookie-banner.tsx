"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import { useMutation, usePreloadedQuery } from "convex/react";
import { CookieIcon, ExternalLink } from "lucide-react";
import { api } from "~/convex/_generated/api";

export const CookieBanner = () => {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const updateCookiePreferences = useMutation(
    api.users.updateUserCookiePreferences,
  );
  const user = userData?.user;
  const cookiePreferences = userData?.userPref?.cookiePrefs;

  if (!user) return null;

  return (
    <Dialog defaultOpen={!cookiePreferences}>
      <DialogContent
        className="max-w-[90vw] bg-card sm:max-w-2xl"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className={cn("flex flex-col gap-3")}>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CookieIcon className="size-7 text-foreground" /> Cookie Preferences
          </DialogTitle>
          <DialogDescription className="sr-only border-t-2 border-foreground/50 pt-3 text-start">
            This website uses cookies strictly for user authentication and
            account functionality, ensuring the site operates smoothly. We do
            not use cookies for advertising or share your personal data with
            third parties. By continuing to use this site, you agree to our use
            of cookies. You can learn more in our{" "}
            <Link
              href="/privacy"
              className={cn(
                "inline-flex items-center gap-1 text-base font-semibold sm:text-sm",
              )}
            >
              privacy policy <ExternalLink className="size-4" />
            </Link>
            .
          </DialogDescription>
        </DialogHeader>
        <section
          className={cn(
            "flex flex-col gap-2 border-t-2 border-foreground/50 pt-4 text-start",
          )}
        >
          <span>
            This website uses cookies strictly for user authentication and
            account functionality, ensuring the site operates smoothly. We do
            not use cookies for advertising or share your personal data with
            third parties.
          </span>
          <span>
            By continuing to use this site, you agree to our use of cookies. You
            can learn more in our{" "}
            <Link
              href="/privacy"
              className={cn("inline-flex items-center gap-1 font-semibold")}
            >
              privacy policy <ExternalLink className="size-4" />
            </Link>
          </span>
        </section>

        <DialogFooter className="mt-2 flex w-full flex-col items-center justify-between gap-2 sm:flex-col sm:justify-between sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="salWithShadowHiddenYlw"
              className={cn("w-full")}
              onClick={() => updateCookiePreferences({ cookiePrefs: "all" })}
            >
              Accept Cookies
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="salWithShadowHidden"
              className={cn("w-full")}
              onClick={() =>
                updateCookiePreferences({ cookiePrefs: "required" })
              }
            >
              Reject Non-Essential
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
