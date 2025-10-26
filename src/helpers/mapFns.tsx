import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function ResetViewOnFullScreen({
  fullScreen,
  center,
  zoomLevel,
}: {
  fullScreen?: boolean;
  center: [number, number];
  zoomLevel: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.setView(center, zoomLevel);
      map.invalidateSize();
    }
  }, [fullScreen, center, map, zoomLevel]);

  return null;
}
