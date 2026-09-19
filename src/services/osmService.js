// OpenStreetMap / Overpass geographic data is queried by the backend, which
// applies a bounded live Bhopal incident-area query and reports availability.
import { INFRASTRUCTURE } from "../data/infrastructure.js";
import { apiFetch, apiFetchOr, mockRequest } from "./api.js";

export async function getInfrastructureLayers() {
  return apiFetch("/layers/infrastructure");
}

export async function getNearbyInfrastructure(lat, lng, radiusKm = 3) {
  // Real version: Overpass query around (lat, lng) within radiusKm.
  return mockRequest(INFRASTRUCTURE);
}
