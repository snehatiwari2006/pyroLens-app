import React from "react";
import { Eye } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill, StatusBadge } from "../components/StatusBadge.jsx";

const COLUMNS = [
  "Incident ID",
  "Location / Facility",
  "Detection Time",
  "AI Classification",
  "Threat",
  "Confidence",
  "Status",
  "Assigned Unit",
  "Action",
];

export default function Incidents() {
  const { incidents, openIncident } = useApp();

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Master Incident Ledger"
        title="Incident Management & Records"
        desc="Central auditable registry of all spaceborne thermal observations, AI classifications, and handling statuses."
      />

      <Card padded={false} accent="orange" hoverLift={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slateink border-b border-line/80 bg-[#FCFAF6]">
                {COLUMNS.map((h) => (
                  <th key={h} className="px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {incidents.map((i) => (
                <tr key={i.id} className="hover:bg-[#FAF7F2] transition-colors group">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-orange">{i.id}</td>
                  <td className="px-5 py-3.5 text-xs font-medium text-ink max-w-[200px] truncate">{i.location}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slateink">{i.detectionTime}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-ink">{i.type}</td>
                  <td className="px-5 py-3.5">
                    <SeverityPill level={i.risk} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-ink">{i.confidence}%</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slateink font-medium">{i.assignedTeam}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => openIncident(i)}
                      className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-orange hover:text-white hover:border-orange text-ink transition-all shadow-xs"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
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
