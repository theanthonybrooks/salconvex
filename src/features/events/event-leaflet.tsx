"use client";

import LeafletMapIcon from "@/components/ui/map-icon";
import ClickToZoom from "@/features/wrapper-elements/map/clickToZoom";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
}

export default function MapComponent({
  latitude,
  longitude,
  label,
  className,
}: MapComponentProps) {
  const [overlay, setOverlay] = useState(true);

  return (
    <div className={cn("group relative", className)}>
      {/* Add an overlay to let people know that they need to click to zoom. Also added some state that controls its visibility */}
      {overlay && (
        <>
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="pointer-events-none select-none text-2xl font-bold text-white">
              Click to enable scroll-to-zoom
            </p>
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50 opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100"></div>
        </>
      )}
      <MapContainer
        center={[latitude, longitude]}
        zoom={4}
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
  );
}
