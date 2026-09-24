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
      .then(([nextStatus, nextFirms]) => {
        setStatus(nextStatus);
        setFirms(nextFirms);
      })
      .catch((loadError) => setError(`Live data service unavailable: ${loadError.message}`));
  }, []);

  if (!status) {
    return (
      <div className="rounded-xl border border-high/30 bg-highBg p-4 text-sm text-high font-medium">
        {error || "Loading satellite feed status…"}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Spaceborne Telemetry"
        title="Satellite Data Centre"
        desc={
          firms?.configured
            ? `Live ${firms.source} thermal sensor observations streaming for ${firms.bbox}.`
            : "Add a NASA FIRMS MAP key in backend/.env to enable live observation downloads."
        }
        action={
          <div className="flex items-center gap-3">
            <span
              className={`text-[11px] font-bold uppercase rounded-full px-3 py-1 border shadow-xs ${
                firms?.configured
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}
            >
              {firms?.configured ? "NASA FIRMS LIVE" : "NASA FIRMS DEMO FEED"}
            </span>
            <button
              className="btn-secondary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5"
              disabled={refreshing || !firms?.configured}
              onClick={async () => {
                setRefreshing(true);
                setError("");
                try {
                  await refreshFirmsFeed();
                  setStatus(await getSatelliteFeedStatus());
                } catch (refreshError) {
                  setError(refreshError.message);
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-orange" : ""} />
              <span>{refreshing ? "Refreshing…" : "Synchronize Feeds"}</span>
            </button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard icon={RefreshCw} label="Last Synchronization" value={status.lastSync} tone="safe" />
        <KpiCard icon={Flame} label="Fire Detections (24h)" value={status.detections24h} tone="critical" />
        <KpiCard icon={Activity} label="FRP Observations" value={status.frpObservations} tone="high" />
        <KpiCard icon={Gauge} label="Avg. Sensor Confidence" value={`${status.avgConfidence}%`} tone="info" />
        <KpiCard
          icon={Satellite}
          label="Processed Orbits"
          value={status.satelliteObservations.toLocaleString()}
          tone="navy"
        />
        <KpiCard icon={Globe2} label="Monitored Sector" value="Central Africa Pilot" tone="navy" />
        <KpiCard icon={Boxes} label="Records Processed" value={status.recordsProcessed.toLocaleString()} tone="navy" />
        <KpiCard icon={Clock} label="Feed Latency" value={status.dataFreshness} tone="safe" />
      </div>

      <Card accent="blue" hoverLift={false}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-ink tracking-tight">Active Satellite & Sensor Constellations</h3>
          <span className="text-xs text-slateink">Continuous Multi-Spectral Ingestion</span>
        </div>
        <p className="mb-4 text-xs text-slateink leading-relaxed">
          Downlink pipelines stream directly from NASA Goddard Space Flight Center and are validated through local PostGIS geometry boundaries.
        </p>
        
        {error && (
          <p className="mb-4 rounded-xl border border-critical/30 bg-criticalBg p-3 text-xs text-critical">
            {error}
          </p>
        )}

        <div className="divide-y divide-line/60 text-xs sm:text-sm">
          {status.sources.map((s) => (
            <div key={s.name} className="flex items-center justify-between py-3">
              <span className="font-medium text-ink">{s.name}</span>
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{s.status}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
