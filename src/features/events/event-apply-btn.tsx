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
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/applications";
import { EventCategory } from "@/types/event";
import { OpenCallStatus } from "@/types/openCall";
import {
  getExternalErrorHtml,
  getExternalRedirectHtml,
} from "@/utils/loading-page-html";
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  LoaderCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Id } from "~/convex/_generated/dataModel";

interface ApplyButtonShortProps {
  slug: string;
  edition: number;
  appStatus: ApplicationStatus;
  openCall: OpenCallStatus;
  publicView?: boolean;
  appFee: number;
  className?: string;
}

export const ApplyButtonShort = ({
  slug,
  edition,
  appStatus,
  openCall,
  publicView,
  appFee,
  className,
}: ApplyButtonShortProps) => {
  const currentUrl = window.location.href;
  const router = useRouter();
  const href =
    publicView && !openCall
      ? `/thelist/event/${slug}/${edition}`
      : publicView && openCall === "active"
        ? "/pricing#plans"
        : !publicView && openCall
          ? `/thelist/event/${slug}/${edition}/call`
          : `/thelist/event/${slug}/${edition}`;

  const buttonText =
    openCall === "coming-soon"
      ? "Coming Soon!"
      : appStatus && !publicView
        ? "Applied"
        : openCall === "active"
          ? "Apply"
          : "View More";

  return (
    <>
      {/* //removing the target attribute for now as it's not really necessary, I think. The params are all in the url when you view something, so you should go back to that exact same page/filter combo */}

      <Button
        asChild
        onClick={() => {
          window.history.pushState({}, "", currentUrl);
          // sessionStorage.setItem("previousSalPage", window.location.pathname);
          router.push(href);
        }}
        variant="salWithShadowHidden"
        size="lg"
        className={cn(
          "w-full min-w-[100px] cursor-pointer bg-white/60",
          className,
          appStatus !== null &&
            !publicView &&
            "border-foreground/50 bg-background text-foreground/50",
        )}
      >
        <span className="flex items-center gap-x-1">
          {buttonText}
          {appFee > 0 && (
            <CircleDollarSignIcon
              className={cn(
                "size-6 text-red-600",
                appStatus !== null && "text-foreground/50",
              )}
            />
          )}
        </span>
      </Button>
    </>
  );
};

interface ApplyButtonProps {
  id: string;
  openCallId: string;
  slug: string;
  appUrl?: string;
  edition: number;
  finalButton?: boolean;
  manualApplied: ApplicationStatus;
  // setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  isBookmarked: boolean;
  // setIsBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
  isHidden: boolean;
  // setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  eventCategory: EventCategory;
  appFee: number;
  isPreview?: boolean;
  publicView?: boolean;
  openCall: OpenCallStatus;
  className?: string;
  detailCard?: boolean;
}

