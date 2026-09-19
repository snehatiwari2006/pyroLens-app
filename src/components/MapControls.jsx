import React from "react";
import { Flame, ScanLine, Building2, Factory, Compass, Satellite } from "lucide-react";

const TOGGLES = [
  ["thermalEvents", "Live thermal events", Flame],
  ["thermal", "Thermal persistence", ScanLine],
  ["infrastructure", "Critical infrastructure", Building2],
  ["industrial", "Industrial risk layer", Factory],
  ["satellite", "NASA VIIRS imagery", Satellite],
];

export default function MapControls({ layers, onToggle, showImpact, onToggleImpact }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOGGLES.map(([k, l, Icon]) => (
        <button key={k} onClick={() => onToggle(k)}
          className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 border"
          style={{
            borderColor: layers[k] ? "#C2410C" : "#E8E4DC",
            background: layers[k] ? "#FFF7ED" : "#fff",
            color: layers[k] ? "#9A3412" : "#5E6573",
          }}>
          <Icon size={13} /> {l}
        </button>
      ))}
      <button onClick={onToggleImpact}
        className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 border ml-auto"
        style={{
          borderColor: showImpact ? "#C2410C" : "#E8E4DC",
          background: showImpact ? "#FFF7ED" : "#fff",
          color: showImpact ? "#9A3412" : "#5E6573",
        }}>
        <Compass size={13} /> Impact overlay
      </button>
    </div>
  );
}
