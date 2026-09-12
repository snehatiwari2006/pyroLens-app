import React from "react";
import { Info, Sparkles } from "lucide-react";

export function Disclaimer({ compact }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border border-line bg-[#FAF7F2] ${compact ? "p-3" : "p-4"}`}>
      <Info size={16} className="mt-0.5 shrink-0 text-slateink" />
      <p className="text-xs leading-relaxed text-slateink">
        AI-generated insights are decision-support recommendations and do not replace authorized
        emergency response decisions. Final decisions remain with authorized personnel.
      </p>
    </div>
  );
}

export function AiTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-info bg-infoBg">
      <Sparkles size={12} /> AI-generated decision support
    </span>
  );
}
