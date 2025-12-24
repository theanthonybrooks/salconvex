import type { OpenCallStatus } from "@/types/openCallTypes";
import type { User } from "@/types/user";

import { useState } from "react";
import {
  getExternalErrorHtml,
  getExternalRedirectHtml,
} from "@/utils/loading-page-html";
import { toast } from "react-toastify";

import {
  Check,
  CircleDollarSignIcon,
  ClipboardIcon,
  LoaderCircle,
  X,
} from "lucide-react";

import type { ApplicationStatus } from "~/convex/schema";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPrimaryAction,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { TooltipSimple } from "@/components/ui/tooltip";
import { AutoApplyToggle } from "@/features/artists/components/auto-apply-toggle";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { AnalyticsSrcType } from "~/convex/schema";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";

type ApplyRedirectDialogProps = {
  userProps: {
    user?: User | null;
    appStatus: ApplicationStatus | null;
    autoApply: boolean;
    isUserOrg: boolean;
  };
  buttonProps: {
    publicView?: boolean;
    orgPreview?: boolean;
    disabled: boolean;
    buttonText: string;
  };
  openCallProps: {
    eventId: Id<"events">;
    openCallId: Id<"openCalls"> | null;
    appFee: number;
    openCallStatus: OpenCallStatus;
    format: "https" | "mailto";
    finalAppUrl: string;
  };
};

