"use client"

import LeafletMapIcon from "@/components/ui/map-icon"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer } from "react-leaflet"

interface MapComponentProps {
  latitude: number
  longitude: number
  label?: string
  className?: string
}

export default function MapComponent({
  latitude,
  longitude,
  label,
  className,
}: MapComponentProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={4}
      scrollWheelZoom={true}
      attributionControl={false}
      className={className}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <LeafletMapIcon latitude={latitude} longitude={longitude} label={label} />
    </MapContainer>
  )
}
