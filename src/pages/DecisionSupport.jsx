import React, { useState, Fragment } from "react";
import { useLocation } from "react-router-dom";
import { Flame, ScanLine, Factory, Users, Hospital, Compass, ArrowRight, Siren } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { RiskScoreDial, FactorBar } from "../components/RiskScoreCard.jsx";
import { AiTag, Disclaimer } from "../components/AIInsightCard.jsx";

const WORKFLOW = ["Classification", "Fire analysis", "Impact estimation", "Exposure analysis", "Risk calculation", "Decision support"];

export default function DecisionSupport() {
  const { incidents, issueWarning } = useApp();
  const location = useLocation();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selId, setSelId] = useState(location.state?.incidentId || active[0].id);
  const sel = incidents.find((i) => i.id === selId);

  const factors = [
    { label: "Fire intensity", value: sel.riskScore > 75 ? "HIGH" : "MODERATE", icon: Flame },
    { label: "Thermal persistence", value: sel.persistenceScore > 70 ? "VERY HIGH" : sel.persistenceScore > 40 ? "HIGH" : "MODERATE", icon: ScanLine },
    { label: "Industrial exposure", value: sel.exposure.industrial > 2 ? "HIGH" : "MODERATE", icon: Factory },
    { label: "Population exposure", value: sel.exposure.population > 3000 ? "HIGH" : sel.exposure.population > 500 ? "MODERATE" : "LOW", icon: Users },
    { label: "Critical infrastructure exposure", value: sel.exposure.critical > 1 ? "HIGH" : sel.exposure.critical > 0 ? "MODERATE" : "LOW", icon: Hospital },
    { label: "Impact potential", value: sel.impactConfidence > 70 ? "HIGH" : "MODERATE", icon: Compass },
  ];

  return (
    <div>
      <SectionHeader title="Authority decision support" desc="Explainable risk, workflow trace and recommended next actions for a selected event." action={<AiTag />} />
      <div className="flex flex-wrap gap-2 mb-5">
        {active.map((i) => (
          <button key={i.id} onClick={() => setSelId(i.id)} className="text-xs font-medium rounded-md px-2.5 py-1.5 border"
            style={{ borderColor: selId === i.id ? "#C2410C" : "#E8E4DC", color: selId === i.id ? "#9A3412" : "#5E6573", background: selId === i.id ? "#FFF7ED" : "#fff" }}>
            {i.id}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-sm mb-4 text-ink">Explainable risk score</h3>
          <RiskScoreDial score={sel.riskScore} />
          <div className="mt-5 space-y-1">
            {factors.map((f) => <FactorBar key={f.label} {...f} />)}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <SeverityPill level={sel.risk} />
            <span className="text-sm font-semibold text-ink">{sel.risk === "CRITICAL" ? "Critical priority" : sel.risk === "HIGH" ? "High priority" : "Standard priority"}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-5 text-sm">
            <Field label="Classification" value={`Likely ${sel.type}`} />
            <Field label="Estimated impact direction" value={sel.impactDirection} />
            <Field label="Potential impact zone" value={sel.impactZone} />
            <Field label="Population exposure" value={sel.exposure.population > 3000 ? "High" : "Moderate"} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs mb-5 text-slateink">
            {WORKFLOW.map((s, idx) => (
              <Fragment key={s}>
                <span className="rounded-full px-2.5 py-1 bg-[#F5F1EB] text-ink font-medium">{s}</span>
                {idx < WORKFLOW.length - 1 && <ArrowRight size={12} />}
              </Fragment>
            ))}
          </div>
          <div className="rounded-lg border border-line p-4 mb-4 bg-paper">
            <div className="text-xs font-semibold mb-2 text-slateink">RECOMMENDED ACTIONS</div>
            <ol className="list-decimal pl-5 text-sm space-y-1 text-ink">
              <li>Initiate human verification.</li>
              <li>Prioritize monitoring of {sel.location}.</li>
              <li>Review nearby industrial infrastructure.</li>
              <li>Assess emergency response readiness.</li>
              <li>Prepare warning workflow for potentially affected zones.</li>
            </ol>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => issueWarning(sel)} className="btn-primary"><Siren size={15} /> Issue warning</button>
            <button className="btn-secondary">Generate report</button>
          </div>
          <div className="mt-4"><Disclaimer compact /></div>
        </Card>
      </div>
    </div>
  );
}
