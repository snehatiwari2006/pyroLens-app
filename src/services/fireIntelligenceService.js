// Orchestrates classification + persistence analysis for a thermal event.
// This is the layer that would eventually call an AI/ML inference backend.
import { INCIDENTS } from "../data/incidents.js";
import { THERMAL_SOURCES } from "../data/thermalSources.js";
import { mockRequest } from "./api.js";

export async function classifyEvent(incidentId) {
  const incident = INCIDENTS.find((i) => i.id === incidentId);
  if (!incident) return mockRequest(null);
  return mockRequest({
    classification: incident.type,
    confidence: incident.confidence,
    indicators: [
      `Fire radiative power of ${incident.frp} indicates ${incident.riskScore > 70 ? "sustained high-intensity combustion" : "moderate combustion intensity"}.`,
      `Industrial proximity of ${incident.industrialProximity} increases likelihood of an industrial source.`,
      `${incident.observations} repeated observations since ${incident.firstObserved} suggest ${incident.persistence.toLowerCase()} persistence.`,
    ],
  });
}

export async function getThermalPersistence() {
  return mockRequest(THERMAL_SOURCES);
}

export async function getIncidents() {
  return mockRequest(INCIDENTS);
}
