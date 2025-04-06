"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function ClickToZoom() {
  const map = useMap();

  useEffect(() => {
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();

    const container = map.getContainer();

    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      enable();
      // Disable scroll again when clicking anywhere else
      document.addEventListener("click", handleOutsideClick);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        disable();
        document.removeEventListener("click", handleOutsideClick);
      }
    };

    container.addEventListener("click", onClick);

    return () => {
      container.removeEventListener("click", onClick);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [map]);

  return null;
}
