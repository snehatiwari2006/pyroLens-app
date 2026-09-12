import React, { useState } from "react";
import { Siren } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill, StatusBadge } from "../components/StatusBadge.jsx";

const FILTERS = ["All", "CRITICAL", "HIGH", "MEDIUM", "MONITORING", "RESOLVED"];

export default function AlertsWarnings() {
  const { incidents, openIncident, issueWarning } = useApp();
  const [filter, setFilter] = useState("All");

  const list = incidents.filter((i) => {
    if (filter === "All") return true;
    if (filter === "MONITORING") return i.status === "Monitoring";
    if (filter === "RESOLVED") return i.status === "Resolved";
    return i.risk === filter;
  });

  return (
    <div>
      <SectionHeader title="Alerts & warnings" desc="Prioritized fire events requiring authority attention, with recommended actions." />
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="text-xs font-medium rounded-md px-3 py-1.5 border"
            style={{ borderColor: filter === f ? "#C2410C" : "#E8E4DC", color: filter === f ? "#9A3412" : "#5E6573", background: filter === f ? "#FFF7ED" : "#fff" }}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((i) => (
          <Card key={i.id}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-start gap-3">
                <SeverityPill level={i.risk} />
                <div>
                  <div className="text-sm font-medium text-ink">{i.id} · {i.name}</div>
                  <div className="text-xs text-slateink">{i.location} · Detected {i.detectionTime}</div>
                  <div className="text-xs mt-1 text-slateink">Recommended: {i.status === "Resolved" ? "Archive record" : "Monitor and verify before further action"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={i.status} />
                <button onClick={() => openIncident(i)} className="btn-secondary !py-1.5 !px-3 text-xs">View</button>
                {i.status !== "Resolved" && i.status !== "Warning Issued" && (
                  <button onClick={() => issueWarning(i)} className="btn-primary !py-1.5 !px-3 text-xs"><Siren size={13} />Warn</button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
