import React from "react";

export default function ConfidenceMeter({ value, label = "Confidence" }) {
  const color = value >= 80 ? "#1E7A4C" : value >= 55 ? "#9A7B0A" : "#B3261E";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 text-slateink">
        <span>{label}</span><span className="font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full w-full bg-line">
        <div className="h-2 rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
