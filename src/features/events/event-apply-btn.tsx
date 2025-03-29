import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ApplicationStatus, EventCategory, OpenCallStatus } from "@/types/event"
import {
  CheckCircle,
  CircleDollarSignIcon,
  CircleX,
  Ellipsis,
  Eye,
  EyeOff,
} from "lucide-react"
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
  const href = publicView
    ? "/pricing"
    : openCall === "active"
    ? `/thelist/call/${id}`
    : `/thelist/event/${id}`

  const buttonText =
    openCall === "coming-soon"
      ? "Coming Soon!"
      : openCall === "ended"
      ? "View More"
      : status
      ? "Applied"
      : openCall === "active"
      ? "Apply"
      : "View More"

  return (
    <>
      <Link href={href} passHref target={publicView ? "_blank" : "_self"}>
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
  console.log("openCall", openCall)
  const href = publicView
    ? "/pricing"
    : openCall === "active"
    ? `/thelist/call/${id}`
    : `/thelist/event/${id}`

  const buttonText =
    publicView ||
    openCall === null ||
    openCall === "coming-soon" ||
    openCall === "ended"
      ? "View More"
      : status !== null
      ? //TODO: Refactor this. The status values have changed and it's not working as expected.
        "Applied"
      : (status === null && openCall === "active") || isPreview
      ? "Apply"
      : `Applied: ${
          status === "accepted"
            ? "Accepted"
            : status === "rejected"
            ? "Rejected"
            : "Pending"
        }`

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='salWithShadowHidden'
            size='lg'
            className='rounded-l-none border-l w-fit sm:px-2 px-2'>
            <Ellipsis className='size-8' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>More options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsHidden(!isHidden)}
            className={cn(
              "cursor-pointer text-black/80  hover:text-red-500",
              publicView && "hidden"
            )}>
            {isHidden ? (
              <span className='flex items-center gap-x-1 '>
                <EyeOff className='size-4' />
                Unhide {eventCategory === "event" ? "Event" : "Open Call"}
              </span>
            ) : (
              <span className='flex items-center gap-x-1 '>
                <Eye className='size-4' />
                Hide {eventCategory === "event" ? "Event" : "Open Call"}
              </span>
            )}
          </DropdownMenuItem>
          {openCall === "active" && (
            <DropdownMenuItem
              onClick={() =>
                setManualApplied(status !== null ? null : "applied")
              }
              className={cn(
                "cursor-pointer",
                publicView && "hidden",
                status
                  ? " text-emerald-700 hover:text-black/80"
                  : "hover:text-emerald-700 text-black/80"
              )}>
              {status ? (
                <span className='flex items-center gap-x-1'>
                  <CircleX className='size-4' />
                  Mark as Not Applied
                </span>
              ) : (
                <span className='flex items-center gap-x-1'>
                  <CheckCircle className='size-4' />
                  Mark as Applied
                </span>
              )}
            </DropdownMenuItem>
          )}
          {publicView && (
            <DropdownMenuItem
              className={cn(
                "cursor-pointer",

                status
                  ? " text-emerald-700 hover:text-black/80"
                  : "hover:text-emerald-700 text-black/80"
              )}>
              Subscribe to bookmark, hide, or apply
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ApplyButton
