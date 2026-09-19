import React, { useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import FireMarker from "./FireMarker.jsx";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";

function MapViewport({ center }) {
  const map = useMap();
  useEffect(() => {
    const refresh = () => map.invalidateSize({ animate: false });
    refresh();
    const timer = window.setTimeout(refresh, 150);
    window.addEventListener("resize", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", refresh);
    };
  }, [map, center]);
  return null;
}

// Real interactive map (react-leaflet + OpenStreetMap tiles).
export default function FireMap({ incidents, layers, onSelect, selectedId, showImpact, height = 480 }) {
  const selected = incidents.find((i) => i.id === selectedId);
  const center = selected ? [selected.lat, selected.lng] : [23.2599, 77.4126];
  // GIBS imagery is generally published with a short delay; yesterday avoids
  // requesting a not-yet-published daily mosaic at the UTC boundary.
  const imageryDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="rounded-lg overflow-hidden border border-line" style={{ height }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <MapViewport center={center} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layers.satellite && (
          <TileLayer
            attribution='NASA Global Imagery Browse Services'
            url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${imageryDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`}
            opacity={0.88}
            maxNativeZoom={9}
          />
        )}

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
            pathOptions={{ color: "#D97706", fillOpacity: 0, weight: 1.5, dashArray: "4 4" }} />
        ))}

        {layers.thermalEvents && incidents.map((i) => (
          <FireMarker key={i.id} incident={i} onSelect={onSelect} selected={i.id === selectedId} />
        ))}
      </MapContainer>
    </div>
  );
}
