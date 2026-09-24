import React from "react";
import { Flame, ScanLine, Building2, Factory, Compass, Satellite } from "lucide-react";

const TOGGLES = [
  ["thermalEvents", "Live Thermal Events", Flame],
  ["thermal", "Thermal Persistence", ScanLine],
  ["infrastructure", "Critical Assets", Building2],
  ["industrial", "Industrial Risk Polygons", Factory],
  ["satellite", "NASA VIIRS TrueColor", Satellite],
];

export default function MapControls({ layers, onToggle, showImpact, onToggleImpact }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-line shadow-2xs">
      {TOGGLES.map(([k, l, Icon]) => {
        const active = layers[k];
        return (
          <button
            key={k}
            onClick={() => onToggle(k)}
            className={`flex items-center gap-1.5 text-xs font-bold rounded-xl px-3 py-2 border transition-all ${
              active
                ? "border-orange bg-orange-50 text-orange shadow-xs ring-1 ring-orange/30 font-extrabold"
                : "border-transparent bg-[#FCFAF6] text-slateink hover:text-ink hover:border-line"
            }`}
          >
            <Icon size={14} className={active ? "text-orange" : "text-slateink"} />
            <span>{l}</span>
          </button>
        );
      })}

      <button
        onClick={onToggleImpact}
        className={`flex items-center gap-1.5 text-xs font-bold rounded-xl px-3 py-2 border ml-auto transition-all ${
          showImpact
            ? "border-orange bg-orange-50 text-orange shadow-xs ring-1 ring-orange/30 font-extrabold"
            : "border-transparent bg-[#FCFAF6] text-slateink hover:text-ink hover:border-line"
        }`}
      >
        <Compass size={14} className={showImpact ? "text-orange" : "text-slateink"} />
        <span>Impact Footprint Overlay</span>
      </button>
    </div>
  );
}
