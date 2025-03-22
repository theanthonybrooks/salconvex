import dynamic from "next/dynamic"

// Lazy-load your actual Map component with SSR disabled
export const LazyMap = dynamic(() => import("../../events/event-leaflet"), {
  ssr: false,
})
