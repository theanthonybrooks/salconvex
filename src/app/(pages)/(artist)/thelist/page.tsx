import EventCardPreview from "@/features/events/event-card-preview"

const TheList = () => {
  return (
    <div className='px-6 flex flex-col items-center '>
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
