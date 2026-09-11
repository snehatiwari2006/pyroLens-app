import React from "react";
import { Flame, ScanLine, Building2, Factory, Compass } from "lucide-react";

const TOGGLES = [
  ["thermalEvents", "Live thermal events", Flame],
  ["thermal", "Thermal persistence", ScanLine],
  ["infrastructure", "Critical infrastructure", Building2],
  ["industrial", "Industrial risk layer", Factory],
];

export default function MapControls({ layers, onToggle, showImpact, onToggleImpact }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOGGLES.map(([k, l, Icon]) => (
        <button key={k} onClick={() => onToggle(k)}
          className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 border"
          style={{
            borderColor: layers[k] ? "#0F2A43" : "#DFE4E9",
            background: layers[k] ? "#EEF2F6" : "#fff",
            color: layers[k] ? "#0F2A43" : "#5B6B7A",
          }}>
          <Icon size={13} /> {l}
        </button>
      ))}
      <button onClick={onToggleImpact}
        className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 border ml-auto"
        style={{
          borderColor: showImpact ? "#C2600B" : "#DFE4E9",
          background: showImpact ? "#FBEEE0" : "#fff",
          color: showImpact ? "#C2600B" : "#5B6B7A",
        }}>
        <Compass size={13} /> Impact overlay
      </button>
    </div>
  );
}
