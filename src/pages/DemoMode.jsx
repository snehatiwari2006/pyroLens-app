import React, { useEffect, useState } from "react";
import { PlayCircle, PauseCircle, ChevronRight, Siren, CheckCircle2, Factory, Building2, Users } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import ExposureChip from "../components/ExposureCard.jsx";
import { RiskScoreDial } from "../components/RiskScoreCard.jsx";

const DEMO_STEPS = ["Detect", "Classify", "Analyze", "Estimate impact", "Identify exposure", "Calculate risk", "Decision support", "Warn", "Respond", "Report"];

export default function DemoMode() {
  const { incidents, issueWarning } = useApp();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const demo = incidents[0];

  useEffect(() => {
    if (!running) return;
    if (step >= DEMO_STEPS.length - 1) { setRunning(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [running, step]);

  return (
    <div>
      <SectionHeader title="SIH demo mode" desc="Runs the full detection-to-response workflow on a simulated satellite thermal event."
        action={
          <button onClick={() => { if (step >= DEMO_STEPS.length - 1) setStep(0); setRunning((r) => !r); }} className="btn-primary">
            {running ? <PauseCircle size={16} /> : <PlayCircle size={16} />} {running ? "Pause simulation" : step > 0 ? "Resume / restart" : "Run simulation"}
          </button>
        } />
      <div className="flex flex-wrap gap-2 mb-6">
        {DEMO_STEPS.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div className="text-xs font-medium rounded-full px-3 py-1.5 border"
              style={{ borderColor: idx <= step ? "#0F2A43" : "#DFE4E9", background: idx <= step ? "#0F2A43" : "#fff", color: idx <= step ? "#fff" : "#5B6B7A" }}>
              {idx + 1}. {s}
            </div>
            {idx < DEMO_STEPS.length - 1 && <ChevronRight size={13} className="text-line" />}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2"><Siren size={16} className="text-critical" /><span className="font-semibold text-sm text-ink">New satellite thermal event</span></div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Field label="Location" value={demo.location} />
              <Field label="Satellite" value={demo.satellite} />
              <Field label="FRP" value={demo.frp} />
              <Field label="Detection time" value={demo.detectionTime} />
            </div>
          </div>
        )}
        {step === 1 && (
          <div><div className="text-xs font-semibold mb-2 text-slateink">AI CLASSIFICATION</div>
            <div className="text-xl font-semibold mb-2 text-ink">{demo.type}</div>
            <ConfidenceMeter value={demo.confidence} /></div>
        )}
        {step === 2 && (
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Field label="Fire intensity" value="HIGH" /><Field label="FRP" value={demo.frp} /><Field label="Thermal persistence" value={demo.persistence} />
          </div>
        )}
        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Field label="Estimated impact direction" value={demo.impactDirection} /><Field label="Potential impact zone" value={demo.impactZone} />
          </div>
        )}
        {step === 4 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <ExposureChip icon={Factory} value={demo.exposure.industrial} label="Industrial" />
            <ExposureChip icon={Building2} value={demo.exposure.buildings} label="Buildings" />
            <ExposureChip icon={Users} value={demo.exposure.population} label="Population" />
          </div>
        )}
        {step === 5 && <RiskScoreDial score={demo.riskScore} />}
        {step === 6 && (
          <div className="rounded-lg p-3 text-sm bg-paper text-ink">
            Recommended: initiate human verification, prioritize monitoring, prepare warning workflow.
          </div>
        )}
        {step === 7 && (
          <div>
            <p className="text-sm mb-3 text-ink">Authority reviews the event and issues a warning to potentially affected zones.</p>
            <button onClick={() => issueWarning(demo)} className="btn-primary"><Siren size={15} />Issue warning</button>
          </div>
        )}
        {step === 8 && (
          <div className="text-sm text-ink">Emergency Response page shows Rapid Response Alpha dispatched, with recommended response sequence.</div>
        )}
        {step === 9 && (
          <div className="flex items-center gap-2 text-sm text-safe"><CheckCircle2 size={18} />Incident report generated and ready for briefing.</div>
        )}
      </Card>
    </div>
  );
}
