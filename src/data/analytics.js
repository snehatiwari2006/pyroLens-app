export const TIME_SERIES = [
  { d: "Mon", events: 14, industrial: 4 }, { d: "Tue", events: 18, industrial: 6 },
  { d: "Wed", events: 11, industrial: 3 }, { d: "Thu", events: 22, industrial: 8 },
  { d: "Fri", events: 19, industrial: 7 }, { d: "Sat", events: 27, industrial: 12 },
  { d: "Sun", events: 23, industrial: 9 },
];

export const CLASS_DIST = [
  { name: "Industrial Fire", value: 34, color: "#B3261E" },
  { name: "Vegetation Fire", value: 22, color: "#1E7A4C" },
  { name: "Agricultural Burning", value: 18, color: "#9A7B0A" },
  { name: "Persistent Thermal", value: 15, color: "#215C8E" },
  { name: "False Positive", value: 8, color: "#5B6B7A" },
  { name: "Unknown Anomaly", value: 3, color: "#C2600B" },
];

export const RISK_DIST = [
  { name: "Critical", value: 6, color: "#B3261E" }, { name: "High", value: 14, color: "#C2600B" },
  { name: "Medium", value: 21, color: "#9A7B0A" }, { name: "Low", value: 33, color: "#1E7A4C" },
];

export const SEASONAL = [
  { m: "Apr", count: 40 }, { m: "May", count: 58 }, { m: "Jun", count: 71 }, { m: "Jul", count: 49 },
  { m: "Aug", count: 63 }, { m: "Sep", count: 52 },
];

export const HOTSPOT_REGIONS = [
  { name: "Industrial Zone A", count: 41, risk: 87, persistence: "High", trend: "+12%" },
  { name: "Riverside Industrial Belt", count: 33, risk: 74, persistence: "Very High", trend: "+6%" },
  { name: "Southern Refinery Complex", count: 29, risk: 90, persistence: "High", trend: "+18%" },
  { name: "Western Industrial Estate", count: 24, risk: 66, persistence: "High", trend: "-3%" },
  { name: "Port Industrial Corridor", count: 17, risk: 55, persistence: "Moderate", trend: "-8%" },
];

export const KPIS = {
  activeThermalEvents: 27, potentialFireEvents: 12, persistentThermalSources: 8,
  highRiskZones: 6, potentiallyExposedAreas: 19, satelliteObservations: 1248,
};
