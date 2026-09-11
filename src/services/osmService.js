// Backend-ready wrapper for OpenStreetMap / Overpass API geographic data.
// Replace with real Overpass queries (industries, hospitals, schools, roads,
// railway, fire stations) when integrating live GIS data.
import { INFRASTRUCTURE } from "../data/infrastructure.js";
import { mockRequest } from "./api.js";

export async function getInfrastructureLayers() {
  return mockRequest(INFRASTRUCTURE);
}

export async function getNearbyInfrastructure(lat, lng, radiusKm = 3) {
  // Real version: Overpass query around (lat, lng) within radiusKm.
  return mockRequest(INFRASTRUCTURE);
}
