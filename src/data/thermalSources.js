// Persistent thermal sources — recurring anomalies distinguished from one-off events.
export const THERMAL_SOURCES = [
  { id: "TS-118", name: "Tank Farm 3 Recurrence", location: "Industrial Zone A", persistenceScore: 82, freq: "14 detections / 30 days", duration: "48 hrs cumulative", source: "Likely industrial flare stack", proximity: "0.2 km" },
  { id: "TS-104", name: "Riverside Storage Recurrence", location: "Riverside Industrial Belt", persistenceScore: 91, freq: "38 detections / 30 days", duration: "6.5 days cumulative", source: "Likely chemical storage thermal leak", proximity: "0.05 km" },
  { id: "TS-096", name: "Cement Kiln Cluster", location: "Western Industrial Estate", persistenceScore: 74, freq: "26 detections / 30 days", duration: "9 days cumulative", source: "Known industrial process heat", proximity: "0.0 km" },
];
