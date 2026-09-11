import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { HOTSPOT_REGIONS } from "../data/analytics.js";

export default function HotspotAnalysis() {
  return (
    <div>
      <SectionHeader title="Hotspot analysis" desc="Regions and industrial zones with recurring or high-risk thermal activity." />
      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-slateink border-b border-line">
                {["Region", "Fire count", "Risk score", "Persistence", "Trend"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOTSPOT_REGIONS.map((r) => (
                <tr key={r.name} className="border-b border-line">
                  <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-3 text-slateink">{r.count}</td>
                  <td className="px-4 py-3">
                    <SeverityPill level={r.risk >= 80 ? "CRITICAL" : r.risk >= 60 ? "HIGH" : "MEDIUM"} size="sm" />
                    <span className="ml-2 text-xs text-slateink">{r.risk}/100</span>
                  </td>
                  <td className="px-4 py-3 text-slateink">{r.persistence}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: r.trend.startsWith("+") ? "#B3261E" : "#1E7A4C" }}>{r.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
