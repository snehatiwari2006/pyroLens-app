import React from "react";
import { Eye } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill, StatusBadge } from "../components/StatusBadge.jsx";

const COLUMNS = ["Incident ID", "Location", "Detection time", "Classification", "Risk", "Confidence", "Status", "Team", "Actions"];

export default function Incidents() {
  const { incidents, openIncident } = useApp();
  return (
    <div>
      <SectionHeader title="Incident management" desc="Complete record of detected thermal events and their handling status." />
      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-xs text-slateink border-b border-line">
                {COLUMNS.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50 border-b border-line">
                  <td className="px-4 py-3 font-medium text-ink">{i.id}</td>
                  <td className="px-4 py-3 text-slateink">{i.location}</td>
                  <td className="px-4 py-3 text-slateink">{i.detectionTime}</td>
                  <td className="px-4 py-3 text-ink">{i.type}</td>
                  <td className="px-4 py-3"><SeverityPill level={i.risk} size="sm" /></td>
                  <td className="px-4 py-3 text-ink">{i.confidence}%</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-slateink">{i.assignedTeam}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openIncident(i)} className="text-xs font-medium flex items-center gap-1 text-navy">
                      <Eye size={13} /> View
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
