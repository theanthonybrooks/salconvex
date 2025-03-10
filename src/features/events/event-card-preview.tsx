"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bookmark, CircleDollarSignIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface EventCardPreviewProps {
  path: string
}

const EventCardPreview = ({ path }: EventCardPreviewProps) => {
  const router = useRouter()
  return (
    <Card className='bg-white/40 border-black/20  grid grid-rows-[auto_1fr] grid-cols-[75px_auto_50px] min-w-[340px] max-w-[400px] gap-x-3 rounded-3xl mb-10 first:mt-6 px-1 py-2 '>
      <div className='row-span-2 col-span-1 flex flex-col items-center justify-between pt-3 pb-3 pl-2'>
        <div className='rounded-full bg-white border-2 h-12 w-12 relative'>
          <p className='text-xs absolute left-0 top-0 translate-x-1/3 translate-y-[80%]'>
            Logo
          </p>
        </div>
        <div className='border-dotted border-1.5 h-11 w-14 rounded-lg flex flex-col justify-center items-center py-[5px]'>
          <span className='text-2xs leading-[0.85rem]'>Call Type</span>
          <span className='text-lg font-black leading-[0.85rem]'>E</span>
          <span className='text-2xs leading-[0.85rem]'>Event</span>
        </div>
      </div>

      {/* <CardHeader>
          <CardTitle>The List</CardTitle>
        </CardHeader>*/}
      <div className='pt-3 pb-3 flex-col flex gap-y-3 '>
        <div className='flex flex-col gap-y-1 mb-2'>
          <div className='flex flex-col gap-y-1 mb-2'>
            <p className='text-base font-semibold'>Painted Walls...</p>
            <p className='text-sm'>City, (state), Country</p>
          </div>
          <p className='text-sm'>
            <span className='font-semibold'>Event:</span> June 5-18, 2025
          </p>
          <p className='text-sm'>
            <span className='font-semibold'>Deadline:</span> Feb 18, 2025
          </p>
          <p className='text-sm'>
            <span className='font-semibold'>Budget:</span> $10,000+
          </p>
          <p className='text-sm'>
            <span className='font-semibold'>Eligible:</span>{" "}
            <span className='text-red-600'>US Artists*</span>
          </p>
        </div>
        <Button
          variant='salWithShadowHidden'
          size='lg'
          className='bg-white/60'
          onClick={() => router.push(path)}>
          View More
        </Button>
      </div>
      <div className='flex flex-col items-center justify-between pt-5 pb-5 pr-2'>
        <CircleDollarSignIcon className='h-6 w-6 text-red-600' />
        <div className='flex gap-x-2 items-center justify-center'>
          {/* <EyeOff className='h-6 w-6' /> //NOTE: Move this to the detailed card view */}
          <Bookmark className='h-8 w-8' />
        </div>
      </div>
    </Card>
  )
}

export default EventCardPreview
