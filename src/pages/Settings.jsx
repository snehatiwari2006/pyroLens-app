import React from "react";
import { SlidersHorizontal, Map as MapIcon, Bell, RefreshCw, Gauge, Radio, ChevronRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";

const ITEMS = [
  { t: "Theme", d: "Light (government portal)", icon: SlidersHorizontal },
  { t: "Map style", d: "Standard operational", icon: MapIcon },
  { t: "Alert preferences", d: "Critical & High only", icon: Bell },
  { t: "Refresh frequency", d: "Every 5 minutes", icon: RefreshCw },
  { t: "Risk thresholds", d: "Default government profile", icon: Gauge },
  { t: "Notification preferences", d: "Dashboard + SMS", icon: Radio },
];

export default function Settings() {
  return (
    <div>
      <SectionHeader title="Settings" desc="Platform preferences for this session (frontend only — not persisted)." />
      <div className="grid sm:grid-cols-2 gap-5">
        {ITEMS.map((s) => (
          <Card key={s.t}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[#EEF2F6]"><s.icon size={16} className="text-navy" /></div>
                <div><div className="text-sm font-medium text-ink">{s.t}</div><div className="text-xs text-slateink">{s.d}</div></div>
              </div>
              <ChevronRight size={16} className="text-slateink" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
