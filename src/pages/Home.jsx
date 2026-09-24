import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Satellite,
  Flame,
  ShieldAlert,
  BrainCircuit,
  ArrowRight,
  Activity,
  Clock,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  TrendingUp,
  Radio,
  FileText,
  Building2,
  Crosshair,
} from "lucide-react";
import Card from "../components/Card.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ArchitectureFlow from "../components/ArchitectureFlow.jsx";
import BackgroundVisual from "../components/BackgroundVisual.jsx";

export default function Home() {
  const navigate = useNavigate();

  const scrollToWorkflow = () => {
    const el = document.getElementById("workflow-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION (2-Column Layout: Punchy Value Prop + Live Geospatial Scanner) */}
      <div className="thermal-atlas hero-3d-scene relative isolate overflow-hidden rounded-[24px] border border-[#1D78D6]/20 p-6 sm:p-9 lg:p-10">
        
        <BackgroundVisual />
        <div className="hero-3d-floor" aria-hidden="true" />
        <div className="hero-3d-orbit" aria-hidden="true" />
        <div className="hero-3d-beacon" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.12fr_.88fr] gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headlines & Actions (7 Cols) */}
          <div className="hero-3d-copy">
            
            {/* Live Feed Status Pill */}
            <div className="hero-3d-status inline-flex items-center gap-2 border-l-2 border-[#008A73] py-1 pl-3 text-xs font-semibold text-ink mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-ink font-semibold">LIVE GEOSPATIAL INTELLIGENCE</span>
              <span className="text-slateink/40">•</span>
              <span className="text-[#EA580C] font-bold">NASA FIRMS CONNECTED</span>
            </div>

            {/* Main Headline (High Contrast & Colorful, 100% Solid Text) */}
            <h1 className="hero-3d-title text-4xl sm:text-5xl lg:text-[48px] font-bold text-ink leading-[1.08] tracking-[-0.04em]">
              Detect Thermal Anomalies. <br />
              <span className="text-[#EA580C]">Predict Industrial Fire Risks.</span> <br />
              Protect Critical Infrastructure.
            </h1>

            {/* Clear Mission Description */}
            <p className="hero-3d-description mt-5 text-base sm:text-lg text-slateink leading-relaxed max-w-xl">
              Transforming raw spaceborne satellite observations into explainable hazard classifications, 
              multi-ring asset exposure footprints, and authority-focused decision directives in under 60 seconds.
            </p>

            {/* Action Buttons */}
            <div className="hero-3d-actions flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => navigate("/map")}
                className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2.5 group"
              >
                <Flame size={17} className="text-white group-hover:scale-110 transition-transform" />
                <span>Launch Fire Intelligence Map</span>
              </button>
              
              <button
                onClick={scrollToWorkflow}
                className="btn-secondary px-5 py-3 text-sm font-semibold flex items-center gap-2"
              >
                <Activity size={16} className="text-[#EA580C]" />
                <span>How PyroLens Works ↓</span>
              </button>
            </div>

            {/* Live Telemetry Highlights Strip */}
            <div className="hero-3d-telemetry grid sm:grid-cols-3 gap-px mt-8 border-y border-[#1D78D6]/15 bg-[#1D78D6]/15 text-xs text-slateink">
              <div className="telemetry-cell flex items-center gap-2 px-3 py-3 font-medium text-ink">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>VIIRS & MODIS Feeds Active</span>
              </div>
              <div className="telemetry-cell flex items-center gap-2 px-3 py-3 text-slateink">
                <Clock size={14} className="text-slateink" />
                <span>Observation Sync: <strong>2 min ago</strong></span>
              </div>
              <div className="telemetry-cell flex items-center gap-2 px-3 py-3 text-slateink">
                <Layers size={14} className="text-slateink" />
                <span>PostGIS Spatial Layers: <strong>Armed</strong></span>
              </div>
            </div>

          </div>

          {/* Right Column: Live Satellite Geospatial Scanner & Incident Telemetry Card (5 Cols) */}
          <div className="scan-deck-3d hero-scan-float relative">
            <div className="scan-deck relative overflow-hidden rounded-[18px] p-5 sm:p-7">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-ink/10">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-ink tracking-wider uppercase font-mono">SECTOR RADAR • CENTRAL AFRICA</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REAL-TIME PASS
                </span>
              </div>

              {/* Animated Interactive Radar Display */}
              <div className="scan-radar relative my-5 flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-[#1D78D6]/20">
                <div className="relative w-64 h-64 rounded-full bg-[#FAF8F5]/85 border border-[#1D78D6]/25 flex items-center justify-center shadow-inner overflow-hidden">
                  
                  {/* Concentric Distance Rings */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-orange-300/60" />
                  <div className="absolute inset-12 rounded-full border border-orange-200/80" />
                  <div className="absolute inset-20 rounded-full border border-line" />
                  
                  {/* Axis Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-line/80" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-line/80" />
                  
                  {/* Rotating Radar Sweep Beam */}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "conic-gradient(from 0deg, rgba(234, 88, 12, 0.25) 0deg, rgba(234, 88, 12, 0) 65deg, transparent 65deg)",
                      animation: "spin 5s linear infinite"
                    }}
                  />

                  {/* Concentric Distance Labels */}
                  <span className="absolute top-1 text-[9px] font-mono text-slateink/70">5 km</span>
                  <span className="absolute top-7 text-[9px] font-mono text-slateink/70">2 km</span>
                  <span className="absolute top-14 text-[9px] font-mono text-orange/90 font-bold">500 m</span>

                  {/* Active Thermal Anomaly Ping (Interactive) */}
                  <div className="absolute top-20 right-16 z-20 group cursor-pointer" onClick={() => navigate("/map")}>
                    <div className="relative flex items-center justify-center">
                      <span className="absolute h-6 w-6 rounded-full bg-rose-500/30 animate-ping" />
                      <span className="h-3.5 w-3.5 rounded-full bg-rose-600 border-2 border-white shadow-md" />
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink text-white text-[10px] py-1 px-2 rounded-md shadow-lg opacity-90 pointer-events-none font-mono">
                        Hotspot #FIRMS-804 • 84 MW
                      </div>
                    </div>
                  </div>

                  {/* Industrial Infrastructure Asset Marker */}
                  <div className="absolute bottom-16 left-16 z-10 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 border border-white shadow-sm" />
                    <span className="absolute -bottom-3.5 text-[8px] font-mono text-blue-800 font-bold whitespace-nowrap">Crude Terminal</span>
                  </div>

                  {/* Secondary Monitoring Anomaly */}
                  <div className="absolute bottom-20 right-24 z-10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-amber-500 border border-white" />
                  </div>

                  {/* Center Radar Origin */}
                  <div className="h-2 w-2 rounded-full bg-ink z-10 shadow-sm" />
                </div>
              </div>

              {/* Telemetry Snapshot Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-ink/10 font-mono">
                <div className="p-2.5 rounded-md bg-[#F8FAFC] border border-[#1D78D6]/10">
                  <div className="text-[10px] text-slateink uppercase">Target Class</div>
                  <div className="font-bold text-ink truncate mt-0.5 text-xs">Gas Flare (94% conf)</div>
                </div>
                <div className="p-2.5 rounded-md bg-orange-50/70 border border-orange-200/60">
                  <div className="text-[10px] text-orange uppercase font-bold">Fire Power (FRP)</div>
                  <div className="font-extrabold text-[#C2410C] mt-0.5 text-xs">84.6 MW • 842 K</div>
                </div>
                <div className="p-2.5 rounded-md bg-[#F8FAFC] border border-[#1D78D6]/10">
                  <div className="text-[10px] text-slateink uppercase">Wind & Spread</div>
                  <div className="font-bold text-ink truncate mt-0.5 text-xs">0.8 m/s NW Vector</div>
                </div>
                <div className="p-2.5 rounded-md bg-rose-50/70 border border-rose-200/60">
                  <div className="text-[10px] text-rose-700 uppercase font-bold">Impact Threat</div>
                  <div className="font-extrabold text-rose-700 mt-0.5 text-xs">HIGH (Score: 78/100)</div>
                </div>
              </div>

              {/* Action Button inside card */}
              <button
                onClick={() => navigate("/map")}
                className="mt-3.5 w-full py-2.5 px-3 rounded-md bg-ink hover:bg-[#1D78D6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Hotspot On Live Map</span>
                <ArrowRight size={13} />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* 2. HOW PYROLENS WORKS: 5-STAGE WORKFLOW (PROMINENTLY FEATURED) */}
      <div id="workflow-section" className="scroll-mt-20">
        <ArchitectureFlow />
      </div>

      {/* 3. PLATFORM TELEMETRY & STAT KPI CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader
            title="Real-Time Incident Intelligence"
            description="Active thermal observations and asset proximity indices across monitored regions."
            category="Telemetry Overview"
          />
          <button
            onClick={() => navigate("/dashboard")}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orangeHover transition-colors"
          >
            <span>View Full Command Center</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            {
              label: "Active Thermal Events",
              val: "27",
              sub: "+4 detected in last 6 hours",
              icon: Flame,
              accent: "orange",
              chip: "bg-orange-50 text-orange border-orange-200",
              pulse: true,
              path: "/map",
            },
            {
              label: "High-Risk Industrial Zones",
              val: "06",
              sub: "Requires immediate mitigation",
              icon: ShieldAlert,
              accent: "critical",
              chip: "bg-rose-50 text-rose-700 border-rose-200",
              pulse: true,
              path: "/exposure",
            },
            {
              label: "Satellite Observations",
              val: "1,248",
              sub: "NASA VIIRS & MODIS (24h)",
              icon: Satellite,
              accent: "blue",
              chip: "bg-blue-50 text-blue-700 border-blue-200",
              pulse: false,
              path: "/satellite",
            },
            {
              label: "AI Classification Accuracy",
              val: "96.8%",
              sub: "Vision ML inference model",
              icon: BrainCircuit,
              accent: "purple",
              chip: "bg-purple-50 text-purple-700 border-purple-200",
              pulse: false,
              path: "/classification",
            },
          ].map((c, index) => (
            <div
              key={c.label}
              onClick={() => navigate(c.path)}
              className={`cursor-pointer ${index === 0 ? "lg:col-span-3" : index === 1 ? "lg:col-span-2" : index === 2 ? "lg:col-span-1" : "lg:col-span-3"}`}
            >
              <Card className={index === 0 ? "bg-[#FFF7EF]" : index === 2 ? "bg-[#F2F8FF]" : index === 3 ? "bg-[#F7F4FF]" : ""} accent={c.accent} hoverLift={true}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-slateink text-xs font-medium uppercase tracking-wider">
                      {c.pulse && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                      <span>{c.label}</span>
                    </div>
                    <div className="text-3xl font-extrabold text-ink mt-2 tracking-tight">{c.val}</div>
                    <div className="text-xs text-slateink mt-1 font-medium">{c.sub}</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${c.chip} shadow-sm`}>
                    <c.icon size={20} strokeWidth={2.2} />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WORKSTATION LAUNCHPAD: DIRECT ACCESS TILES */}
      <div className="pt-2">
        <SectionHeader
          title="Specialized Operational Workstations"
          description="Dedicated modules for deep geospatial analysis, risk evaluation, and emergency authority response."
          category="Platform Modules"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {[
            {
              title: "Geospatial Fire Intelligence Map",
              desc: "Multi-layer satellite radar with real-time VIIRS/MODIS anomalies, industrial risk polygons, and wind vectors.",
              icon: Crosshair,
              badge: "Interactive Map",
              path: "/map",
              color: "text-orange bg-orange-50 border-orange-200",
            },
            {
              title: "AI Anomaly Classifier",
              desc: "Deep vision and multi-spectral ML model distinguishing industrial gas flares from wildfires and solar glints.",
              icon: BrainCircuit,
              badge: "ML Inference",
              path: "/classification",
              color: "text-purple-700 bg-purple-50 border-purple-200",
            },
            {
              title: "Decision Support & SOP Alerts",
              desc: "Physics-based propagation models, multi-ring impact perimeters, and one-click authority warning dispatch.",
              icon: ShieldAlert,
              badge: "Emergency Action",
              path: "/decision-support",
              color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            },
          ].map((w) => (
            <div
              key={w.title}
              onClick={() => navigate(w.path)}
              className="group cursor-pointer rounded-xl border border-line bg-white p-5 shadow-sm hover:shadow-cardHover hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${w.color} shadow-sm`}>
                  <w.icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-line text-slateink">
                  {w.badge}
                </span>
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-orange transition-colors">
                {w.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slateink">
                {w.desc}
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-orange">
                <span>Open Workstation</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
