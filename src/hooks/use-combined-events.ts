import { useMemo } from "react";

import { EventCategory, EventData, EventType } from "@/types/event";
import { ApplicationStatus, OpenCall, OpenCallStatus } from "@/types/openCall";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "~/convex/_generated/api";

export type CombinedEventPreviewCardData = EventData & {
  tabs: { opencall: OpenCall | null };

  bookmarked: boolean;
  manualApplied?: boolean;
  hidden: boolean;
  status: ApplicationStatus | null;
  hasActiveOpenCall: boolean;
  appFee?: number;
  openCallStatus: OpenCallStatus | null;
  adminNoteOC?: string | null;
  eventId: string;
  slug: string;
};

export const useEventPreviewCards = (): CombinedEventPreviewCardData[] => {
  const events = useQuery(api.events.event.getPublishedEvents);
  const openCalls = useQuery(api.openCalls.openCall.getPublishedOpenCalls);
  const artistData = useQuery(api.artists.artistActions.getArtistApplications);
  const { applications, listActions } = artistData ?? {};

  // if (!events) return [];

  return useMemo(() => {
    if (!events) return [];
    return events
      .filter((event) => event.state === "published")
      .flatMap<CombinedEventPreviewCardData>((event) => {
        if (!openCalls) return [];

        const filteredOpenCalls = openCalls
          .filter((oc) => oc.eventId === event._id)
          .filter((oc) => oc.state === "published");

        if (filteredOpenCalls.length === 0) {
          const listAction = listActions?.find(
            (la) => la.eventId === event._id,
          );

          return [
            {
              ...(event as unknown as EventData),
              tabs: {
                opencall: null,
              },
              eventType: event.eventType as
                | [EventType]
                | [EventType, EventType],
              eventCategory: event.eventCategory as EventCategory,

              bookmarked: listAction?.bookmarked ?? false,
              hidden: listAction?.hidden ?? false,
              status: null,
              adminNoteOC: null,
              appFee: 0,
              hasActiveOpenCall: false,
              openCallStatus: null,
              eventId: event._id,
              slug: event.slug,
            },
          ];
        }

        // Case: Event has one or more open calls
        return filteredOpenCalls.map((openCall) => {
          const listAction = listActions?.find(
            (la) => la.eventId === event._id,
          );

          const application = applications?.find(
            (app) => app.openCallId === openCall?._id,
          );

          const ocDates = openCall?.basicInfo?.dates;
          const ocType = openCall?.basicInfo?.callType;

          const now = new Date();
          const start = ocDates?.ocStart ? new Date(ocDates.ocStart) : null;
          const end = ocDates?.ocEnd ? new Date(ocDates.ocEnd) : null;

          let openCallStatus: OpenCallStatus | null = null;
          if (start && end && ocType === "Fixed") {
            if (now < start) openCallStatus = "coming-soon";
            else if (now > end) openCallStatus = "ended";
            else openCallStatus = "active";
          } else if (!start && end && ocType === "Fixed") {
            if (now > end) openCallStatus = "ended";
            else openCallStatus = "active";
          } else if (ocType === "Rolling") {
            openCallStatus = "active";
          } else if (ocType === "Email" && end) {
            if (now > end) openCallStatus = "ended";
            else openCallStatus = "active";
          } else {
            openCallStatus = null;
          }

          const hasActiveOpenCall = openCallStatus === "active";

          return {
            ...(event as unknown as EventData),
            tabs: { opencall: openCall as unknown as OpenCall },
            eventType: event.eventType as [EventType] | [EventType, EventType],
            eventCategory: event.eventCategory as EventCategory,
            bookmarked: listAction?.bookmarked ?? false,
            hidden: listAction?.hidden ?? false,
            status:
              (application?.applicationStatus as ApplicationStatus) ?? null,
            manualApplied: application?.manualApplied ?? false,
            adminNoteOC: openCall?.adminNoteOC ?? null,
            appFee: openCall?.basicInfo.appFee ?? 0,
            hasActiveOpenCall,
            openCallStatus,
            eventId: event._id,
            slug: event.slug,
          };
        });
      });
  }, [applications, events, listActions, openCalls]);
};
