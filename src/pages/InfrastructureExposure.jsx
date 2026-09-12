import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Factory, Building2, Route, Users, Hospital, ScanLine, Info } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { AiTag } from "../components/AIInsightCard.jsx";

export default function InfrastructureExposure() {
  const { incidents } = useApp();
  const location = useLocation();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selId, setSelId] = useState(location.state?.incidentId || active[0].id);
  const sel = incidents.find((i) => i.id === selId);

  const rows = [
    { icon: Factory, label: "Industrial facilities", value: sel.exposure.industrial },
    { icon: Building2, label: "Buildings", value: sel.exposure.buildings },
    { icon: Route, label: "Roads", value: sel.exposure.roads },
    { icon: Users, label: "Population", value: `~${sel.exposure.population.toLocaleString()}` },
    { icon: Hospital, label: "Critical infrastructure", value: sel.exposure.critical },
    { icon: ScanLine, label: "Environmental area", value: sel.exposure.environment },
  ];

  return (
    <div>
      <SectionHeader title="Infrastructure & population exposure"
        desc="Assets potentially exposed within the estimated impact zone — never a claim of guaranteed damage."
        action={<AiTag />} />
      <div className="flex flex-wrap gap-2 mb-5">
        {active.map((i) => (
          <button key={i.id} onClick={() => setSelId(i.id)} className="text-xs font-medium rounded-md px-2.5 py-1.5 border"
            style={{ borderColor: selId === i.id ? "#C2410C" : "#E8E4DC", color: selId === i.id ? "#9A3412" : "#5E6573", background: selId === i.id ? "#FFF7ED" : "#fff" }}>
            {i.id}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {rows.map((r) => (
          <Card key={r.label}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#F5F1EB]"><r.icon size={18} className="text-ink" /></div>
              <div>
                <div className="text-xl font-semibold text-ink">{r.value}</div>
                <div className="text-xs text-slateink">Potentially exposed — {r.label.toLowerCase()}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border border-line p-4 text-sm flex items-start gap-2.5 bg-[#FAF7F2]">
        <Info size={16} className="mt-0.5 shrink-0 text-slateink" />
        <p className="text-slateink">
          Assets listed above fall within the estimated impact zone and are classified as
          <strong className="text-ink"> potentially at risk</strong>, not confirmed affected. Field verification by
          authorized personnel is required before any response action.
        </p>
      </div>
    </div>
  );
}
