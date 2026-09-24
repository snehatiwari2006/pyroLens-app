import React, { useState, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Flame, ScanLine, Factory, Users, Hospital, Compass, ArrowRight, Siren, FileText } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { RiskScoreDial, FactorBar } from "../components/RiskScoreCard.jsx";
import { AiTag, Disclaimer } from "../components/AIInsightCard.jsx";

const WORKFLOW = [
  "Classification",
  "Fire Analysis",
  "Impact Estimation",
  "Exposure Analysis",
  "Risk Calculation",
  "Decision Support",
];

export default function DecisionSupport() {
  const { incidents, issueWarning } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selId, setSelId] = useState(location.state?.incidentId || active[0]?.id || incidents[0]?.id);
  const sel = incidents.find((i) => i.id === selId) || active[0] || incidents[0] || {};

  const factors = [
    { label: "Fire intensity", value: sel.riskScore > 75 ? "HIGH" : "MODERATE", icon: Flame },
    {
      label: "Thermal persistence",
      value: sel.persistenceScore > 70 ? "VERY HIGH" : sel.persistenceScore > 40 ? "HIGH" : "MODERATE",
      icon: ScanLine,
    },
    { label: "Industrial exposure", value: sel.exposure?.industrial > 2 ? "HIGH" : "MODERATE", icon: Factory },
    {
      label: "Population exposure",
      value: sel.exposure?.population > 3000 ? "HIGH" : sel.exposure?.population > 500 ? "MODERATE" : "LOW",
      icon: Users,
    },
    {
      label: "Critical infrastructure exposure",
      value: sel.exposure?.critical > 1 ? "HIGH" : sel.exposure?.critical > 0 ? "MODERATE" : "LOW",
      icon: Hospital,
    },
    { label: "Impact potential", value: sel.impactConfidence > 70 ? "HIGH" : "MODERATE", icon: Compass },
  ];

  return (
    <div className="decision-shell space-y-8 animate-fadeIn py-3">
      <SectionHeader
        eyebrow="Emergency Directives"
        title="Authority Decision Support"
        desc="Explainable threat scoring, auditable analytical traces, and recommended response procedures for municipal and disaster-management authorities."
        action={<AiTag />}
      />

      {/* Target Event Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {active.map((i) => {
          const activeBtn = selId === i.id;
          return (
            <button
              key={i.id}
              onClick={() => setSelId(i.id)}
              className={`text-xs font-mono font-bold rounded-xl px-3 py-2 border transition-all ${
                activeBtn
                  ? "border-orange bg-orange-50 text-orange shadow-xs ring-1 ring-orange/30"
                  : "border-line bg-white text-slateink hover:bg-[#FAF7F2] hover:text-ink"
              }`}
            >
              <span>{i.id}</span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Dial Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-white via-white to-rose-50/35" accent="critical" hoverLift={false}>
          <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Explainable Threat Index</h3>
          <RiskScoreDial score={sel.riskScore || 75} />
          
          <div className="mt-6 pt-4 border-t border-line/70 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slateink mb-2">
              Risk Weight Factor Breakdown
            </div>
            {factors.map((f) => (
              <FactorBar key={f.label} {...f} />
            ))}
          </div>
        </Card>

        {/* Right Directive Console */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-white via-white to-orange-50/30" accent="orange" hoverLift={false}>
          
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-line/60">
            <SeverityPill level={sel.risk} />
            <span className="text-base font-bold text-ink tracking-tight">
              {sel.risk === "CRITICAL"
                ? "Immediate Operational Directive Required"
                : sel.risk === "HIGH"
                ? "Elevated Tactical Readiness Recommended"
                : "Continuous Perimetric Monitoring"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
            <Field label="AI Classification" value={`Likely ${sel.type}`} />
            <Field label="Estimated Spread Bearing" value={sel.impactDirection} />
            <Field label="Potential Footprint" value={sel.impactZone} />
            <Field
              label="Population Vulnerability"
              value={sel.exposure?.population > 3000 ? "High (>3,000 residents)" : "Moderate"}
            />
          </div>

          {/* Workflow Sequence */}
          <div className="mb-6 p-3 rounded-xl bg-[#FAF7F2] border border-line/70">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slateink mb-2">
              Auditable Analytical Trace
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slateink font-medium">
              {WORKFLOW.map((s, idx) => (
                <Fragment key={s}>
                  <span className="rounded-lg px-2.5 py-1 bg-white border border-line/80 text-ink font-semibold shadow-2xs">
                    {s}
                  </span>
                  {idx < WORKFLOW.length - 1 && <ArrowRight size={12} className="text-orange" />}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="rounded-xl border border-line p-5 mb-6 bg-[#FCFAF6]">
            <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slateink">
              Recommended Operating Procedures (SOP)
            </div>
            <ol className="list-decimal pl-5 text-xs sm:text-sm space-y-1.5 text-ink leading-relaxed font-medium">
              <li>Initiate multi-agency human verification protocol.</li>
              <li>Deploy UAV or ground scout to verify coordinates in {sel.location}.</li>
              <li>Notify facility safety officer for nearby industrial infrastructure.</li>
              <li>Establish 1,500m precautionary safety perimeter along downwind bearing.</li>
              <li>Authorize authority warning dispatch to alert emergency command centers.</li>
            </ol>
          </div>

          {/* Action Directives */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => issueWarning(sel)}
              className="btn-primary py-3 px-5 text-xs font-bold flex items-center gap-2 shadow-md shadow-orange/25"
            >
              <Siren size={16} />
              <span>Authorize & Issue Official Warning</span>
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="btn-secondary py-3 px-5 text-xs font-semibold flex items-center gap-2"
            >
              <FileText size={16} />
              <span>Generate Briefing Report</span>
            </button>
          </div>

          <div className="mt-5">
            <Disclaimer compact />
          </div>

        </Card>

      </div>
    </div>
  );
}
