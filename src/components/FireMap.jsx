import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import FireMarker from "./FireMarker.jsx";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";

const MAX_RENDERED_HOTSPOTS = 600;

function priorityScore(incident) {
  const frp = Number.parseFloat(incident.frp) || 0;
  return (Number(incident.riskScore) || 0) * 1000 + (Number(incident.confidence) || 0) * 10 + frp;
}

function MapViewport({ center, incidents }) {
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
  }, [map]);

  useEffect(() => {
    if (!incidents.length) {
      map.setView(center, 7, { animate: false });
      return;
    }
    // Live FIRMS observations span a broad Africa pilot boundary. Fit their
    // coordinates so valid points are visible immediately rather than being
    // hidden outside a fixed, city-scale zoom level.
    map.fitBounds(incidents.map((incident) => [incident.lat, incident.lng]), {
      animate: false,
      padding: [24, 24],
      maxZoom: 8,
    });
  }, [map, center, incidents]);
  return null;
}

// Real interactive map (react-leaflet + OpenStreetMap tiles).
export default function FireMap({ incidents, layers, onSelect, selectedId, showImpact, height = 480 }) {
  const selected = incidents.find((i) => i.id === selectedId);
  // FIRMS can return thousands of points for this Africa boundary. Rendering
  // every point with a popup exhausts the browser, so preserve the strongest
  // observations and always retain the currently selected hotspot.
  const visibleIncidents = useMemo(() => [...incidents]
    .sort((left, right) => priorityScore(right) - priorityScore(left))
    .slice(0, MAX_RENDERED_HOTSPOTS), [incidents]);
  const mapIncidents = selected && !visibleIncidents.some((incident) => incident.id === selected.id)
    ? [...visibleIncidents, selected]
    : visibleIncidents;
  // Keep the empty-state map aligned with the configured Africa pilot area.
  // Once live FIRMS events arrive, selecting an event recenters the map on it.
  const center = selected ? [selected.lat, selected.lng] : [-11.5, 27.0];
  // GIBS imagery is generally published with a short delay; yesterday avoids
  // requesting a not-yet-published daily mosaic at the UTC boundary.
  const imageryDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="rounded-lg overflow-hidden border border-line" style={{ height }}>
      <MapContainer center={center} zoom={7} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <MapViewport center={center} incidents={mapIncidents} />
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

        {layers.thermal && mapIncidents.filter((i) => i.persistenceScore > 60).map((i) => (
          <Circle key={"p" + i.id} center={[i.lat, i.lng]} radius={700}
            pathOptions={{ color: "#D97706", fillOpacity: 0, weight: 1.5, dashArray: "4 4" }} />
        ))}

        {layers.thermalEvents && mapIncidents.map((i) => (
          <FireMarker key={i.id} incident={i} onSelect={onSelect} selected={i.id === selectedId} />
        ))}
      </MapContainer>
    </div>
  );
}
