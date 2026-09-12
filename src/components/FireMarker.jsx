import React from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { SEV_STYLE } from "./theme.js";
import { SeverityPill } from "./StatusBadge.jsx";

export default function FireMarker({ incident, onSelect, selected }) {
  const s = SEV_STYLE[incident.risk];
  return (
    <CircleMarker
      center={[incident.lat, incident.lng]}
      radius={selected ? 11 : 8}
      pathOptions={{ color: "#fff", weight: 2, fillColor: s.color, fillOpacity: 0.95 }}
      eventHandlers={{ click: () => onSelect(incident.id) }}
    >
      <Popup>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 11, color: "#5E6573" }}>{incident.id}</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#0F1E2E" }}>{incident.name}</div>
          <div style={{ fontSize: 12, margin: "4px 0", color: "#0F1E2E" }}>
            FRP: <strong>{incident.frp}</strong> · Confidence: <strong>{incident.confidence}%</strong>
          </div>
          <div style={{ fontSize: 12, color: "#0F1E2E" }}>Est. impact: <strong>{incident.impactDirection}</strong></div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
