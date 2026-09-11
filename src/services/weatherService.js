// Backend-ready wrapper for a weather API (wind, temperature, humidity)
// used by impactService to estimate spread direction.
import { ENVIRONMENTAL_DATA } from "../data/environmentalData.js";
import { mockRequest } from "./api.js";

export async function getConditionsForIncident(incidentId) {
  const fallback = { windDir: "Variable", windSpeed: "10 km/h", temp: "30°C", humidity: "40%", terrain: "Mixed", landCover: "Mixed" };
  return mockRequest(ENVIRONMENTAL_DATA[incidentId] || fallback);
}
