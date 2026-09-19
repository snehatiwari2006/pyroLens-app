// Live Open-Meteo weather is retrieved by the backend for impact assessment.
import { ENVIRONMENTAL_DATA } from "../data/environmentalData.js";
import { apiFetchOr, mockRequest } from "./api.js";

export async function getConditionsForIncident(incidentId) {
  const fallback = { windDir: "Variable", windSpeed: "10 km/h", temp: "30°C", humidity: "40%", terrain: "Mixed", landCover: "Mixed" };
  return apiFetchOr(`/events/${incidentId}/weather`, () => mockRequest(ENVIRONMENTAL_DATA[incidentId] || fallback))
    .then((weather) => weather.wind_direction ? {
      windDir: weather.wind_direction,
      windSpeed: `${weather.wind_speed_kmh} km/h`,
      temp: `${weather.temperature_c}°C`,
      humidity: `${weather.humidity_pct}%`,
      terrain: "Configured provider",
      landCover: "Configured provider",
    } : weather);
}
