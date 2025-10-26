"use client";

import { EventCategory, EventType } from "@/types/eventTypes";

import LeafletMapIcon from "@/components/ui/map-icon";
import ClickToZoom from "@/features/wrapper-elements/map/clickToZoom";
import { cn } from "@/helpers/utilsFns";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { FaMapLocationDot } from "react-icons/fa6";
import { MaximizeIcon, Minimize } from "lucide-react";

import type { HasOpenCallType } from "~/convex/schema";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { usePreloadedQuery } from "convex/react";

export type MapPoint = {
  latitude: number;
  longitude: number;
  label?: string;
  meta?: {
    category: EventCategory;
    eventType?: EventType[];
    slug: string;
    hasOpenCall: HasOpenCallType;
    logo: string;
    description?: string;
    edition: number;
  };
};

export type LocationType =
  | "locale"
  | "city"
  | "region"
  | "state"
  | "country"
  | "continent"
  | "unknown"
  | "full";
interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  label?: string;
  points?: MapPoint[];
  locationType?: LocationType;
  className?: string;
  containerClassName?: string;
  hasDirections?: boolean;
  mapType?: "event" | "full";
  fullScreen?: boolean;
  setFullScreen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MapComponent({
  latitude,
  longitude,
  label,
  points,
  locationType,
  className,
  containerClassName,
  hasDirections = false,
  mapType = "event",
  fullScreen,
  setFullScreen,
}: MapComponentProps) {
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const isAdmin = userData?.user?.role?.includes("admin");
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};

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
  //TODO: map this in to determine the zoom level based on the country. I started working on this in the locationFns file.

  const zoomLevel = (() => {
    switch (locationType) {
      case "locale":
        return 12;
      case "city":
        return 9;
      case "region":
        return 7;
      case "state":
        return 6;
      case "country":
        return 5;
      case "continent":
        return 3;
      case "full":
        return 1;
      default:
        return mapType === "event" ? 6 : 3;
    }
  })();

  // console.log(zoomLevel);

  return (
    <div className={cn(containerClassName)}>
      <div className={cn("group relative", className)}>
        {overlay && mapType === "event" && (
          <>
            <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:flex">
              <p className="pointer-events-none select-none text-balance px-5 text-center text-2xl font-bold text-white">
                Click to enable scroll-to-zoom
              </p>
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center rounded-xl bg-black/50 opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100 lg:flex"></div>
          </>
        )}
        {setFullScreen && (
          <button
            className="absolute right-2 top-2 z-10 rounded border-2 border-muted-foreground/60 bg-card p-2 hover:scale-105 hover:cursor-pointer active:scale-95"
            onClick={() => setFullScreen((prev) => !prev)}
          >
            {fullScreen ? (
              <Minimize className="size-4 text-foreground" />
            ) : (
              <MaximizeIcon className="size-4 text-foreground" />
            )}
          </button>
        )}
        <MapContainer
          center={center as [number, number]}
          zoom={zoomLevel}
          scrollWheelZoom={false}
          attributionControl={false}
          className={cn("z-0 h-full w-full")}
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
              meta={p.meta}
              type={mapType === "full" ? "worldMap" : "event"}
              activeSub={hasActiveSubscription || isAdmin}
            />
          ))}
          {mapType === "event" && <ClickToZoom setOverlay={setOverlay} />}
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
