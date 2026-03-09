"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import type { Neighborhood } from "@/lib/cityData";

import "leaflet/dist/leaflet.css";

// Flies the map to the selected neighborhood whenever `selected` changes
function MapController({ neighborhoods, selected }: { neighborhoods: Neighborhood[]; selected: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    const n = neighborhoods.find((nb) => nb.name === selected);
    if (n) map.flyTo([n.lat, n.lng], 14, { duration: 0.7 });
  }, [selected, neighborhoods, map]);
  return null;
}

type Props = {
  neighborhoods: Neighborhood[];
  center: { lat: number; lng: number };
  budgetMax: number;
  selected: string | null;
  onSelect: (name: string) => void;
};

export default function NeighborhoodMap({ neighborhoods, center, budgetMax, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController neighborhoods={neighborhoods} selected={selected} />
      {neighborhoods.map((n) => {
        const isAffordable = n.avgRent1BR <= budgetMax;
        const isSelected = selected === n.name;
        return (
          <CircleMarker
            key={n.name}
            center={[n.lat, n.lng]}
            radius={isSelected ? 14 : 9}
            pathOptions={{
              fillColor: isSelected ? "#111111" : isAffordable ? "#1a6b4a" : "#c0392b",
              fillOpacity: 0.9,
              color: "#ffffff",
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{ click: () => onSelect(n.name) }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>{n.name}</span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
