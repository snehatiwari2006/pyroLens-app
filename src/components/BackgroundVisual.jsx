import React from "react";

// Subtle, low-opacity backdrop used behind hero/landing sections only.
export default function BackgroundVisual({ variant = "hero" }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.14]" preserveAspectRatio="none" viewBox="0 0 400 200">
      <circle cx="60" cy="150" r="70" fill="none" stroke="#fff" strokeWidth="0.6" />
      <circle cx="320" cy="40" r="90" fill="none" stroke="#fff" strokeWidth="0.6" />
      <path d="M0,120 Q100,80 200,110 T400,90" stroke="#fff" strokeWidth="0.6" fill="none" />
    </svg>
  );
}
