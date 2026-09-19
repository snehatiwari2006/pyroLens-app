// Orchestrates classification + persistence analysis for a thermal event.
// This is the layer that would eventually call an AI/ML inference backend.
import { INCIDENTS } from "../data/incidents.js";
import { THERMAL_SOURCES } from "../data/thermalSources.js";
import { apiFetchOr, mockRequest } from "./api.js";

export function normalizeIncident(event) {
  const existing = INCIDENTS.find((incident) => incident.id === event.id);
  const observed = event.observed_at ? new Date(event.observed_at).toLocaleString() : "Recent observation";
  const persistenceScore = event.persistence_score ?? event.persistenceScore ?? 0;
  const riskScore = event.risk_score ?? event.riskScore ?? 0;
  const generated = {
    id: event.id,
    name: event.name,
    location: event.location || "Satellite coordinates",
    lat: event.latitude ?? event.lat,
    lng: event.longitude ?? event.lng,
    type: event.event_type ?? event.type ?? "Unclassified Thermal Event",
    confidence: event.confidence,
    risk: event.risk_level ?? event.risk ?? "LOW",
    riskScore,
    status: event.status ?? "Active",
    detectionTime: observed,
    satellite: event.source ?? "VIIRS",
    frp: `${event.frp_mw ?? 0} MW`,
    brightness: `${event.brightness_kelvin ?? 0} K`,
    persistence: persistenceScore >= 70 ? "High" : persistenceScore >= 35 ? "Medium" : "Low",
    persistenceScore,
    firstObserved: observed,
    lastObserved: observed,
    observations: event.observations ?? 1,
    industrialProximity: "Pending spatial query",
    impactDirection: "Pending weather analysis",
    impactZone: "Pending impact analysis",
    impactConfidence: 0,
    horizon: "Pending analysis",
    exposure: { industrial: 0, buildings: 0, roads: 0, population: 0, critical: 0, environment: "Pending" },
  };
  return { ...existing, ...generated, exposure: event.exposure ?? existing?.exposure ?? generated.exposure };
}

export async function classifyEvent(incidentId) {
  const incident = INCIDENTS.find((i) => i.id === incidentId);
  if (!incident) return null;
  return apiFetchOr(`/events/${incidentId}/classification`, () => mockRequest({
    classification: incident.type,
    confidence: incident.confidence,
    indicators: [
      `Fire radiative power of ${incident.frp} indicates ${incident.riskScore > 70 ? "sustained high-intensity combustion" : "moderate combustion intensity"}.`,
      `Industrial proximity of ${incident.industrialProximity} increases likelihood of an industrial source.`,
      `${incident.observations} repeated observations since ${incident.firstObserved} suggest ${incident.persistence.toLowerCase()} persistence.`,
    ],
  }));
}

export async function getThermalPersistence() {
  return apiFetchOr("/events", () => mockRequest(THERMAL_SOURCES));
}

export async function getIncidents() {
  return apiFetch("/events").then((events) => events.map(normalizeIncident));
}
