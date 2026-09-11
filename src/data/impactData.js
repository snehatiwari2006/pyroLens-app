// Impact zone ring definitions (relative radii in km) used by ImpactAnalysis + map overlay.
export const IMPACT_ZONE_RINGS = [
  { key: "high", radiusKm: 1.0, color: "#B3261E", opacity: 0.16, label: "High impact zone", desc: "Immediate vicinity of the event" },
  { key: "medium", radiusKm: 2.0, color: "#C2600B", opacity: 0.14, label: "Medium impact zone", desc: "Elevated exposure risk" },
  { key: "monitoring", radiusKm: 3.2, color: "#9A7B0A", opacity: 0.12, label: "Monitoring zone", desc: "Requires continued observation" },
];
