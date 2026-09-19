import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import MapControls from "../components/MapControls.jsx";
import MapLegend from "../components/MapLegend.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";

// Leaflet requires browser globals. Loading it only for this route keeps the
// dashboard startup safe in Next.js while still rendering the interactive map.
const FireMap = dynamic(() => import("../components/FireMap.jsx"), {
  ssr: false,
  loading: () => <div className="rounded-lg border border-line bg-white p-6 text-sm text-slateink">Loading Africa fire map…</div>,
});

export default function FireMapPage() {
  const { incidents, openIncident } = useApp();
  const [layers, setLayers] = useState({ thermalEvents: true, thermal: true, infrastructure: true, industrial: true, satellite: false });
  const [selectedId, setSelectedId] = useState(null);
  const [showImpact, setShowImpact] = useState(true);
  const selected = incidents.find((i) => i.id === selectedId);
  const hotspotSummary = incidents.length > 600
    ? `Showing the 600 highest-priority observations from ${incidents.length.toLocaleString()} live detections.`
    : `${incidents.length.toLocaleString()} live detections available.`;

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
            Zambia–southern DRC basemap with live NASA FIRMS detections. {hotspotSummary}
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
