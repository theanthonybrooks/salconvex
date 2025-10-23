"use client";

import { EventCategory, EventType } from "@/types/eventTypes";

import LeafletMapIcon from "@/components/ui/map-icon";
import ClickToZoom from "@/features/wrapper-elements/map/clickToZoom";
import { cn } from "@/helpers/utilsFns";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { MapContainer, TileLayer } from "react-leaflet";

interface MapPoint {
  latitude: number;
  longitude: number;
  label?: string;
  category?: EventCategory;
  eventType?: EventType;
}

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  label?: string;
  points?: MapPoint[];
  className?: string;
  containerClassName?: string;
  hasDirections?: boolean;
  mapType?: "event" | "full";
}

export default function MapComponent({
  latitude,
  longitude,
  label,
  points,
  className,
  containerClassName,
  hasDirections = false,
  mapType = "event",
}: MapComponentProps) {
  const [overlay, setOverlay] = useState(true);

  // Determine all points (whether single or multiple)
  const allPoints: MapPoint[] = useMemo(() => {
    if (points && points.length > 0) return points;
    if (latitude !== undefined && longitude !== undefined)
      return [{ latitude, longitude, label }];
    return [];
  }, [points, latitude, longitude, label]);

  // Determine map center — average of all points or fallback to single
  const center = useMemo(() => {
    if (allPoints.length === 0) return [0, 0];
    if (allPoints.length === 1)
      return [allPoints[0].latitude, allPoints[0].longitude];
    const avgLat =
      allPoints.reduce((sum, p) => sum + p.latitude, 0) / allPoints.length;
    const avgLng =
      allPoints.reduce((sum, p) => sum + p.longitude, 0) / allPoints.length;
    return [avgLat, avgLng];
  }, [allPoints]);

  return (
    <div className={cn(containerClassName)}>
      <div className={cn("group relative", className)}>
        {overlay && (
          <>
            <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:flex">
              <p className="pointer-events-none select-none text-balance px-5 text-center text-2xl font-bold text-white">
                Click to enable scroll-to-zoom
              </p>
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center rounded-xl bg-black/50 opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100 lg:flex"></div>
          </>
        )}
        <MapContainer
          center={center as [number, number]}
          zoom={mapType === "event" ? 6 : 3}
          scrollWheelZoom={false}
          attributionControl={false}
          className={className}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {allPoints.map((p, i) => (
            <LeafletMapIcon
              key={`${p.latitude}-${p.longitude}-${i}`}
              latitude={p.latitude}
              longitude={p.longitude}
              label={p.label}
            />
          ))}
          <ClickToZoom setOverlay={setOverlay} />
        </MapContainer>
      </div>
      {hasDirections && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          className="flex items-center justify-center gap-x-1 text-sm font-medium underline-offset-2 hover:underline"
        >
          Get directions
          <FaMapLocationDot className="size-5 md:size-4" />
        </a>
      )}
    </div>
  );
}
