import React from "react";

// Subtle, low-opacity backdrop used behind hero/landing sections only.
export default function BackgroundVisual({ variant = "hero" }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 600 300">
      <defs>
        <radialGradient id="hero-grad-1" cx="20%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Concentric geospatial telemetry rings */}
      <circle cx="100" cy="220" r="110" fill="none" stroke="#EA580C" strokeWidth="0.7" strokeDasharray="3 3" />
      <circle cx="100" cy="220" r="70" fill="none" stroke="#EA580C" strokeWidth="0.8" />
      <circle cx="500" cy="60" r="130" fill="none" stroke="#2563EB" strokeWidth="0.7" strokeDasharray="4 4" />
      <circle cx="500" cy="60" r="80" fill="none" stroke="#2563EB" strokeWidth="0.8" />
      
      {/* Topographic elevation waves */}
      <path d="M0,170 Q150,110 300,160 T600,130" stroke="#EA580C" strokeWidth="0.9" fill="none" />
      <path d="M0,195 Q180,140 360,190 T600,165" stroke="#C2410C" strokeWidth="0.6" fill="none" />
      <path d="M0,220 Q210,170 420,210 T600,195" stroke="#D97706" strokeWidth="0.5" fill="none" />
    </svg>
  );
}
