import { Button } from "@/components/ui/button";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { cn } from "@/lib/utils";
import { EventCategory } from "@/types/event";
import { ApplicationStatus, OpenCallStatus } from "@/types/openCall";
import { CircleDollarSignIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { Id } from "~/convex/_generated/dataModel";

interface ApplyButtonShortProps {
  slug: string;
  edition: number;
  status: ApplicationStatus;
  openCall: OpenCallStatus;
  publicView?: boolean;
  appFee: number;
}

export const ApplyButtonShort = ({
  slug,
  edition,
  status,
  openCall,
  publicView,
  appFee,
}: ApplyButtonShortProps) => {
  const currentUrl = window.location.href;
  const router = useRouter();
  const href =
    publicView && !openCall
      ? `/thelist/event/${slug}/${edition}`
      : publicView && openCall === "active"
        ? "/pricing#plans"
        : openCall === "active"
          ? `/thelist/event/${slug}/call/${edition}`
          : `/thelist/event/${slug}/${edition}`;

  const buttonText =
    openCall === "coming-soon"
      ? "Coming Soon!"
      : status && !publicView
        ? "Applied"
        : openCall === "active"
          ? "Apply"
          : "View More";

  return (
    <>
      {/* //removing the target attribute for now as it's not really necessary, I think. The params are all in the url when you view something, so you should go back to that exact same page/filter combo */}

      <Button
        asChild
        // onClick={() => {
        //   if (status === null) {
        //     setManualApplied("applied")
        //   }
        // }}
        onClick={() => {
          window.history.pushState({}, "", currentUrl);
          router.push(href);
        }}
        variant="salWithShadowHidden"
        size="lg"
        className={cn(
          "w-full min-w-[100px] cursor-pointer bg-white/60",
          status !== null &&
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
                status !== null && "text-foreground/50",
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
  manualApplied: status,
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
}: ApplyButtonProps) => {
  const { toggleListAction } = useToggleListAction(id as Id<"events">);

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
          : openCall === "active"
            ? `/thelist/event/${slug}/call/${edition}`
            : `/thelist/event/${slug}/${edition}`;

  const buttonText =
    openCall === "active"
      ? status !== null && !publicView && !isPreview
        ? status.slice(0, 1).toUpperCase() + status.slice(1).toLowerCase()
        : "Apply"
      : "View More";

  return (
    <div
      className={cn(
        "col-span-full mt-4 flex items-center justify-center lg:mt-0 lg:px-4",
        !detailCard && "lg:w-[250px]",
        detailCard && "lg:mt-4 lg:w-full",
        className,
      )}
    >
      <Button
        onClick={() => {
          // if (status === null) {
          //   setManualApplied("applied")
          // }
          window.history.pushState({}, "", currentUrl);
          router.push(href);
        }}
        // onClick={() => {
        //   if (status === null) {
        //     setManualApplied("applied")
        //   }
        // }}
        //Todo: Add this to the event detail page and it will sync the state to the main page. Easy peasy
        variant="salWithShadowHidden"
        size="lg"
        className={cn(
          "w-full cursor-pointer rounded-r-none border-r xl:min-w-[150px]",
          status !== null &&
            !publicView &&
            "border-foreground/50 bg-background text-foreground/50",
        )}
      >
        <span className="flex items-center gap-x-1">
          {buttonText}
          {appFee > 0 && !publicView && (
            <CircleDollarSignIcon
              className={cn(
                "size-6 text-red-600",
                status !== null && "text-foreground/50",
              )}
            />
          )}
        </span>
      </Button>

      <Button
        variant="salWithShadowHidden"
        size="lg"
        className={cn(
          "w-fit rounded-none border-x px-3 sm:px-3",
          status !== null &&
            !publicView &&
            "border-foreground/50 bg-background text-foreground/50",
        )}
        onClick={onBookmark}
      >
        {isBookmarked ? (
          <FaBookmark className="size-6 text-red-500" />
        ) : (
          <FaRegBookmark className="size-6" />
        )}
      </Button>
      {/* <Button
      variant='salWithShadowHidden'
      size='lg'
      className='rounded-l-none border-l w-fit sm:px-2 px-2'
      onClick={() => setIsHidden(!isHidden)}>
      {isHidden ? (
        <EyeOff className='size-8 text-red-500' />
      ) : (
        <Eye className='size-8' />
      )}
    </Button> */}
      <EventContextMenu
        eventId={id}
        openCallId={openCallId}
        // onHide={onHide}
        isHidden={isHidden}
        // setIsHidden={setIsHidden}
        publicView={publicView}
        appStatus={status}
        eventCategory={eventCategory}
        openCallStatus={openCall}
        // setManualApplied={setManualApplied}
        buttonTrigger={true}
        align="end"
      />
    </div>
  );
};
