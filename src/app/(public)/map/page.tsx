// TODO: remove the redirect from the layout.tsx file once the map is actually functional

"use client";

import WorldMapComponent from "@/components/ui/map/map-component";
import { useEffect } from "react";

export default function WorldMapPage() {
  useEffect(() => {
    sessionStorage.setItem("previousSalPage", "/map");
  }, []);

  return <WorldMapComponent />;
}
