import React, { useState } from "react";
import { Siren, Eye } from "lucide-react";
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
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Emergency Ledger"
        title="Alerts & Directives"
        desc="Prioritized queue of active thermal anomalies requiring authority attention, with recommended protocols and one-click warning issuance."
      />

      {/* Filter Badges */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold rounded-xl px-3.5 py-2 border transition-all ${
                active
                  ? "border-orange bg-orange-50 text-orange shadow-xs ring-1 ring-orange/30 font-extrabold"
                  : "border-line bg-white text-slateink hover:bg-[#FAF7F2] hover:text-ink"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="space-y-3.5">
        {list.map((i) => {
          const accentType =
            i.risk === "CRITICAL"
              ? "critical"
              : i.risk === "HIGH"
              ? "orange"
              : i.risk === "MEDIUM"
              ? "amber"
              : "safe";

          return (
            <Card key={i.id} accent={accentType} hoverLift={true}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-start gap-3.5">
                  <SeverityPill level={i.risk} />
                  <div>
                    <div className="text-sm font-bold text-ink tracking-tight">
                      <span className="font-mono text-xs text-orange mr-1.5">{i.id}</span>
                      <span>· {i.name}</span>
                    </div>
                    <div className="text-xs text-slateink mt-0.5">
                      {i.location} · Detected <span className="font-medium text-ink">{i.detectionTime}</span>
                    </div>
                    <div className="text-xs mt-1.5 text-slateink/90 font-medium">
                      Recommended:{" "}
                      <span className="text-ink">
                        {i.status === "Resolved"
                          ? "Archive incident record"
                          : "Verify with UAV/ground scout before ordering evacuation"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <StatusBadge status={i.status} />
                  <button
                    onClick={() => openIncident(i)}
                    className="btn-secondary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Inspect</span>
                  </button>
                  {i.status !== "Resolved" && i.status !== "Warning Issued" && (
                    <button
                      onClick={() => issueWarning(i)}
                      className="btn-primary !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange/30"
                    >
                      <Siren size={14} />
                      <span>Issue Warning</span>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
