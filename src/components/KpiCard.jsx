import React from "react";
import Card from "./Card.jsx";

const TONE_CONFIG = {
  critical: {
    accent: "critical",
    chipBg: "bg-red-50 border-red-200/70 text-rose-600 shadow-sm shadow-red-100",
    dotColor: "bg-rose-500",
  },
  high: {
    accent: "orange",
    chipBg: "bg-orange-50 border-orange-200/70 text-orange-600 shadow-sm shadow-orange-100",
    dotColor: "bg-orange-500",
  },
  info: {
    accent: "amber",
    chipBg: "bg-amber-50 border-amber-200/70 text-amber-700 shadow-sm shadow-amber-100",
    dotColor: "bg-amber-500",
  },
  safe: {
    accent: "safe",
    chipBg: "bg-emerald-50 border-emerald-200/70 text-emerald-700 shadow-sm shadow-emerald-100",
    dotColor: "bg-emerald-500",
  },
  navy: {
    accent: "blue",
    chipBg: "bg-slate-100 border-slate-200/80 text-navy shadow-sm shadow-slate-100",
    dotColor: "bg-slate-600",
  },
};

export default function KpiCard({ icon: Icon, label, value, sub, tone = "navy" }) {
  const conf = TONE_CONFIG[tone] || TONE_CONFIG.navy;

  return (
    <Card className="group" accent={conf.accent} hoverLift={true}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slateink uppercase tracking-wider">
            {(tone === "critical" || tone === "high") && (
              <span className={`h-1.5 w-1.5 rounded-full ${conf.dotColor} animate-pulse`} />
            )}
            <span className="truncate">{label}</span>
          </div>
          <div className="text-3xl font-extrabold mt-2 text-ink tracking-tight tabular-nums">{value}</div>
          {sub && (
            <div className="text-xs mt-2 text-slateink flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-slateink/40" />
              <span>{sub}</span>
            </div>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${conf.chipBg} transition-transform duration-300 group-hover:rotate-3`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
