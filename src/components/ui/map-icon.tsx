// components/LeafletMapIcon.tsx
"use client";

import type { MapPoint } from "@/features/events/event-leaflet";
import type { EventCategory } from "@/types/eventTypes";

import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup } from "react-leaflet";

import { FaMapMarkerAlt } from "react-icons/fa";

import { formatEventLink } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";

type LeafletMapIconProps = MapPoint & {
  iconSize?: number;
  iconColor?: string;
  type?: "worldMap" | "event";
  activeSub?: boolean;
};

export const categoryClasses: Record<EventCategory | "archive", string> = {
  event: "text-map-icon",
  roster: "text-map-blue",
  gfund: "text-map-green",
  archive: "text-slate-500",
  residency: "text-map-lilac",
  project: "text-map-orange",
};

export default function LeafletMapIcon({
  latitude,
  longitude,
  label,
  meta,
  iconSize = 30,
  // iconColor = "#E53E3E",
  type = "event",
  activeSub,
}: LeafletMapIconProps) {
  // const iconMarkup = renderToStaticMarkup(
  //   <div className="leaflet-custom-marker-wrapper">
  //     <div className="leaflet-custom-shadow" />
  //     <FaMapMarkerAlt size={iconSize} color={iconColor} />
  //   </div>,
  // );

  const isArchived = meta?.state === "archived";
  const key = isArchived ? "archive" : (meta?.category ?? "event");
  const iconClassName = categoryClasses[key];

  const iconMarkup = renderToStaticMarkup(
    <div className="leaflet-custom-marker-wrapper relative flex h-[30px] w-[30px] items-center justify-center">
      <div className="leaflet-custom-shadow" />
      <div className="absolute h-[40%] w-[40%] -translate-y-1 rounded-full bg-card" />
      <FaMapMarkerAlt className={cn(iconClassName)} size={iconSize} />
    </div>,
  );

  const customMarkerIcon = new L.DivIcon({
    html: iconMarkup,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
    className: "custom-icon-marker",
  });

  const linkUrl =
    type === "worldMap" && meta
      ? formatEventLink(
          {
            dates: { edition: meta.edition },
            slug: meta.slug,
            hasOpenCall: meta.hasOpenCall,
          },
          activeSub,
          true,
        )
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <Marker position={[latitude, longitude]} icon={customMarkerIcon}>
      {label && (
        <Popup>
          <div className="flex flex-col gap-y-1 px-2 py-1 text-sm">
            <strong> {label}</strong>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70"
            >
              {type === "event" ? "Get Directions" : "View Details"}
            </a>
          </div>
        </Popup>
      )}
    </Marker>
  );
}
