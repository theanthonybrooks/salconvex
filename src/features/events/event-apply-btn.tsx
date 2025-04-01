import { Button } from "@/components/ui/button"
import EventContextMenu from "@/features/events/ui/event-context-menu"
import { cn } from "@/lib/utils"
import { EventCategory } from "@/types/event"
import { ApplicationStatus, OpenCallStatus } from "@/types/openCall"
import { CircleDollarSignIcon } from "lucide-react"
import Link from "next/link"
import React from "react"
import { FaBookmark, FaRegBookmark } from "react-icons/fa6"

interface ApplyButtonShortProps {
  id: string
  status: ApplicationStatus
  openCall: OpenCallStatus
  publicView?: boolean
  appFee: number
}

export const ApplyButtonShort = ({
  id,
  status,
  openCall,
  publicView,
  appFee,
}: ApplyButtonShortProps) => {
  const href =
    publicView && !openCall
      ? `/thelist/event/${id}`
      : publicView && openCall === "active"
      ? "/pricing#plans"
      : openCall === "active"
      ? `/thelist/call/${id}`
      : `/thelist/event/${id}`

  const buttonText =
    openCall === "coming-soon"
      ? "Coming Soon!"
      : status && !publicView
      ? "Applied"
      : openCall === "active"
      ? "Apply"
      : "View More"

  return (
    <>
      {/* //removing the target attribute for now as it's not really necessary, I think. The params are all in the url when you view something, so you should go back to that exact same page/filter combo */}
      <Link href={href} passHref>
        <Button
          asChild
          // onClick={() => {
          //   if (status === null) {
          //     setManualApplied("applied")
          //   }
          // }}
          variant='salWithShadowHidden'
          size='lg'
          className={cn(
            " w-full min-w-[100px] bg-white/60",
            status !== null &&
              !publicView &&
              "text-foreground/50 border-foreground/50 bg-background"
          )}>
          <span className='flex items-center gap-x-1'>
            {buttonText}
            {appFee > 0 && (
              <CircleDollarSignIcon
                className={cn(
                  "size-6 text-red-600",
                  status !== null && "text-foreground/50"
                )}
              />
            )}
          </span>
        </Button>
      </Link>
    </>
  )
}

interface ApplyButtonProps {
  id: string
  manualApplied: ApplicationStatus
  setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>
  isBookmarked: boolean
  setIsBookmarked: React.Dispatch<React.SetStateAction<boolean>>
  isHidden: boolean
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>
  eventCategory: EventCategory
  appFee: number
  isPreview?: boolean
  publicView?: boolean
  openCall: OpenCallStatus
  className?: string
  detailCard?: boolean
}

const ApplyButton = ({
  id,
  manualApplied: status,
  setManualApplied,
  isBookmarked,
  setIsBookmarked,
  setIsHidden,
  isHidden,
  eventCategory,
  appFee,
  openCall,
  publicView,
  isPreview = false,
  className,
  detailCard,
}: ApplyButtonProps) => {
  const href =
    publicView && !openCall
      ? `/thelist/event/${id}`
      : publicView && openCall === "active"
      ? "/pricing#plans"
      : openCall === "active"
      ? `/thelist/call/${id}`
      : `/thelist/event/${id}`

  const buttonText =
    openCall === "active"
      ? status !== null && !publicView && !isPreview
        ? `Applied: ${
            status.slice(0, 1).toUpperCase() + status.slice(1).toLowerCase()
          }`
        : "Apply"
      : "View More"

  return (
    <div
      className={cn(
        "col-span-full  mt-4 lg:mt-0 flex items-center justify-center lg:px-4 ",
        !detailCard && "lg:w-[250px]",
        detailCard && "lg:w-full lg:mt-4",
        className
      )}>
      <Link href={href} passHref target={!publicView ? "_blank" : "_self"}>
        <Button
          asChild
          // onClick={() => {
          //   if (status === null) {
          //     setManualApplied("applied")
          //   }
          // }}
          //Todo: Add this to the event detail page and it will sync the state to the main page. Easy peasy
          variant='salWithShadowHidden'
          size='lg'
          className={cn(
            "rounded-r-none border-r w-full xl:min-w-[150px]",
            status !== null &&
              !publicView &&
              "text-foreground/50 border-foreground/50 bg-background"
          )}>
          <span className='flex items-center gap-x-1'>
            {buttonText}
            {appFee > 0 && !publicView && (
              <CircleDollarSignIcon
                className={cn(
                  "size-6 text-red-600",
                  status !== null && "text-foreground/50"
                )}
              />
            )}
          </span>
        </Button>
      </Link>
      <Button
        variant='salWithShadowHidden'
        size='lg'
        className='rounded-none border-x w-fit sm:px-3 px-3'
        onClick={() => setIsBookmarked(!isBookmarked)}>
        {isBookmarked ? (
          <FaBookmark className='size-6 text-red-500 ' />
        ) : (
          <FaRegBookmark className='size-6 ' />
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
        isHidden={isHidden}
        setIsHidden={setIsHidden}
        publicView={publicView}
        eventStatus={status}
        eventCategory={eventCategory}
        openCallStatus={openCall}
        setManualApplied={setManualApplied}
        buttonTrigger={true}
      />
    </div>
  )
}

export default ApplyButton
