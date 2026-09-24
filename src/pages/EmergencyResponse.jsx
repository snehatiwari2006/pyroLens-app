import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { RESPONSE_TEAMS } from "../data/responseTeams.js";

const SEQUENCE = [
  "Priority 1: Critical industrial fire containment",
  "Nearest rapid response unit dispatch",
  "Nearest fire station staging notification",
  "Potentially exposed infrastructure perimeter isolation",
  "Downwind population zone continuous monitoring",
];

export default function EmergencyResponse() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Tactical Readiness"
        title="Emergency Response Support"
        desc="Response sequence prioritization and unit readiness overview to assist authorized municipal and industrial dispatch coordinators."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Sequence Card */}
        <Card className="lg:col-span-1" accent="orange" hoverLift={false}>
          <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Recommended Tactical Sequence</h3>
          <div className="space-y-3.5">
            {SEQUENCE.map((s, idx) => (
              <div key={s} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 bg-orange-100 text-orange border border-orange-200">
                  {idx + 1}
                </div>
                <div className="text-xs sm:text-sm font-medium text-ink pt-0.5 leading-snug">{s}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Units Readiness Table */}
        <Card className="lg:col-span-2" accent="blue" hoverLift={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-ink tracking-tight">Designated Emergency Units</h3>
            <span className="text-[11px] font-semibold text-slateink bg-[#FCFAF6] px-2.5 py-0.5 rounded border border-line">
              Live Fleet Status
            </span>
          </div>

          <div className="divide-y divide-line/60">
            {RESPONSE_TEAMS.map((t) => {
              const statusColor =
                t.status === "Deployed"
                  ? "text-rose-700 bg-rose-50 border-rose-200"
                  : t.status === "En route"
                  ? "text-orange-700 bg-orange-50 border-orange-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200";

              return (
                <div key={t.name} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-bold text-ink">{t.name}</div>
                    <div className="text-xs text-slateink mt-0.5">{t.zone}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                      {t.status}
                    </span>
                    <div className="text-xs font-mono font-medium text-slateink mt-1">ETA: {t.eta}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-line grid sm:grid-cols-2 gap-4 text-sm bg-[#FCFAF6] p-4 rounded-xl">
            <Field label="Nearest Staging Station" value="Central Station 4 — 2.1 km" />
            <Field label="Road Corridor Accessibility" value="Clear — Primary access arterial open" />
          </div>
        </Card>

      </div>
    </div>
  );
}
