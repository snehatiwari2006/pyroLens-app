import React from "react";
import Card from "./Card.jsx";

export default function MapLegend() {
  const rows = [
    { c: "#B3261E", l: "Critical thermal event" }, { c: "#C2600B", l: "High risk" },
    { c: "#9A7B0A", l: "Medium / monitoring" }, { c: "#1E7A4C", l: "Low risk" },
  ];
  return (
    <Card>
      <div className="text-xs font-semibold mb-3 text-ink">Legend</div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center gap-2 text-xs text-slateink">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.c }} /> {r.l}
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs pt-1 text-slateink">
          <span className="h-2.5 w-6 rounded-full border border-critical bg-criticalBg" /> Estimated impact zone
        </div>
      </div>
    </Card>
  );
}
