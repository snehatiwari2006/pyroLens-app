import React from "react";
import {
  Satellite,
  Workflow,
  BrainCircuit,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Database,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: "01",
    label: "Data Sources",
    sub: "Detection Feeds",
    icon: Satellite,
    color: "#2563EB",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    summary: "NASA FIRMS (VIIRS 375m & MODIS 1km) thermal anomalies paired with OpenStreetMap infrastructure and weather feeds.",
    points: ["NASA FIRMS VIIRS & MODIS", "OpenStreetMap spatial assets", "Open-Meteo wind & humidity"],
  },
  {
    step: "02",
    label: "Ingestion Pipeline",
    sub: "Normalization",
    icon: Workflow,
    color: "#0D9488",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    badge: "bg-teal-100 text-teal-800",
    summary: "Automated ingestion pipeline validates coordinates, groups nearby thermal clusters, and indexes them into PostGIS geometries.",
    points: ["Sub-minute feed ingestion", "PostGIS spatial validation", "Spatial clustering & deduplication"],
  },
  {
    step: "03",
    label: "AI Processing",
    sub: "Classification",
    icon: BrainCircuit,
    color: "#7C3AED",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    summary: "AI models analyze Fire Radiative Power (FRP), temporal persistence, and land cover to eliminate false alarms and detect industrial hazards.",
    points: ["Industrial vs. biomass detection", "False positive suppression", "Temporal recurrence tracking"],
  },
  {
    step: "04",
    label: "Risk Scoring",
    sub: "Exposure Analysis",
    icon: ShieldAlert,
    color: "#EA580C",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800",
    summary: "Dynamic calculation of threat index (0–100) based on proximity to fuel depots, chemical plants, pipelines, and civil populations.",
    points: ["500m, 2km & 5km impact rings", "Infrastructure proximity matrix", "Explainable 0–100 risk score"],
  },
  {
    step: "05",
    label: "Decision Support",
    sub: "Action & Response",
    icon: ShieldCheck,
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
    summary: "Actionable directives for emergency authorities: evacuation radius recommendations, PDF incident reports, and one-click warning dispatch.",
    points: ["Evacuation perimeter guidance", "One-click warning authorization", "Auditable incident briefings"],
  },
];

export default function ArchitectureFlow() {
  return (
    <section className="flow-atlas relative overflow-hidden mt-14 mb-8 px-6 py-10 sm:px-8 sm:py-12 rounded-[24px] border border-line bg-[#FDFBF7]">
      
      {/* Section Header */}
      <div className="max-w-3xl mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-ink tracking-[-0.04em]">
          How PyroLens Works: From Satellite Signal to Response
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slateink leading-relaxed">
          An automated 5-stage pipeline that transforms raw spaceborne thermal pixels into verified, explainable risk assessments and emergency response directives.
        </p>
      </div>

      {/* 5-Step Workflow Pipeline */}
      <div className="relative pt-4">
        <div className="workflow-track hidden lg:block absolute left-[8%] right-[8%] top-[3.55rem] h-[2px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-2">
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative flex flex-col justify-between rounded-xl border border-transparent bg-white/45 p-4 hover:bg-white hover:border-[#1D78D6]/20 transition-colors duration-200"
              >
                {/* Thin Top Accent */}
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span
                      className="text-[11px] font-bold font-mono text-slateink"
                    >
                      STEP {s.step}
                    </span>
                    <div
                      className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-4 border-[#FDFBF7] ${s.bg} ${s.border} ${s.text}`}
                    >
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                  </div>

                  {/* Stage Title */}
                  <h3 className="text-base font-bold text-ink tracking-tight">{s.label}</h3>
                  <div className="text-[11px] font-semibold text-slateink mb-2">
                    {s.sub}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slateink leading-relaxed mb-4">{s.summary}</p>
                </div>

                {/* Key Bullet Points */}
                <div className="pt-3 border-t border-line/60 space-y-1.5">
                  {s.points.map((pt) => (
                    <div key={pt} className="flex items-start gap-1.5 text-[11px] text-ink font-medium">
                      <CheckCircle2 size={12} className="shrink-0 mt-0.5" style={{ color: s.color }} />
                      <span className="leading-tight">{pt}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Bottom Summary Banner */}
      <div className="mt-8 pt-6 border-t border-line/70 flex flex-wrap items-center justify-between gap-4 text-xs text-slateink">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>Continuous Ingestion</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            <span>AI Risk Scoring</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>Authority Dispatch</span>
          </div>
        </div>
        <div className="font-medium text-slateink">
          Operational Latency: <strong className="text-ink">&lt; 60 seconds</strong> from satellite downlink
        </div>
      </div>

    </section>
  );
}
