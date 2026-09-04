"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Lead } from "@/lib/types";

function SetViewOnLeads({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [map, center]);
  return null;
}

export default function LeadMap({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return <div className="h-[320px] rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">Map appears once leads are scraped</div>;
  }
  const center: [number, number] = [
    leads.reduce((s, l) => s + (l.lat || 19.06), 0) / leads.length,
    leads.reduce((s, l) => s + (l.lng || 72.83), 0) / leads.length,
  ];
  return (
    <div className="h-[320px] rounded-lg overflow-hidden border border-border relative z-0">
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
        <SetViewOnLeads center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {leads.map((l) => (
          <CircleMarker
            key={l.id}
            center={[l.lat || 19.06, l.lng || 72.83]}
            radius={7}
            pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.85, weight: 2 }}
          >
            <Tooltip>{l.name}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
