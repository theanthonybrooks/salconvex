"use client";

import LeafletMapIcon from "@/components/ui/map-icon";
import ClickToZoom from "@/features/wrapper-elements/map/clickToZoom";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { MapContainer, TileLayer } from "react-leaflet";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  containerClassName?: string;
  hasDirections?: boolean;
}

export default function MapComponent({
  latitude,
  longitude,
  label,
  className,
  containerClassName,
  hasDirections = false,
}: MapComponentProps) {
  const [overlay, setOverlay] = useState(true);

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
          center={[latitude, longitude]}
          zoom={6}
          scrollWheelZoom={false}
          attributionControl={false}
          className={className}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <LeafletMapIcon
            latitude={latitude}
            longitude={longitude}
            label={label}
          />
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
