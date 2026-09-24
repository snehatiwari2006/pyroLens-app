import React, { useEffect, useState } from "react";
import { PlayCircle, PauseCircle, ChevronRight, Siren, CheckCircle2, Factory, Building2, Users } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import ExposureChip from "../components/ExposureCard.jsx";
import { RiskScoreDial } from "../components/RiskScoreCard.jsx";

const DEMO_STEPS = [
  "Detect",
  "Classify",
  "Analyze",
  "Estimate Impact",
  "Identify Exposure",
  "Calculate Risk",
  "Decision Support",
  "Warn",
  "Respond",
  "Report",
];

export default function DemoMode() {
  const { incidents, issueWarning } = useApp();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const demo = incidents[0] || {};

  useEffect(() => {
    if (!running) return;
    if (step >= DEMO_STEPS.length - 1) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [running, step]);

  return (
    <div className="demo-orbit space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Hackathon Live Simulator"
        title="Smart India Hackathon Demo Mode"
        desc="Interactive simulation that steps through the complete end-to-end intelligence cycle: from orbital satellite observation to field response dispatch."
        action={
          <button
            onClick={() => {
              if (step >= DEMO_STEPS.length - 1) setStep(0);
              setRunning((r) => !r);
            }}
            className="btn-primary py-2.5 px-5 shadow-sm shadow-orange/20"
          >
            {running ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
            <span>{running ? "Pause Simulation" : step > 0 ? "Resume / Restart" : "Run Demo Sequence"}</span>
          </button>
        }
      />

      {/* 10 Step Progress Sequence */}
      <div className="demo-progress-plane flex flex-wrap gap-2 p-3 rounded-2xl bg-white border border-line shadow-xs">
        {DEMO_STEPS.map((s, idx) => {
          const isDone = idx <= step;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <button
                onClick={() => setStep(idx)}
                className={`text-xs font-bold rounded-xl px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                  isDone
                    ? "bg-gradient-to-r from-orange to-[#EA580C] text-white shadow-xs"
                    : "bg-[#FCFAF6] text-slateink hover:text-ink border border-line"
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{idx + 1}.</span>
                <span>{s}</span>
              </button>
              {idx < DEMO_STEPS.length - 1 && <ChevronRight size={13} className="text-slateink/40" />}
            </div>
          );
        })}
      </div>

      {/* Step Demonstration Card */}
      <Card className="demo-console-plane" accent="orange" hoverLift={false}>
        <div className="text-[11px] font-bold uppercase tracking-wider text-orange mb-3">
          STAGE {step + 1} OF 10: {DEMO_STEPS[step].toUpperCase()}
        </div>

        {step === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Siren size={18} className="text-critical animate-pulse" />
              <span className="font-bold text-base text-ink tracking-tight">New Satellite Thermal Ingestion</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm p-4 rounded-xl border border-line/70 bg-[#FCFAF6]">
              <Field label="Location" value={demo.location} />
              <Field label="Satellite Feed" value={demo.satellite} />
              <Field label="FRP (Intensity)" value={demo.frp} />
              <Field label="Detection Timestamp" value={demo.detectionTime} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-slateink">AI Source Classification</div>
            <div className="text-2xl font-bold mb-3 text-ink">{demo.type}</div>
            <ConfidenceMeter value={demo.confidence} />
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-3 gap-4 text-sm p-4 rounded-xl border border-line/70 bg-[#FCFAF6]">
            <Field label="Fire Intensity" value="HIGH" />
            <Field label="FRP Radiative Power" value={demo.frp} />
            <Field label="Thermal Persistence" value={demo.persistence} />
          </div>
        )}

        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-4 text-sm p-4 rounded-xl border border-line/70 bg-[#FCFAF6]">
            <Field label="Estimated Spread Bearing" value={demo.impactDirection} />
            <Field label="Potential Footprint" value={demo.impactZone} />
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slateink">Asset Exposure Footprint</div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <ExposureChip icon={Factory} value={demo.exposure?.industrial} label="Industrial" />
              <ExposureChip icon={Building2} value={demo.exposure?.buildings} label="Buildings" />
              <ExposureChip icon={Users} value={demo.exposure?.population} label="Population" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slateink">Composite Threat Index</div>
            <RiskScoreDial score={demo.riskScore} />
          </div>
        )}

        {step === 6 && (
          <div className="rounded-xl p-4 text-xs sm:text-sm bg-[#FCFAF6] border border-line text-ink leading-relaxed">
            <strong>Directives Generated:</strong> Initiate multi-agency verification, deploy scout team to {demo.location}, prepare warning notifications for potentially affected sectors.
          </div>
        )}

        {step === 7 && (
          <div>
            <p className="text-sm mb-4 text-ink font-medium leading-relaxed">
              Authority confirms threat score and authorizes emergency warning transmission to local units.
            </p>
            <button onClick={() => issueWarning(demo)} className="btn-primary flex items-center gap-2">
              <Siren size={15} />
              <span>Issue Official Warning</span>
            </button>
          </div>
        )}

        {step === 8 && (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm text-ink font-medium">
            🚨 <strong>Dispatch Confirmed:</strong> Rapid Response Alpha unit notified with optimized route coordinates.
          </div>
        )}

        {step === 9 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>Complete incident audit record generated and ready for disaster management review.</span>
          </div>
        )}
      </Card>
    </div>
  );
}
