// TODO: remove the redirect from the layout.tsx file once the map is actually functional

"use client";

import { useEffect } from "react";

import WorldMapComponent from "@/components/ui/map/map-component";

export default function WorldMapPage() {
  useEffect(() => {
    sessionStorage.setItem("previousSalPage", "/map");
    // document.cookie =
    //   "login_url=/map; path=/; max-age=300; SameSite=Lax; Secure";
  }, []);

  return <WorldMapComponent />;
}
