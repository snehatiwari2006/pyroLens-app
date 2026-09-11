import React from "react";
import { MapContainer, TileLayer, Circle, CircleMarker } from "react-leaflet";
import FireMarker from "./FireMarker.jsx";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";

// Real interactive map (react-leaflet + OpenStreetMap tiles). Swap the
// TileLayer url for a GIS/satellite basemap when integrating live data.
export default function FireMap({ incidents, layers, onSelect, selectedId, showImpact, height = 480 }) {
  const selected = incidents.find((i) => i.id === selectedId);
  const center = selected ? [selected.lat, selected.lng] : [19.08, 72.88];

  return (
    <div className="rounded-lg overflow-hidden border border-line" style={{ height }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showImpact && selected && IMPACT_ZONE_RINGS.map((ring) => (
          <Circle
            key={ring.key}
            center={[selected.lat, selected.lng]}
            radius={ring.radiusKm * 1000}
            pathOptions={{ color: ring.color, fillColor: ring.color, fillOpacity: ring.opacity, weight: 1 }}
          />
        ))}

        {layers.thermal && incidents.filter((i) => i.persistenceScore > 60).map((i) => (
          <Circle key={"p" + i.id} center={[i.lat, i.lng]} radius={700}
            pathOptions={{ color: "#215C8E", fillOpacity: 0, weight: 1, dashArray: "4 4" }} />
        ))}

        {layers.thermalEvents && incidents.map((i) => (
          <FireMarker key={i.id} incident={i} onSelect={onSelect} selected={i.id === selectedId} />
        ))}
      </MapContainer>
    </div>
  );
}
