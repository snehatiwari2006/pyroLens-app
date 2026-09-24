import React from "react";

export default function SectionHeader({ eyebrow, title, desc, action, className = "" }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 mb-6 ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-50 text-orange border border-orange-200/60 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
            <span>{eyebrow}</span>
          </div>
        )}
        <h2 className="text-2xl font-bold text-ink tracking-tight">{title}</h2>
        {desc && <p className="text-sm mt-1.5 text-slateink leading-relaxed">{desc}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
