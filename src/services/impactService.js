// Backend-ready wrapper for potential fire impact / spread direction
// estimation. A temporary local estimate is deliberately labeled as
// provisional so it is never confused with a weather-informed model output.
import { getIncidentById } from "../data/incidents.js";
import { apiFetchOr } from "./api.js";

function numberFrom(value) {
  const match = String(value ?? "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function knownDirection(incident) {
  const direction = incident.windDir || incident.impactDirection;
  return direction && !/^pending/i.test(direction) ? direction : "Weather pending";
}

export function provisionalImpact(incident) {
  const direction = knownDirection(incident);
  const frp = numberFrom(incident.frp) ?? 0;
  const reportedZone = numberFrom(incident.impactZone);
  const reportedConfidence = numberFrom(incident.impactConfidence);
  const weather = {
    wind_direction: direction === "Weather pending" ? "Unavailable" : direction,
    wind_speed_kmh: numberFrom(incident.windSpeed),
    temperature_c: numberFrom(incident.temp),
    humidity_pct: numberFrom(incident.humidity),
    source: "provisional-local-context",
  };

  return {
    event_id: incident.id,
    direction,
    confidence: reportedConfidence && reportedConfidence > 0
      ? reportedConfidence
      : Math.max(15, Math.round((numberFrom(incident.confidence) ?? 50) * 0.55)),
    impact_zone_km2: reportedZone ?? Math.max(0.1, Math.round((frp / 60) * 10) / 10),
    exposed: { weather },
    isFallback: true,
  };
}

export async function estimateImpact(incidentOrId) {
  const incident = typeof incidentOrId === "string"
    ? getIncidentById(incidentOrId)
    : incidentOrId;

  if (!incident?.id) return null;
  return apiFetchOr(`/events/${incident.id}/impact`, () => provisionalImpact(incident));
}
