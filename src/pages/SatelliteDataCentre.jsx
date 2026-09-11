import React, { useEffect, useState } from "react";
import { RefreshCw, Flame, Activity, Gauge, Satellite, Globe2, Boxes, Clock } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import KpiCard from "../components/KpiCard.jsx";
import { getSatelliteFeedStatus } from "../services/firmsService.js";

export default function SatelliteDataCentre() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSatelliteFeedStatus().then(setStatus);
  }, []);

  if (!status) return <div className="text-sm text-slateink">Loading satellite feed status…</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold rounded px-2 py-0.5 text-high bg-highBg">DEMO / MOCK DATA</span>
      </div>
      <SectionHeader title="Satellite data centre" desc="Overview of satellite thermal observation ingestion. Architecture is ready for live NASA FIRMS integration." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={RefreshCw} label="Last synchronization" value={status.lastSync} tone="safe" />
        <KpiCard icon={Flame} label="Fire detections (24h)" value={status.detections24h} tone="critical" />
        <KpiCard icon={Activity} label="FRP observations" value={status.frpObservations} tone="high" />
        <KpiCard icon={Gauge} label="Avg. confidence" value={`${status.avgConfidence}%`} tone="info" />
        <KpiCard icon={Satellite} label="Satellite observations" value={status.satelliteObservations.toLocaleString()} tone="navy" />
        <KpiCard icon={Globe2} label="Coverage" value="4 regions" tone="navy" />
        <KpiCard icon={Boxes} label="Records processed" value={status.recordsProcessed.toLocaleString()} tone="navy" />
        <KpiCard icon={Clock} label="Data freshness" value={status.dataFreshness} tone="safe" />
      </div>
      <Card className="mt-6">
        <h3 className="font-semibold text-sm mb-3 text-ink">Connected data sources (simulated)</h3>
        <div className="space-y-2 text-sm">
          {[...status.sources, { name: "OSM / Overpass", status: "Mock feed active" }, { name: "Weather service", status: "Mock feed active" }].map((s) => (
            <div key={s.name} className="flex items-center justify-between border-b border-line py-2 last:border-0">
              <span className="text-ink">{s.name}</span>
              <span className="text-xs flex items-center gap-1.5 text-safe"><span className="h-1.5 w-1.5 rounded-full bg-current" />{s.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
