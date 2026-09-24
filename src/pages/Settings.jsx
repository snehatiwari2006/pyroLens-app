import React from "react";
import { SlidersHorizontal, Map as MapIcon, Bell, RefreshCw, Gauge, Radio, ChevronRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";

const ITEMS = [
  { t: "Visual Theme", d: "Natural Light (Disaster Management Authority Profile)", icon: SlidersHorizontal, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { t: "Map Basemap Tiles", d: "OpenStreetMap Operational Vector Layer + NASA GIBS", icon: MapIcon, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { t: "Alert Notification Threshold", d: "Critical & High risk events (Threat Index ≥ 60)", icon: Bell, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { t: "Feed Synchronization Interval", d: "Sub-minute automated background polling", icon: RefreshCw, color: "text-teal-600 bg-teal-50 border-teal-200" },
  { t: "Risk Evaluation Model", d: "Vision Transformer + Proximity Matrix (v3.1)", icon: Gauge, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { t: "Authority Dispatch Channels", d: "Command Dashboard + SMS Broadcast + PDF Briefing", icon: Radio, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

export default function Settings() {
  return (
    <div className="settings-atlas space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Console Configuration"
        title="Platform Preferences"
        desc="Operational defaults, sensory threshold profiles, and presentation settings for this command workstation session."
      />

      <div className="grid sm:grid-cols-2 gap-5">
        {ITEMS.map((s, index) => (
          <Card key={s.t} accent={index % 3 === 0 ? "blue" : index % 3 === 1 ? "orange" : "teal"} hoverLift={true} className={index % 2 === 0 ? "bg-gradient-to-br from-white via-[#F5FAFF] to-[#EEF8FF]" : "bg-gradient-to-br from-white via-[#FFFCF8] to-[#FFF3E7]"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${s.color}`}>
                  <s.icon size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink tracking-tight">{s.t}</div>
                  <div className="text-xs text-slateink mt-0.5">{s.d}</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slateink/60" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
