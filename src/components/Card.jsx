import React from "react";

export default function Card({ children, className = "", padded = true }) {
  return (
    <div className={`rounded-lg border border-line bg-white ${className}`}>
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}
