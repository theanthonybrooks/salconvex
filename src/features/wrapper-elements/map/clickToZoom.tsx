"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface ClickToZoomProps {
  setOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ClickToZoom({ setOverlay }: ClickToZoomProps) {
  const map = useMap();

  useEffect(() => {
    const enable = () => {
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.dragging.enable();
    };
    const disable = () => {
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.dragging.disable();
    };

    const container = map.getContainer();

    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      enable();
      setOverlay(false);

      document.addEventListener("click", handleOutsideClick);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        disable();
        setOverlay(true);
        document.removeEventListener("click", handleOutsideClick);
      }
    };

    container.addEventListener("click", onClick);

    return () => {
      container.removeEventListener("click", onClick);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [map, setOverlay]);

  return null;
}
