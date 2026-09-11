import React from "react";

export default function SectionHeader({ eyebrow, title, desc, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        {eyebrow && <div className="text-xs font-semibold tracking-wide mb-1 text-slateink">{eyebrow}</div>}
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        {desc && <p className="text-sm mt-1 max-w-2xl text-slateink">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
