"use client";

import type { ImpactResponse } from "../lib/types";

interface ImpactSummaryProps {
  impact: ImpactResponse | null;
  loading?: boolean;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function ImpactSummary({ impact, loading }: ImpactSummaryProps) {
  if (loading) {
    return <section className="rounded-xl border border-line bg-white p-4 text-sm text-slate-500">Calculating exposure…</section>;
  }
  if (!impact) {
    return (
      <section className="rounded-xl border border-line bg-white p-4 text-sm text-slate-500">
        Select a hotspot to estimate at-risk population, roads, and buildings inside the buffer zone.
      </section>
    );
  }

  const metrics = impact.metrics;
  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Impact assessment</p>
      <h2 className="text-lg font-semibold text-ink">{impact.name || "Selected hotspot"}</h2>
      <p className="mb-3 text-xs text-slate-500">
        {impact.buffer_km} km buffer · spread {impact.spread.impact_zone_km2} km² · {impact.source || "estimate"}
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Metric label="Population at risk" value={metrics.population_at_risk} />
        <Metric label="Buildings" value={metrics.buildings} />
        <Metric label="Roads" value={metrics.roads} />
        <Metric label="Critical infrastructure" value={metrics.critical_infrastructure} />
      </div>
      <p className="mt-3 text-xs text-slate-500">{impact.assumptions[0]}</p>
    </section>
  );
}
