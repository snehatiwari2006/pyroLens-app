import React from "react";

export default function ExposureChip({ icon: Icon, value, label }) {
  return (
    <div className="rounded-lg border border-line py-2.5 px-1 text-center">
      <Icon size={15} className="mx-auto mb-1 text-navy" />
      <div className="font-semibold text-sm text-ink">{value}</div>
      <div className="text-[10px] text-slateink">{label}</div>
    </div>
  );
}
