import React from "react";
import { SEV_STYLE, STATUS_STYLE } from "./theme.js";

export function SeverityPill({ level, size = "md" }) {
  const s = SEV_STYLE[level] || SEV_STYLE.MEDIUM;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-bold tracking-tight border border-current/20 shadow-xs ${pad}`}
      style={{ color: s.color, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      <span>{s.label}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Monitoring;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight border border-current/20 shadow-xs"
      style={{ color: s.c, background: s.b }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.c }} />
      <span>{status}</span>
    </span>
  );
}
