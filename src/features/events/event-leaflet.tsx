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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { ResetViewOnFullScreen } from "@/helpers/mapFns";

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
  fullScreen: boolean;
  setFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
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
        return 2;
      default:
        return mapType === "event" ? 6 : 3;
    }
  })();

  // console.log(zoomLevel);

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
        <Dialog open={fullScreen} onOpenChange={setFullScreen}>
          <DialogTrigger asChild>
            <button className="absolute right-2 top-2 z-10 rounded border-2 border-foreground/40 bg-card p-2 hover:scale-105 hover:cursor-pointer active:scale-95">
              <TooltipSimple content="Enter Full Screen" side="top">
                <MaximizeIcon className="size-4 text-foreground" />
              </TooltipSimple>
            </button>
          </DialogTrigger>

          <MapContainer
            center={center as [number, number]}
            zoom={zoomLevel}
            scrollWheelZoom={false}
            attributionControl={false}
            className="z-0 h-full w-full"
            maxBounds={[
              [-85, -180],
              [85, 180],
            ]}
            maxBoundsViscosity={1.0}
            minZoom={2}
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
            <ResetViewOnFullScreen
              fullScreen={fullScreen}
              center={center as [number, number]}
              zoomLevel={zoomLevel}
            />
            <ClickToZoom setOverlay={setOverlay} />
          </MapContainer>

          <DialogContent className="z-[100] h-[95dvh] w-[90dvw] max-w-none overflow-hidden rounded-lg bg-background p-0 sm:h-screen sm:w-screen sm:rounded-none">
            <DialogTitle className="sr-only">Map Full View</DialogTitle>
            <button
              onClick={() => setFullScreen(false)}
              className="absolute right-4 top-4 z-[401] rounded border-2 border-foreground/40 bg-card p-2 hover:scale-105 active:scale-95"
            >
              <TooltipSimple
                content="Exit Full Screen"
                side="bottom"
                className="z-[402]"
              >
                <Minimize className="size-4 text-foreground" />
              </TooltipSimple>
            </button>

            <MapContainer
              center={center as [number, number]}
              zoom={zoomLevel}
              scrollWheelZoom
              attributionControl={false}
              className="h-full w-full"
              maxBounds={[
                [-85, -180],
                [85, 180],
              ]}
              maxBoundsViscosity={1.0}
              minZoom={2}
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
                  type="worldMap"
                  activeSub={hasActiveSubscription || isAdmin}
                />
              ))}
            </MapContainer>
          </DialogContent>
        </Dialog>

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
    </div>
  );
}
