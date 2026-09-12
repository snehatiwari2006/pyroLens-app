import React from "react";
import { SEV_STYLE } from "./theme.js";
import { SeverityPill } from "./StatusBadge.jsx";

export function RiskScoreDial({ score }) {
  const level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";
  const s = SEV_STYLE[level];
  const r = 54, c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#E8E4DC" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="12"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 70 70)" />
        <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700" fill="#0F1E2E">{score}</text>
        <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#5E6573">/ 100</text>
      </svg>
      <div>
        <SeverityPill level={level} />
        <p className="text-sm mt-2 max-w-[220px] text-slateink">
          Explainable risk score derived from fire intensity, persistence, and exposure factors.
        </p>
      </div>
    </div>
  );
}

export function FactorBar({ label, value, icon: Icon }) {
  const color = value === "VERY HIGH" || value === "HIGH" ? "#B3261E" : value === "MODERATE" ? "#B45309" : "#1E7A4C";
  const pct = value === "VERY HIGH" ? 95 : value === "HIGH" ? 78 : value === "MODERATE" ? 52 : 28;
  return (
    <div className="flex items-center gap-3 py-2">
      {Icon && <Icon size={16} className="shrink-0 text-slateink" />}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ink">{label}</span>
          <span className="font-semibold" style={{ color }}>{value}</span>
        </div>
        <div className="h-1.5 rounded-full bg-line">
          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}
