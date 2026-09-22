"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AlertPanel from "../src/components/AlertPanel";
import ExplainabilityModal from "../src/components/ExplainabilityModal";
import ImpactSummary from "../src/components/ImpactSummary";
import Map from "../src/components/Map";
import { fetchExplanation, fetchHotspots, fetchImpact, predictSpread } from "../src/lib/api";
import type { Explanation, Hotspot, ImpactResponse } from "../src/lib/types";

export default function GisDashboardPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [spread, setSpread] = useState<GeoJSON.FeatureCollection | null>(null);
  const [impact, setImpact] = useState<ImpactResponse | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [impactLoading, setImpactLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "suspicious">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchHotspots({ suspiciousOnly: filter === "suspicious" });
      setHotspots(payload.hotspots);
      setSelected((current) => payload.hotspots.find((item) => item.id === current?.id) || payload.hotspots[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hotspots");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectHotspot = useCallback(async (hotspot: Hotspot) => {
    setSelected(hotspot);
    setImpactLoading(true);
    try {
      const [spreadResult, impactResult] = await Promise.all([
        predictSpread(hotspot.id),
        fetchImpact(hotspot.id),
      ]);
      setSpread(spreadResult.geojson);
      setImpact(impactResult);
    } catch {
      setSpread(null);
      setImpact(null);
    } finally {
      setImpactLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) void selectHotspot(selected);
    // Load impact once when the first hotspot arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const openExplain = useCallback(async (hotspot: Hotspot) => {
    setSelected(hotspot);
    setModalOpen(true);
    try {
      setExplanation(await fetchExplanation(hotspot.id));
    } catch {
      setExplanation(hotspot.explanation);
    }
  }, []);

  const counts = useMemo(() => {
    return hotspots.reduce<Record<string, number>>((acc, item) => {
      acc[item.classification] = (acc[item.classification] || 0) + 1;
      return acc;
    }, {});
  }, [hotspots]);

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">SIH26162 · PyroLens</p>
          <h1 className="text-xl font-semibold">Industrial fire & thermal intelligence</h1>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Legend color="#dc2626" label={`Fire (${counts["Likely Fire"] || 0})`} />
          <Legend color="#ea580c" label={`New Source (${counts["New Source"] || 0})`} />
          <Legend color="#2563eb" label={`Industrial Heat (${counts["Industrial Heat"] || 0})`} />
          <button
            type="button"
            className="rounded-md border border-line px-3 py-1"
            onClick={() => setFilter((value) => (value === "all" ? "suspicious" : "all"))}
          >
            {filter === "all" ? "Show suspicious only" : "Show all classes"}
          </button>
          <button type="button" className="rounded-md bg-ink px-3 py-1 text-white" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      </header>
      {error && <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <Map hotspots={hotspots} spread={spread} selectedId={selected?.id} onSelect={(item) => void selectHotspot(item)} />
          </div>
          <div className="p-3">
            <ImpactSummary impact={impact} loading={impactLoading} />
          </div>
        </div>
        <AlertPanel
          hotspots={hotspots}
          selectedId={selected?.id}
          onSelect={(item) => void selectHotspot(item)}
          onExplain={(item) => void openExplain(item)}
          loading={loading}
        />
      </div>
      <ExplainabilityModal
        open={modalOpen}
        hotspot={selected}
        explanation={explanation}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
