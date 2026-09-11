import React from "react";

export default function Field({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-slateink">{label}</div>
      <div className="font-medium text-ink">{value}</div>
    </div>
  );
}