export const ApplyRedirectDialog = ({
  userProps,
  buttonProps,
  openCallProps,
}: ApplyRedirectDialogProps) => {
  const { user, appStatus, autoApply, isUserOrg } = userProps;
  const { publicView, disabled, buttonText, orgPreview } = buttonProps;
  const { appFee, openCallStatus, format, openCallId, finalAppUrl, eventId } =
    openCallProps;

  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");
  const nonArtistAdmin = isAdmin && !isArtist;
  const isEmail = format === "mailto";
  const appLink = useQuery(
    api.openCalls.openCall.getOpenCallAppLink,
    isEmail && openCallId ? { openCallId } : "skip",
  );
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const updateEventAnalytics = useMutation(
    api.analytics.eventAnalytics.markEventAnalytics,
  );
  const { toggleAppActions } = useArtistApplicationActions();
  const [pending, setPending] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  async function runPostApplyUpdates() {
    if (!appStatus && openCallStatus === "active" && autoApply && !orgPreview) {
      await toggleAppActions({
        openCallId: openCallId as Id<"openCalls">,
        manualApplied: true,
      });
    }

    await updateUserLastActive({ email: user?.email ?? "" });
  }

  function runAnalytics(
    action: "bookmark" | "view" | "apply",
    src: AnalyticsSrcType,
  ) {
    if (isAdmin || isUserOrg) return;

    updateEventAnalytics({
      eventId,
      plan: user?.plan ?? 0,
      action,
      src,
      userType: user?.accountType,
      hasSub: true,
    });
  }

  const onApply = async () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;
    const webLink = format === "https";

    setPending(true);
    let newTab: Window | null = null;
    if (webLink) {
      newTab = window.open("about:blank");
      if (!newTab) {
        toast.error("Application redirect blocked. Please enable popups.");
        console.error("Popup was blocked");
        setPending(false);
        return;
      }
      newTab.document.write(getExternalRedirectHtml(finalAppUrl));

      newTab.document.close();
    } else {
      window.location.href = finalAppUrl;
    }

    try {
      await runPostApplyUpdates();
      if (newTab) newTab.location.href = finalAppUrl;
    } catch (error) {
      console.error("Application update failed:", error);
      if (newTab && !newTab.closed) {
        newTab.document.write(getExternalErrorHtml(finalAppUrl));
        newTab.document.close();
      }
    } finally {
      setPending(false);
      runAnalytics(appStatus ? "view" : "apply", "ocPage");
    }
  };

  const handleCopyAppLink = () => {
    try {
      if (!appLink) throw new Error("Application link not found");

      navigator.clipboard.writeText(appLink);
      setCopied(true);
      runAnalytics("apply", "ocPage");
      showToast("success", "Email address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy email address:", error);
      showToast("error", "Failed to copy email address");
    } finally {
      runPostApplyUpdates();
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={disabled || pending}
          variant={
            nonArtistAdmin ? "salWithShadowHidden" : "salWithShadowHiddenLeft"
          }
          size="lg"
          className={cn(
            "relative z-[1] h-14 w-full max-w-[150px] cursor-pointer sm:h-11",
            appStatus !== null &&
              !publicView &&
              "border-foreground/50 bg-background text-foreground/80 hover:shadow-llga",
          )}
        >
          <span className="flex items-center gap-x-1 text-base">
            {buttonText}
            {appFee > 0 && !publicView && (
              <CircleDollarSignIcon
                className={cn(
                  "size-6 text-red-600",
                  appStatus !== null && "text-foreground/50",
                )}
              />
            )}
          </span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
        <AlertDialogCancel
          iconOnly
          className="absolute right-2 top-2 hidden hover:text-red-600 sm:block"
        >
          <X size={30} />
        </AlertDialogCancel>

        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-2xl">
            {isEmail ? "Email Redirect" : " Notice: External   Redirect"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            <>
              {isEmail ? (
                <span>Note: This open call requires applying via email.</span>
              ) : (
                <span>This application is located on another website.</span>
              )}
            </>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className={cn("py-2 text-sm")}>
          {isEmail ? (
            <span className="flex flex-col gap-y-2">
              <span>
                Click the <strong>{autoApply ? "Apply" : "Continue"}</strong>{" "}
                button to open your preferred email client
              </span>
              {autoApply && (
                <span>
                  You can track your applications in your{" "}
                  <Link
                    href="/dashboard/artist/apps"
                    target="_blank"
                    variant="underline"
                    className="text-sm"
                  >
                    artist dashboard
                  </Link>
                </span>
              )}
            </span>
          ) : (
            <span className="flex flex-col gap-y-2">
              {!orgPreview && !appStatus && openCallStatus === "active" && (
                <>
                  {autoApply ? (
                    <span>
                      By clicking apply, a new tab will open, you will be
                      redirected and the application will be marked as
                      &quot;applied&quot; in your{" "}
                      <Link
                        href="/dashboard/artist/apps"
                        target="_blank"
                        variant="underline"
                        className="text-sm"
                      >
                        artist dashboard
                      </Link>
                    </span>
                  ) : (
                    <span>
                      By clicking continue, a new tab will open and you will be
                      redirected
                    </span>
                  )}
                </>
              )}
              {!orgPreview && appStatus && (
                <>
                  <span>
                    You&apos;ve already applied for this open call. Do you still
                    want to proceed to the external application? You can view
                    your applications{" "}
                    <Link
                      href="/dashboard/artist/apps"
                      target="_blank"
                      variant="underline"
                      className="text-sm"
                    >
                      here
                    </Link>
                    .
                  </span>
                </>
              )}
              {!orgPreview && !appStatus && openCallStatus === "ended" && (
                <>
                  <span>
                    This application is closed. You can&apos;t apply for this
                    open call, though you can still view it.
                  </span>
                </>
              )}
              {orgPreview && (
                <span>
                  This is a preview of your application link. You will be
                  redirected.
                </span>
              )}
            </span>
          )}
        </div>
        <AlertDialogFooter className={cn("items-center sm:justify-between")}>
          <AutoApplyToggle />
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <div className={cn("flex w-full flex-row justify-between gap-2")}>
              <AlertDialogPrimaryAction
                variant={isEmail ? "salWithShadowHidden" : "salWithShadow"}
                onClick={onApply}
                className="flex w-full items-center gap-x-1 sm:w-40"
              >
                {!orgPreview &&
                !appStatus &&
                openCallStatus === "active" &&
                autoApply
                  ? "Apply"
                  : "Continue"}{" "}
                {pending && <LoaderCircle className="size-4 animate-spin" />}
              </AlertDialogPrimaryAction>
              {appLink && (
                <TooltipSimple content="Copy email address" side="top">
                  <Button
                    variant="salWithShadowHidden"
                    onClick={handleCopyAppLink}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <ClipboardIcon className="size-4" />
                    )}
                  </Button>
                </TooltipSimple>
              )}
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
