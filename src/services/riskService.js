// Backend-ready wrapper for explainable risk scoring and exposure analysis.
// Replace the scoring function with a real weighted model or ML backend.
import { getIncidentById } from "../data/incidents.js";
import { apiFetchOr, mockRequest } from "./api.js";

export async function getRiskBreakdown(incidentId) {
  const incident = getIncidentById(incidentId);
  if (!incident) return mockRequest(null);
  return apiFetchOr(`/events/${incidentId}/risk`, () => mockRequest({
    score: incident.riskScore,
    level: incident.risk,
    factors: [
      { label: "Fire intensity", value: incident.riskScore > 75 ? "HIGH" : "MODERATE" },
      { label: "Thermal persistence", value: incident.persistenceScore > 70 ? "VERY HIGH" : incident.persistenceScore > 40 ? "HIGH" : "MODERATE" },
      { label: "Industrial exposure", value: incident.exposure.industrial > 2 ? "HIGH" : "MODERATE" },
      { label: "Population exposure", value: incident.exposure.population > 3000 ? "HIGH" : incident.exposure.population > 500 ? "MODERATE" : "LOW" },
      { label: "Critical infrastructure exposure", value: incident.exposure.critical > 1 ? "HIGH" : incident.exposure.critical > 0 ? "MODERATE" : "LOW" },
      { label: "Impact potential", value: incident.impactConfidence > 70 ? "HIGH" : "MODERATE" },
    ],
  }));
}

export async function getExposure(incidentId) {
  const incident = getIncidentById(incidentId);
  if (!incident) return mockRequest(null);
  return apiFetchOr(`/events/${incidentId}/exposure`, () => mockRequest(incident.exposure)).then((result) => result.exposure || result);
}

export async function getRecommendedActions(incidentId) {
  const incident = getIncidentById(incidentId);
  return apiFetchOr(`/events/${incidentId}/risk`, () => mockRequest({ recommended_actions: [
    "Initiate human verification.",
    `Prioritize monitoring of ${incident?.location ?? "the affected zone"}.`,
    "Review nearby industrial infrastructure.",
    "Assess emergency response readiness.",
    "Prepare warning workflow for potentially affected zones.",
  ]})).then((result) => result.recommended_actions || result);
}