export const ApplyButton = ({
  id,
  openCallId,
  slug,
  appUrl,
  //isExternalApply, //todo: think about this. Could just use appUrl if it exists to gather the same assumption and user outcome.

  manualApplied: appStatus,
  // setManualApplied,
  isBookmarked,
  // setIsBookmarked,
  // setIsHidden,
  isHidden,
  eventCategory,
  appFee,
  openCall,
  publicView,
  isPreview = false,
  className,
  detailCard,
  edition,
  finalButton,
}: ApplyButtonProps) => {
  const { toggleListAction } = useToggleListAction(id as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const [pending, setPending] = useState(false);
  const finalAppUrl = appUrl?.trim() ? appUrl : "/thelist";

  const onApply = async () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;
    const newTab = window.open("about:blank");

    if (!newTab) {
      toast.error(
        "Application redirect blocked. Please enable popups for this site.",
      );
      console.error("Popup was blocked");
      return;
    }

    newTab.document.write(getExternalRedirectHtml(finalAppUrl));
    newTab.document.close();

    try {
      setPending(true);

      if (!appStatus) {
        await toggleAppActions({
          openCallId: openCallId as Id<"openCalls">,
          manualApplied: true,
        });
      }

      newTab.location.href = finalAppUrl;
    } catch (error) {
      console.error("Application update failed:", error);
      if (!newTab.closed) {
        newTab.document.write(getExternalErrorHtml(finalAppUrl));
        newTab.document.close();
      }
    } finally {
      setPending(false);
    }
  };

  const onBookmark = () => {
    // setIsBookmarked(!isBookmarked);
    toggleListAction({ bookmarked: !isBookmarked });
  };
  const router = useRouter();

  const currentUrl = window.location.href;
  const href =
    detailCard && appUrl
      ? appUrl
      : publicView && !openCall
        ? `/thelist/event/${slug}/${edition}`
        : publicView && openCall === "active"
          ? "/pricing#plans"
          : !publicView && openCall
            ? `/thelist/event/${slug}/${edition}/call`
            : `/thelist/event/${slug}/${edition}`;

  const buttonText =
    openCall === "active"
      ? appStatus !== null && !publicView && !isPreview
        ? appStatus.slice(0, 1).toUpperCase() + appStatus.slice(1).toLowerCase()
        : "Apply"
      : openCall === "ended"
        ? appStatus !== null && !publicView && !isPreview
          ? appStatus.slice(0, 1).toUpperCase() +
            appStatus.slice(1).toLowerCase()
          : "View More"
        : "View More";
  const hasApplied = appStatus !== null;

  return (
    <div
      className={cn(
        "col-span-full mt-4 flex h-14 max-w-[80dvw] items-center justify-center sm:h-11 sm:max-w-[300px] lg:mt-0 lg:px-4",
        !detailCard && "lg:w-[250px]",
        detailCard && "lg:mt-2 lg:w-full",
        className,
      )}
    >
      {!finalButton && (
        <Button
          onClick={() => {
            window.history.pushState({}, "", currentUrl);
            router.push(href);
          }}
          variant="salWithShadowHiddenLeft"
          size="lg"
          className={cn(
            "relative z-[1] w-full cursor-pointer rounded-r-none border-r xl:min-w-[150px]",
            appStatus !== null &&
              !publicView &&
              "border-foreground/50 bg-background text-foreground/50 hover:shadow-llga",
          )}
        >
          <span className="flex items-center gap-x-1">
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
      )}
      {finalButton && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={openCall !== "active"}
              variant="salWithShadowHiddenLeft"
              size="lg"
              className={cn(
                "relative z-[1] h-14 w-full cursor-pointer rounded-r-none border-r sm:h-11 xl:min-w-[150px]",
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
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                Notice: External Redirect
              </AlertDialogTitle>
              <AlertDialogDescription className="text-foreground">
                <span className="flex flex-col gap-y-2">
                  {!appStatus ? (
                    <>
                      <span>
                        This application is located on another website. By
                        clicking apply, a new tab will open, you will be
                        redirected and the application will be marked as
                        &quot;applied&quot; in your dashboard here.
                      </span>
                      <span className="text-xs italic">
                        You can always change the application appStatus if you
                        end up not applying.
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        You&apos;ve already applied for this open call. Do you
                        still want to proceed to the external application?
                      </span>
                    </>
                  )}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogPrimaryAction
                variant="salWithShadow"
                onClick={onApply}
                className="flex items-center gap-x-1 sm:w-40"
              >
                {!appStatus ? "Apply" : "Continue"}{" "}
                {pending && <LoaderCircle className="size-4 animate-spin" />}
              </AlertDialogPrimaryAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {!hasApplied && (
        <Button
          variant="salWithShadowHiddenVert"
          size="lg"
          className={cn(
            "relative z-[2] h-14 w-fit rounded-none border-x px-4 sm:h-11 sm:px-3 [&_svg]:size-6",
            appStatus !== null &&
              !publicView &&
              "border-foreground/50 bg-background text-foreground/50 hover:shadow-vlga",
          )}
          onClick={onBookmark}
        >
          {isBookmarked ? (
            <FaBookmark className="size-7 text-red-500" />
          ) : (
            <FaRegBookmark className="size-7" />
          )}
        </Button>
      )}
      {hasApplied && (
        <Button
          variant="salWithoutShadow"
          size="lg"
          className={cn(
            "pointer-events-none relative z-[2] h-14 w-fit rounded-none border-x border-foreground/50 bg-background px-4 text-foreground/50 hover:bg-background sm:h-11 sm:px-3 [&_svg]:size-6",
          )}
        >
          <CheckCircleIcon className="text-emerald-600 sm:size-5" />
        </Button>
      )}

      <EventContextMenu
        eventId={id}
        openCallId={openCallId}
        // onHide={onHide}
        isHidden={isHidden}
        // setIsHidden={setIsHidden}
        publicView={publicView}
        appStatus={appStatus}
        eventCategory={eventCategory}
        openCallStatus={openCall}
        // setManualApplied={setManualApplied}
        buttonTrigger={true}
        align="end"
        isBookmarked={isBookmarked}
      />
    </div>
  );
};
