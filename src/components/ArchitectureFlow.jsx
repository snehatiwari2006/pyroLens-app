import React from "react";
import {
  CloudDownload,
  Database,
  BrainCircuit,
  Flame,
  ShieldCheck,
  Server,
  Monitor,
  Workflow,
} from "lucide-react";

const layers = [
  {
    number: "01",
    label: "Data sources",
    icon: CloudDownload,
    tone: "#2563EB",
    items: ["NASA FIRMS thermal hotspots", "OpenStreetMap context", "Weather and terrain data"],
  },
  {
    number: "02",
    label: "Ingestion & validation",
    icon: Workflow,
    tone: "#0891B2",
    items: ["Scheduled feed ingestion", "Coordinate validation", "Normalized GeoJSON"],
  },
  {
    number: "03",
    label: "Data storage",
    icon: Database,
    tone: "#059669",
    items: ["PostGIS spatial layers", "Object storage for imagery", "Historical observations"],
  },
  {
    number: "04",
    label: "Processing & AI",
    icon: BrainCircuit,
    tone: "#7C3AED",
    items: ["Feature engineering", "Fire spread prediction", "Explainable risk scoring"],
  },
  {
    number: "05",
    label: "Decision services",
    icon: ShieldCheck,
    tone: "#D97706",
    items: ["Impact assessment", "Exposure analysis", "Recommended actions"],
  },
  {
    number: "06",
    label: "API & workers",
    icon: Server,
    tone: "#DC2626",
    items: ["REST and map services", "Background task queues", "Secure access control"],
  },
  {
    number: "07",
    label: "PyroLens workspace",
    icon: Monitor,
    tone: "#C2410C",
    items: ["Map and live alerts", "Analytics and reports", "Response coordination"],
  },
];

export default function ArchitectureFlow() {
  return (
    <section className="mt-12 border-y border-line py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2410C]">Platform architecture</div>
          <h2 className="mt-1 text-2xl font-semibold text-ink">One signal, one operational picture</h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slateink">
          Every observation moves through validation, spatial intelligence and explainable decision support before it reaches the response team.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <div key={layer.number} className="relative min-w-0 rounded-lg border border-line bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.14em]" style={{ color: layer.tone }}>{layer.number}</span>
                <Icon size={19} style={{ color: layer.tone }} />
              </div>
              <div className="text-sm font-semibold leading-snug text-ink">{layer.label}</div>
              <ul className="mt-3 space-y-2 text-[11px] leading-snug text-slateink">
                {layer.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {index < layers.length - 1 && <span className="absolute -right-2 top-1/2 hidden h-px w-2 bg-line xl:block" />}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slateink">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#2563EB]" /> Data flow</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#C2410C]" /> Decision flow</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#059669]" /> Spatial context</span>
        <span className="inline-flex items-center gap-2"><Flame size={13} className="text-[#C2410C]" /> Live fire intelligence</span>
      </div>
    </section>
  );
}
