import React from "react";

export default function ConfidenceMeter({ value, label = "Confidence" }) {
  const color = value >= 80 ? "#1E7A4C" : value >= 55 ? "#B45309" : "#B3261E";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 text-slateink font-medium">
        <span>{label}</span>
        <span className="font-bold font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full w-full bg-line/80 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
        />
      </div>
    </div>
  );
}
