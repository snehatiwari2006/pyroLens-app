// Mock OSM-style critical infrastructure layers used for exposure/risk analysis.
export const INFRASTRUCTURE = {
  hospitals: [
    { name: "City General Hospital", lat: 19.08, lng: 72.86 },
    { name: "Riverside Community Hospital", lat: 19.11, lng: 72.84 },
  ],
  schools: [
    { name: "Sector 12 Public School", lat: 19.07, lng: 72.89 },
    { name: "Riverside Model School", lat: 19.13, lng: 72.86 },
  ],
  fireStations: [
    { name: "Fire Station 4", lat: 19.08, lng: 72.88 },
    { name: "Fire Station 7", lat: 19.10, lng: 72.85 },
  ],
  residential: [
    { name: "Residential Area C", lat: 19.07, lng: 72.88 },
    { name: "Sector 14 Housing", lat: 19.06, lng: 72.90 },
  ],
  roads: [
    { name: "Highway D", lat: 19.09, lng: 72.87 },
    { name: "Riverside Ring Road", lat: 19.12, lng: 72.86 },
  ],
  railway: [{ name: "Industrial Freight Line", lat: 19.10, lng: 72.90 }],
  counts: {
    industries: 46, hospitals: 12, schools: 28, residential: 64,
    roads: 118, fireStations: 9, railway: 14, criticalInfrastructure: 21,
  },
};
