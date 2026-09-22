"use client";

import type { Hotspot } from "../lib/types";

interface AlertPanelProps {
  hotspots: Hotspot[];
  selectedId?: string | null;
  onSelect: (hotspot: Hotspot) => void;
  onExplain: (hotspot: Hotspot) => void;
  loading?: boolean;
}

const PRIORITY = ["Likely Fire", "New Source", "Industrial Heat", "Artifact"];

export default function AlertPanel({ hotspots, selectedId, onSelect, onExplain, loading }: AlertPanelProps) {
  const queue = [...hotspots]
    .filter((item) => item.classification === "Likely Fire" || item.classification === "New Source")
    .sort((left, right) => {
      const rank = PRIORITY.indexOf(left.classification) - PRIORITY.indexOf(right.classification);
      if (rank !== 0) return rank;
      return right.class_confidence - left.class_confidence;
    });

  return (
    <aside className="flex h-full flex-col border-l border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority alert queue</p>
        <h2 className="text-lg font-semibold text-ink">Suspicious thermal events</h2>
        <p className="text-xs text-slate-500">{queue.length} fire or new-source alerts</p>
      </header>
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="px-4 py-6 text-sm text-slate-500">Loading live hotspots…</p>}
        {!loading && queue.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500">No suspicious fire events in the current filter.</p>
        )}
        {queue.map((hotspot) => (
          <article
            key={hotspot.id}
            className={`border-b border-line px-4 py-3 ${selectedId === hotspot.id ? "bg-orange-50" : "bg-white"}`}
          >
            <button type="button" className="w-full text-left" onClick={() => onSelect(hotspot)}>
              <div className="flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ background: hotspot.color }}
                >
                  {hotspot.classification}
                </span>
                <span className="text-xs text-slate-500">{hotspot.class_confidence.toFixed(0)}%</span>
              </div>
              <p className="mt-1 text-sm font-medium text-ink">{hotspot.name}</p>
              <p className="text-xs text-slate-500">
                {hotspot.brightness_temp.toFixed(0)} K · FRP {hotspot.frp_mw.toFixed(1)} MW
              </p>
            </button>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-orange-700 underline"
              onClick={() => onExplain(hotspot)}
            >
              Why was this flagged?
            </button>
          </article>
        ))}
      </div>
    </aside>
  );
}
