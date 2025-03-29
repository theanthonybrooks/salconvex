import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"
import { CheckCircle, CircleX, Ellipsis, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ApplicationStatus, EventCategory, OpenCallStatus } from "@/types/event"
import React from "react"

interface EventContextMenuProps {
  isHidden: boolean
  setIsHidden: React.Dispatch<React.SetStateAction<boolean>>
  eventStatus: ApplicationStatus | null
  eventCategory: EventCategory
  openCallStatus: OpenCallStatus
  setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>
  publicView?: boolean
  buttonTrigger?: boolean
}

const EventContextMenu = ({
  isHidden,
  setIsHidden,
  publicView,
  eventStatus,
  eventCategory,
  openCallStatus,
  setManualApplied,
  buttonTrigger,
}: EventContextMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {buttonTrigger ? (
          <Button
            variant='salWithShadowHidden'
            size='lg'
            className='rounded-l-none border-l w-fit sm:px-2 px-2'>
            <Ellipsis className='size-8' />
          </Button>
        ) : (
          <Ellipsis className='size-7 cursor-pointer' />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className='text-sm '>
        <DropdownMenuLabel>More options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='p-1 flex flex-col gap-y-1'>
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
          {openCallStatus === "active" && (
            <DropdownMenuItem
              onClick={() =>
                setManualApplied(status !== null ? null : "applied")
              }
              className={cn(
                "cursor-pointer text-sm",
                publicView && "hidden",
                eventStatus
                  ? " text-emerald-700 hover:text-black/80"
                  : "hover:text-emerald-700 text-black/80"
              )}>
              {eventStatus ? (
                <span className='flex items-center gap-x-1 text-sm'>
                  <CircleX className='size-4' />
                  Mark as Not Applied
                </span>
              ) : (
                <span className='flex items-center gap-x-1 text-sm'>
                  <CheckCircle className='size-4' />
                  Mark as Applied
                </span>
              )}
            </DropdownMenuItem>
          )}
          {publicView && (
            <DropdownMenuItem
              className={cn(
                "cursor-pointer text-sm",

                eventStatus
                  ? " text-emerald-700 hover:text-black/80"
                  : "hover:text-emerald-700 text-black/80"
              )}>
              <Link href='/pricing#plans'>
                Subscribe to bookmark, hide, or apply
              </Link>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EventContextMenu
