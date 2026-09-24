import React from "react";

const ACCENTS = {
  orange: "from-orange-500 via-amber-500 to-orange-600",
  fire: "from-orange-500 via-amber-500 to-orange-600",
  critical: "from-rose-500 via-red-500 to-rose-600",
  red: "from-rose-500 via-red-500 to-rose-600",
  blue: "from-blue-500 via-sky-500 to-blue-600",
  monitoring: "from-blue-500 via-sky-500 to-blue-600",
  teal: "from-teal-500 via-emerald-500 to-teal-600",
  safe: "from-emerald-500 via-teal-500 to-emerald-600",
  amber: "from-amber-400 via-amber-500 to-orange-400",
  purple: "from-purple-500 via-indigo-500 to-purple-600",
};

export default function Card({ children, className = "", padded = true, accent = null, hoverLift = true }) {
  const accentGradient = accent ? ACCENTS[accent] : null;

  return (
    <div
      className={`card-plane rounded-xl border border-[#1D78D6]/15 bg-gradient-to-br from-white via-white to-[#F5FAFF] relative overflow-hidden shadow-[0_12px_24px_-22px_rgba(19,35,58,0.35)] ${
        hoverLift ? "hover:border-[#1D78D6]/35 hover:shadow-[0_18px_30px_-22px_rgba(19,35,58,0.42)] hover:-translate-y-0.5 transition-all duration-300" : ""
      } ${className}`}
    >
      {accentGradient && (
        <div className={`h-[3px] w-full bg-gradient-to-r ${accentGradient} absolute top-0 left-0 right-0`} />
      )}
      <div className={padded ? "p-5 sm:p-5.5" : ""}>{children}</div>
    </div>
  );
}
