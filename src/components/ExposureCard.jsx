import React from "react";

export default function ExposureChip({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl border border-[#1D78D6]/15 bg-gradient-to-br from-white to-[#F4FAFF] hover:bg-orange-50/40 py-3 px-1.5 text-center transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5">
      <div className="h-7 w-7 rounded-lg bg-orange-50 text-orange border border-orange-200/60 flex items-center justify-center mx-auto mb-1.5">
        <Icon size={14} strokeWidth={2.2} />
      </div>
      <div className="font-extrabold text-sm text-ink tracking-tight tabular-nums">{value}</div>
      <div className="text-[10px] font-medium text-slateink mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
