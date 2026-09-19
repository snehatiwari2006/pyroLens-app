import React from "react";
import { useNavigate } from "react-router-dom";
import { Satellite, Flame, ShieldAlert, SatelliteDish, BrainCircuit, Compass, ShieldCheck } from "lucide-react";
import Card from "../components/Card.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import BackgroundVisual from "../components/BackgroundVisual.jsx";
import ArchitectureFlow from "../components/ArchitectureFlow.jsx";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line mb-8">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #FFFDF9 0%, #FAF3E8 50%, #F5EBE0 100%)" }} />
        <BackgroundVisual />
        <div className="relative px-6 py-14 sm:px-12 sm:py-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-900 mb-4 rounded-full border border-amber-300/60 bg-amber-50/70 px-3 py-1">
            <Satellite size={13} /> Real-time industrial fire & impact intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink leading-tight">Monitor. Analyze. Assess. Respond.</h1>
          <p className="text-slateink mt-4 text-base sm:text-lg max-w-xl leading-relaxed">
            Transforming satellite thermal observations into actionable emergency intelligence through
            classification, impact estimation, exposure analysis and authority-focused decision support.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={() => navigate("/map")} className="btn-primary px-5 py-2.5">
              View Fire Intelligence Map
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn-secondary px-5 py-2.5">
              Explore Intelligence Dashboard
            </button>
          </div>
          <div className="flex items-center gap-2 mt-8 text-slateink text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" /> System operational · Last sync 2 min ago
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Flame, label: "Active thermal events", value: "27" },
          { icon: ShieldAlert, label: "High-risk zones", value: "06" },
          { icon: Satellite, label: "Satellite observations", value: "1,248" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#F5F1EB]"><s.icon size={18} className="text-ink" /></div>
              <div>
                <div className="text-2xl font-semibold text-ink">{s.value}</div>
                <div className="text-xs text-slateink">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionHeader eyebrow="How it works" title="From raw thermal signal to authority decision"
        desc="PyroLens does not just plot a hotspot — it analyzes what a thermal event could potentially become, and what it could affect." />
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { icon: SatelliteDish, t: "Detect", d: "Satellite thermal observation ingested from FIRMS-style feeds." },
          { icon: BrainCircuit, t: "Classify & analyze", d: "AI source classification with fire intensity and persistence." },
          { icon: Compass, t: "Estimate impact", d: "Estimated spread direction and potential impact zone." },
          { icon: ShieldCheck, t: "Decide & respond", d: "Explainable risk, exposure and decision support for authorities." },
        ].map((s) => (
          <Card key={s.t}>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-3 bg-[#F5F1EB]"><s.icon size={17} className="text-ink" /></div>
            <div className="font-semibold text-sm text-ink">{s.t}</div>
            <p className="text-xs mt-1.5 leading-relaxed text-slateink">{s.d}</p>
          </Card>
        ))}
      </div>

      <ArchitectureFlow />
    </div>
  );
}
