import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import FireMap from "../components/FireMap.jsx";
import MapControls from "../components/MapControls.jsx";
import MapLegend from "../components/MapLegend.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";

export default function FireMapPage() {
  const { incidents, openIncident } = useApp();
  const [layers, setLayers] = useState({ thermalEvents: true, thermal: true, infrastructure: true, industrial: true, satellite: false });
  const [selectedId, setSelectedId] = useState(null);
  const [showImpact, setShowImpact] = useState(true);
  const selected = incidents.find((i) => i.id === selectedId);

  const toggle = (k) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  return (
    <div>
      <SectionHeader title="Fire & impact intelligence map"
        desc="Central Africa operational view: live thermal events, persistence, industrial risk and estimated impact zones." />
      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <MapControls layers={layers} onToggle={toggle} showImpact={showImpact} onToggleImpact={() => setShowImpact((v) => !v)} />
          <FireMap incidents={incidents} layers={layers} onSelect={setSelectedId} selectedId={selectedId} showImpact={showImpact} />
          <p className="text-xs text-slateink">
            Zambia–southern DRC basemap with live NASA FIRMS detections. An empty map means no active detection has been returned for the selected time window.
          </p>
        </div>
        <div className="space-y-4">
          <MapLegend />
          {selected && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slateink">{selected.id}</span>
                <SeverityPill level={selected.risk} size="sm" />
              </div>
              <div className="font-semibold text-sm mb-2 text-ink">{selected.name}</div>
              <div className="text-xs space-y-1 mb-3 text-slateink">
                <div>FRP: <strong className="text-ink">{selected.frp}</strong></div>
                <div>Confidence: <strong className="text-ink">{selected.confidence}%</strong></div>
                <div>Est. impact direction: <strong className="text-ink">{selected.impactDirection}</strong></div>
              </div>
              <button onClick={() => openIncident(selected)} className="btn-secondary w-full">Open incident details</button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
