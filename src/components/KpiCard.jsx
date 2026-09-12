import React from "react";
import Card from "./Card.jsx";

const TONES = {
  navy: { bg: "#F5F1EB", fg: "#0F1E2E" }, critical: { bg: "#FBEAE9", fg: "#B3261E" },
  high: { bg: "#FFF4EB", fg: "#C2410C" }, info: { bg: "#FEF3C7", fg: "#B45309" }, safe: { bg: "#E7F4EC", fg: "#1E7A4C" },
};

export default function KpiCard({ icon: Icon, label, value, sub, tone = "navy" }) {
  const t = TONES[tone];
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slateink">{label}</div>
          <div className="text-3xl font-semibold mt-1.5 text-ink">{value}</div>
          {sub && <div className="text-xs mt-1.5 text-slateink">{sub}</div>}
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.bg }}>
          <Icon size={20} color={t.fg} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
