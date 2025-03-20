import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { mockEventData } from "@/data/mockEventData"
import EventCardPreview from "@/features/events/event-card-preview"

const TheList = () => {
  return (
    <div className='px-6 flex flex-col items-center '>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#' />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href='#'>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href='#' />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Map through mockEventData to render EventCardPreview components */}
      {mockEventData.map((event, index) => (
        <EventCardPreview key={index} {...event} />
      ))}
    </div>
  )
}

export default TheList
