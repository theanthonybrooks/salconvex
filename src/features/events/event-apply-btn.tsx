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
import { TooltipSimple } from "@/components/ui/tooltip";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/applications";
import { EventCategory, EventData } from "@/types/event";
import { CallType, OpenCallState, OpenCallStatus } from "@/types/openCall";
import { User, UserPref } from "@/types/user";
import {
  getExternalErrorHtml,
  getExternalRedirectHtml,
} from "@/utils/loading-page-html";
import { useMutation } from "convex/react";
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
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ApplyButtonShortProps {
  slug: string;
  edition: number;
  appStatus: ApplicationStatus;
  openCall: OpenCallStatus;
  publicView?: boolean;
  appFee: number;
  className?: string;
  user: User | null;
  activeSub: boolean;
}

export const ApplyButtonShort = ({
  slug,
  edition,
  appStatus,
  openCall,
  publicView,
  appFee,
  className,
  user,
  activeSub,
}: ApplyButtonShortProps) => {
  const isArtist = user?.accountType?.includes("artist");
  const hasValidSub = activeSub && isArtist;
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
      : appStatus && !publicView && hasValidSub
        ? "Applied"
        : "Read More";

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
  id: Id<"events">;
  event: EventData;
  openCallId: Id<"openCalls"> | null;
  openCallState: OpenCallState | null;
  mainOrgId: Id<"organizations">;
  isUserOrg: boolean;

  slug: string;
  appUrl?: string | null;
  appLinkformat?: string;
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
  publicPreview?: boolean;
  orgPreview?: boolean;
  userPref?: UserPref | null;
  user?: User | null;
  activeSub: boolean;
  callType?: CallType;
  fontSize?: "text-sm" | "text-base";
}

