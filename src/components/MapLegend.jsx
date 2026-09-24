import React from "react";
import Card from "./Card.jsx";

export default function MapLegend() {
  const rows = [
    { c: "#B3261E", l: "Critical Thermal Event (Score ≥ 80)" },
    { c: "#C2410C", l: "High Threat Hazard (Score 60–79)" },
    { c: "#D97706", l: "Medium / Monitoring (Score 35–59)" },
    { c: "#1E7A4C", l: "Low Risk Baseline (Score < 35)" },
  ];

  return (
    <Card accent="orange" hoverLift={false}>
      <div className="text-xs font-bold uppercase tracking-wider mb-3.5 text-ink">Map Geospatial Legend</div>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center gap-2.5 text-xs text-slateink">
            <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs" style={{ background: r.c }} />
            <span className="font-medium text-ink/90">{r.l}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 text-xs pt-2 border-t border-line/60 text-slateink">
          <span className="h-2.5 w-7 rounded-full border border-rose-500 bg-rose-100 shrink-0" />
          <span className="font-medium text-ink/90">Estimated Impact Perimeter</span>
        </div>
      </div>
    </Card>
  );
}
