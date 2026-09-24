import React, { useState, Suspense, lazy } from "react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import MapControls from "../components/MapControls.jsx";
import MapLegend from "../components/MapLegend.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";

// Dynamic import for Leaflet map component (avoids SSR issues)
const FireMap = lazy(() => import("../components/FireMap.jsx").then(module => ({ default: module.default })));

export default function FireMapPage() {
  const { incidents, openIncident, refreshError } = useApp();
  const [layers, setLayers] = useState({
    thermalEvents: true,
    thermal: true,
    infrastructure: true,
    industrial: true,
    satellite: false,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [showImpact, setShowImpact] = useState(true);
  const selected = incidents.find((i) => i.id === selectedId);
  
  const hotspotSummary =
    incidents.length > 600
      ? `Displaying the 600 highest-priority observations from ${incidents.length.toLocaleString()} spaceborne detections.`
      : `${incidents.length.toLocaleString()} spaceborne observations monitored in sector.`;

  const toggle = (k) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  return (
    <div className="map-shell space-y-6 animate-fadeIn py-3">
      <SectionHeader
        eyebrow="Geospatial Operations"
        title="Fire & Impact Intelligence Map"
        desc="Interactive multi-layer geospatial radar: live spaceborne thermal observations, persistence recurrence signatures, industrial assets, and multi-ring impact perimeters."
      />

      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Map Deck (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <MapControls layers={layers} onToggle={toggle} showImpact={showImpact} onToggleImpact={() => setShowImpact((v) => !v)} />
          <div className="rounded-[22px] overflow-hidden border border-line shadow-[0_18px_36px_-24px_rgba(15,30,46,0.35)] bg-white ring-1 ring-white">
            <Suspense fallback={<div className="rounded-lg border border-line bg-white p-6 text-sm text-slateink">Loading Africa fire map…</div>}>
              <FireMap incidents={incidents} layers={layers} onSelect={setSelectedId} selectedId={selectedId} showImpact={showImpact} />
            </Suspense>
          </div>
          {refreshError && (
            <p className="rounded-xl border border-critical/30 bg-criticalBg p-3 text-xs text-critical">
              Live hotspot telemetry could not be loaded: {refreshError}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-slateink font-medium">
            <span>NASA FIRMS VIIRS & MODIS Central Africa Basemap · {hotspotSummary}</span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
              Live Stream Active
            </span>
          </div>
        </div>

        {/* Legend & Selected Inspector (1 col) */}
        <div className="space-y-5">
          <MapLegend />

          {selected ? (
            <Card accent="orange" hoverLift={false}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-orange">{selected.id}</span>
                <SeverityPill level={selected.risk} size="sm" />
              </div>
              <div className="font-bold text-sm mb-3 text-ink tracking-tight">{selected.name}</div>
              
              <div className="text-xs space-y-2 mb-4 p-3 rounded-xl bg-[#FCFAF6] border border-line/60 text-slateink">
                <div className="flex justify-between">
                  <span>FRP Intensity:</span>
                  <strong className="text-ink">{selected.frp}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Inference Certainty:</span>
                  <strong className="text-ink">{selected.confidence}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Bearing:</span>
                  <strong className="text-ink">{selected.impactDirection}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <strong className="text-ink truncate max-w-[120px]">{selected.location}</strong>
                </div>
              </div>

              <button
                onClick={() => openIncident(selected)}
                className="btn-primary w-full py-2.5 text-xs font-bold justify-center shadow-sm shadow-orange/30"
              >
                Inspect Incident Details
              </button>
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-slateink bg-white/50">
              Select any hotspot marker on the map to inspect its real-time telemetry and risk factors.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
