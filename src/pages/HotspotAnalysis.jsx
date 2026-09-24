import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { HOTSPOT_REGIONS } from "../data/analytics.js";

export default function HotspotAnalysis() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Spatial Cluster Aggregation"
        title="Regional Hotspot Analysis"
        desc="Aggregated geographical sectors and industrial mining corridors experiencing recurring or high-threat thermal anomaly concentrations."
      />

      <Card padded={false} accent="orange" hoverLift={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slateink border-b border-line bg-[#FCFAF6]">
                {["Regional Sector", "Active Anomalies", "Composite Threat Index", "Recurrence History", "30-Day Trajectory"].map(
                  (h) => (
                    <th key={h} className="px-5 py-3.5">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {HOTSPOT_REGIONS.map((r) => (
                <tr key={r.name} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-5 py-3.5 font-bold text-ink">{r.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-orange">{r.count}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <SeverityPill level={r.risk >= 80 ? "CRITICAL" : r.risk >= 60 ? "HIGH" : "MEDIUM"} size="sm" />
                      <span className="font-mono text-xs font-semibold text-slateink">{r.risk}/100</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slateink font-medium">{r.persistence}</td>
                  <td
                    className="px-5 py-3.5 font-mono text-xs font-bold"
                    style={{ color: r.trend.startsWith("+") ? "#B3261E" : "#1E7A4C" }}
                  >
                    {r.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
