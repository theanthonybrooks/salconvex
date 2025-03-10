import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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

      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
      <EventCardPreview path={"/thelist/event"} />
    </div>
  )
}

export default TheList
