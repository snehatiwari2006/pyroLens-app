import React from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { RESPONSE_TEAMS } from "../data/responseTeams.js";

const SEQUENCE = ["Priority 1: Critical industrial fire", "Nearest response team", "Nearest fire station", "Potentially exposed infrastructure", "Monitoring zone"];

export default function EmergencyResponse() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold rounded px-2 py-0.5 text-info bg-infoBg">DECISION SUPPORT ONLY</span>
      </div>
      <SectionHeader title="Emergency response support" desc="Response priority and readiness overview to support — not replace — authorized dispatch decisions." />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-sm mb-3 text-ink">Recommended response sequence</h3>
          {SEQUENCE.map((s, idx) => (
            <div key={s} className="flex items-start gap-2.5 mb-3">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-[#F5F1EB] text-ink">{idx + 1}</div>
              <div className="text-sm pt-0.5 text-ink">{s}</div>
            </div>
          ))}
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-sm mb-3 text-ink">Response teams</h3>
          <div className="divide-y divide-line">
            {RESPONSE_TEAMS.map((t) => (
              <div key={t.name} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  <div className="text-xs text-slateink">{t.zone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: t.status === "Deployed" ? "#B3261E" : t.status === "En route" ? "#C2600B" : "#1E7A4C" }}>{t.status}</div>
                  <div className="text-xs text-slateink">ETA {t.eta}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-line grid sm:grid-cols-2 gap-3 text-sm">
            <Field label="Nearest fire station" value="Station 4 — 2.1 km" />
            <Field label="Road accessibility" value="Clear — primary access road open" />
          </div>
        </Card>
      </div>
    </div>
  );
}
