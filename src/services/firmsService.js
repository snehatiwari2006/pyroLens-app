// Backend-ready wrapper for NASA FIRMS (Fire Information for Resource
// Management System). Currently returns mock data; replace the body of
// each function with a real FIRMS API call (or a call to your own backend
// that proxies FIRMS) when available.
import { INCIDENTS } from "../data/incidents.js";
import { mockRequest } from "./api.js";

export async function getActiveThermalEvents() {
  // Real version: GET {BASE_URL}/firms/active
  return mockRequest(INCIDENTS.filter((i) => i.status !== "Resolved"));
}

export async function getThermalEventById(id) {
  return mockRequest(INCIDENTS.find((i) => i.id === id) || null);
}

export async function getSatelliteFeedStatus() {
  return mockRequest({
    lastSync: "2 min ago",
    detections24h: 27,
    frpObservations: 412,
    avgConfidence: 81,
    satelliteObservations: 1248,
    recordsProcessed: 9204,
    dataFreshness: "< 5 min",
    sources: [
      { name: "NASA FIRMS — VIIRS", status: "Mock feed active" },
      { name: "NASA FIRMS — MODIS", status: "Mock feed active" },
    ],
  });
}