export const ApplyButton = ({
  id,
  event,
  openCallId,
  openCallState,
  mainOrgId,
  isUserOrg,

  slug,
  appUrl,
  appLinkformat,
  user,
  userPref,
  activeSub,
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
  orgPreview,
  isPreview = false,
  className,
  detailCard,
  edition,
  finalButton,
  publicPreview,
  callType,
  fontSize = "text-sm",
}: ApplyButtonProps) => {
  const autoApply = userPref?.autoApply ?? true;

  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const isEmail = callType === "Email" || appLinkformat === "mailto:";
  const noSub = !activeSub && (publicPreview || publicView || finalButton);

  const isArtist = user?.accountType?.includes("artist");
  const hasValidSub = activeSub && isArtist;

  const isAdmin = user?.role?.includes("admin") || false;
  const nonArtistAdmin = isAdmin && !isArtist;
  // console.log("noSub: ", noSub);
  const { toggleListAction } = useToggleListAction(id as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const [pending, setPending] = useState(false);
  const finalAppUrl = appUrl?.trim() ? appUrl : "/thelist";

  const onApply = async () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;

    setPending(true);

    // if (isEmail) {
    //   console.log("isEmail: ", isEmail);
    //   return;
    // }

    // const newTab = window.open("about:blank");

    // if (!newTab) {
    //   toast.error(
    //     "Application redirect blocked. Please enable popups for this site.",
    //   );
    //   console.error("Popup was blocked");
    //   return;
    // }

    // newTab.document.write(getExternalRedirectHtml(finalAppUrl));
    // newTab.document.close();
    let newTab: Window | null = null;

    try {
      if (!appStatus && openCall === "active" && autoApply && !orgPreview) {
        await toggleAppActions({
          openCallId: openCallId as Id<"openCalls">,
          manualApplied: true,
        });
      }
      await updateUserLastActive({ email: user?.email ?? "" });

      if (isEmail && appUrl) {
        window.location.href = appUrl;
        return;
      }

      newTab = window.open("about:blank");
      if (!newTab) {
        toast.error(
          "Application redirect blocked. Please enable popups for this site.",
        );
        console.error("Popup was blocked");
        return;
      }
      newTab.document.write(getExternalRedirectHtml(finalAppUrl));
      newTab.document.close();

      newTab.location.href = finalAppUrl;
    } catch (error) {
      console.error("Application update failed:", error);
      if (newTab && !newTab.closed) {
        newTab.document.write(getExternalErrorHtml(finalAppUrl));
        newTab.document.close();
      }
    } finally {
      setPending(false);
    }
  };

  const onBookmark = async () => {
    if (orgPreview) return;
    // setIsBookmarked(!isBookmarked);
    toggleListAction({ bookmarked: !isBookmarked });
    try {
      await updateUserLastActive({ email: user?.email ?? "" });
    } catch (error) {
      console.error("Error updating last active:", error);
    }
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
      ? appStatus !== null && hasValidSub
        ? appStatus.slice(0, 1).toUpperCase() + appStatus.slice(1).toLowerCase()
        : isPreview
          ? "Read More"
          : orgPreview
            ? "Test Apply"
            : isEmail
              ? "Send Email"
              : "Apply"
      : openCall === "ended"
        ? appStatus !== null && hasValidSub
          ? appStatus.slice(0, 1).toUpperCase() +
            appStatus.slice(1).toLowerCase()
          : orgPreview || nonArtistAdmin
            ? "Test Link"
            : "Read More"
        : orgPreview || nonArtistAdmin
          ? "Test Link"
          : "Read More";
  const hasApplied = appStatus !== null && hasValidSub;

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
            "relative z-[1] w-full cursor-pointer xl:min-w-[150px]",
            appStatus !== null &&
              hasValidSub &&
              !publicView &&
              "border-foreground/50 bg-background text-foreground/50 hover:shadow-llga",
          )}
        >
          <span className={cn("flex items-center gap-x-1", fontSize)}>
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
      {finalButton && !isEmail && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={
                (openCall !== "active" && !isAdmin && !orgPreview) ||
                (noSub && !isAdmin && !orgPreview)
              }
              variant={
                nonArtistAdmin
                  ? "salWithShadowHidden"
                  : "salWithShadowHiddenLeft"
              }
              size="lg"
              className={cn(
                "relative z-[1] h-14 w-full cursor-pointer sm:h-11 xl:min-w-[150px]",
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
                  {!orgPreview && !appStatus && openCall === "active" && (
                    <>
                      {autoApply && (
                        <>
                          <span>
                            This application is located on another website. By
                            clicking apply, a new tab will open, you will be
                            redirected and the application will be marked as
                            &quot;applied&quot; in your dashboard here.
                          </span>
                          <span className="text-xs italic">
                            You can disable this in your account settings if you
                            don&apos;t want this to happen
                          </span>
                        </>
                      )}
                      {!autoApply && (
                        <span>
                          This application is located on another website. By
                          clicking apply, a new tab will open and you will be
                          redirected
                        </span>
                      )}
                    </>
                  )}
                  {!orgPreview && appStatus && (
                    <>
                      <span>
                        You&apos;ve already applied for this open call. Do you
                        still want to proceed to the external application?
                      </span>
                    </>
                  )}
                  {!orgPreview && !appStatus && openCall === "ended" && (
                    <>
                      <span>
                        This application is closed. You can&apos;t apply for
                        this open call, though you can still view it.
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
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogPrimaryAction
                variant="salWithShadow"
                onClick={onApply}
                className="flex items-center gap-x-1 sm:w-40"
              >
                {!orgPreview && !appStatus && openCall === "active"
                  ? "Apply"
                  : "Continue"}{" "}
                {pending && <LoaderCircle className="size-4 animate-spin" />}
              </AlertDialogPrimaryAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {finalButton && isEmail && (
        <Button
          disabled={
            (openCall !== "active" && !isAdmin && !orgPreview) ||
            (noSub && !isAdmin && !orgPreview)
          }
          variant="salWithShadowHiddenLeft"
          size="lg"
          className={cn(
            "relative z-[1] h-14 w-full cursor-pointer rounded-r-none border-r sm:h-11 xl:min-w-[150px]",
            appStatus !== null &&
              !publicView &&
              hasValidSub &&
              "border-foreground/50 bg-background text-foreground/80 hover:shadow-llga",
          )}
          onClick={onApply}
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
      )}

      {!orgPreview && !hasApplied && !nonArtistAdmin && (
        <TooltipSimple
          content={isBookmarked ? "Remove Bookmark" : "Bookmark"}
          side="top"
        >
          <Button
            disabled={!hasValidSub && !isAdmin}
            variant="salWithShadowHiddenVert"
            size="lg"
            className={cn(
              "relative z-[2] h-14 w-fit rounded-none border-x px-4 sm:h-11 sm:px-3 [&_svg]:size-6",
              appStatus !== null &&
                !publicView &&
                hasValidSub &&
                "border-foreground/50 bg-background text-foreground/50 hover:shadow-vlga",
            )}
            onClick={onBookmark}
          >
            {isBookmarked && hasValidSub ? (
              <FaBookmark className="size-7 text-red-500" />
            ) : (
              <FaRegBookmark className="size-7" />
            )}
          </Button>
        </TooltipSimple>
      )}
      {!orgPreview && hasApplied && hasValidSub && !nonArtistAdmin && (
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

      {!nonArtistAdmin && (
        <EventContextMenu
          event={event}
          eventId={id}
          isUserOrg={isUserOrg}
          mainOrgId={mainOrgId}
          openCallId={openCallId}
          openCallState={openCallState}
          // onHide={onHide}
          isHidden={isHidden}
          // setIsHidden={setIsHidden}
          publicView={publicView || noSub}
          appLink={appUrl}
          appStatus={appStatus}
          eventCategory={eventCategory}
          openCallStatus={openCall}
          // setManualApplied={setManualApplied}
          buttonTrigger={true}
          align="end"
          isBookmarked={isBookmarked}
          orgPreview={orgPreview}
          postStatus={event.posted}
          postOptions={isAdmin}
        />
      )}
    </div>
  );
};
