"use client";

import { useDevice } from "@/providers/device-provider";
import type {
  EventClickArg,
  EventInput,
  MoreLinkArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

type Props = {
  events: EventInput[];
  onEventClick: (arg: EventClickArg) => void;
  onMoreLinkClick: (arg: MoreLinkArg) => void;
};

const Calendar = ({ events, onEventClick, onMoreLinkClick }: Props) => {
  const { isMobile } = useDevice();
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
      initialView={isMobile ? "listWeek" : "dayGridMonth"}
      events={events}
      eventClick={onEventClick}
      moreLinkClick={onMoreLinkClick}
      eventClassNames="hover:cursor-pointer"
      dayMaxEventRows={4}
      dayMaxEvents={true}
      //without this, I don't know... it shows the number (index +1) of events, but it adds some janky spacing and I don't know why. Couldn't see anything in inspect.
    />
  );
};

export default Calendar;
