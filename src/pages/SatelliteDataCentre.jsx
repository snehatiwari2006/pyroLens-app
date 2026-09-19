import React, { useEffect, useState } from "react";
import { RefreshCw, Flame, Activity, Gauge, Satellite, Globe2, Boxes, Clock } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import KpiCard from "../components/KpiCard.jsx";
import { getFirmsStatus, getSatelliteFeedStatus, refreshFirmsFeed } from "../services/firmsService.js";

export default function SatelliteDataCentre() {
  const [status, setStatus] = useState(null);
  const [firms, setFirms] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSatelliteFeedStatus(), getFirmsStatus()])
      .then(([nextStatus, nextFirms]) => { setStatus(nextStatus); setFirms(nextFirms); })
      .catch((loadError) => setError(`Live data service unavailable: ${loadError.message}`));
  }, []);

  if (!status) return <div className="rounded-md border border-high/30 bg-highBg px-3 py-2 text-sm text-high">{error || "Loading satellite feed status…"}</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[11px] font-semibold rounded px-2 py-0.5 ${firms?.configured ? "text-safe bg-safeBg" : "text-high bg-highBg"}`}>
          {firms?.configured ? "NASA FIRMS LIVE" : "NASA FIRMS KEY REQUIRED"}
        </span>
      </div>
      <SectionHeader title="Satellite data centre" desc={firms?.configured ? `Live ${firms.source} observations for ${firms.bbox}.` : "Add a NASA FIRMS MAP key in backend/.env to enable live observations."}
        action={<button className="btn-secondary !py-1.5 !px-3 text-xs" disabled={refreshing || !firms?.configured} onClick={async () => { setRefreshing(true); setError(""); try { await refreshFirmsFeed(); setStatus(await getSatelliteFeedStatus()); } catch (refreshError) { setError(refreshError.message); } finally { setRefreshing(false); } }}>{refreshing ? "Refreshing…" : "Refresh NASA FIRMS"}</button>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={RefreshCw} label="Last synchronization" value={status.lastSync} tone="safe" />
        <KpiCard icon={Flame} label="Fire detections (24h)" value={status.detections24h} tone="critical" />
        <KpiCard icon={Activity} label="FRP observations" value={status.frpObservations} tone="high" />
        <KpiCard icon={Gauge} label="Avg. confidence" value={`${status.avgConfidence}%`} tone="info" />
        <KpiCard icon={Satellite} label="Satellite observations" value={status.satelliteObservations.toLocaleString()} tone="navy" />
        <KpiCard icon={Globe2} label="Coverage" value="Bhopal pilot" tone="navy" />
        <KpiCard icon={Boxes} label="Records processed" value={status.recordsProcessed.toLocaleString()} tone="navy" />
        <KpiCard icon={Clock} label="Data freshness" value={status.dataFreshness} tone="safe" />
      </div>
      <Card className="mt-6">
        <h3 className="font-semibold text-sm mb-1 text-ink">Bhopal live data sources</h3>
        <p className="mb-3 text-xs text-slateink">Provider status is reported by the backend; zero detections means the selected NASA time window has no hotspot records.</p>
        {error && <p className="mb-3 rounded-md border border-critical/30 bg-criticalBg px-3 py-2 text-xs text-critical">{error}</p>}
        <div className="space-y-2 text-sm">
          {status.sources.map((s) => (
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
