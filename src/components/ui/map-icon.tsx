// components/LeafletMapIcon.tsx
"use client";

import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Marker, Popup } from "react-leaflet";

interface LeafletMapIconProps {
  latitude: number;
  longitude: number;
  label?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function LeafletMapIcon({
  latitude,
  longitude,
  label,
  iconSize = 30,
  iconColor = "#E53E3E",
}: LeafletMapIconProps) {
  const iconMarkup = renderToStaticMarkup(
    <div className="leaflet-custom-marker-wrapper">
      <div className="leaflet-custom-shadow" />
      <FaMapMarkerAlt size={iconSize} color={iconColor} />
    </div>,
  );

  const customMarkerIcon = new L.DivIcon({
    html: iconMarkup,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
    className: "custom-icon-marker",
  });

  return (
    <Marker position={[latitude, longitude]} icon={customMarkerIcon}>
      {label && (
        <Popup>
          <div className="flex flex-col gap-y-1 text-sm">
            {label}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70"
            >
              Get Directions
            </a>
          </div>
        </Popup>
      )}
    </Marker>
  );
}
