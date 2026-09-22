"use client";

import type { Explanation, Hotspot } from "../lib/types";

interface ExplainabilityModalProps {
  open: boolean;
  hotspot: Hotspot | null;
  explanation: Explanation | null;
  onClose: () => void;
}

export default function ExplainabilityModal({ open, hotspot, explanation, onClose }: ExplainabilityModalProps) {
  if (!open || !hotspot) return null;
  const detail = explanation || hotspot.explanation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">SHAP reasoning</p>
            <h3 className="text-lg font-semibold text-ink">{hotspot.name}</h3>
            <p className="text-sm text-slate-600">{detail.headline}</p>
          </div>
          <button type="button" className="rounded-md border border-line px-2 py-1 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mt-3 text-sm">
          Predicted class <strong>{detail.label}</strong> at {detail.confidence ?? hotspot.class_confidence}%
          ({detail.method}, {detail.model_version || hotspot.model_version}).
        </p>
        <ul className="mt-4 space-y-2">
          {(detail.reasons || []).map((reason, index) => (
            <li key={`${reason.feature}-${index}`} className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm">
              {reason.text}
            </li>
          ))}
        </ul>
        {detail.probabilities && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(detail.probabilities).map(([name, value]) => {
              const pct = Number(value) <= 1 ? Number(value) * 100 : Number(value);
              return (
                <div key={name} className="rounded border border-line px-2 py-1">
                  {name}: {pct.toFixed(1)}%
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
