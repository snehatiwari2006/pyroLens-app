// Backend-ready wrapper for potential fire impact / spread direction
// estimation. Replace the internal logic with a real physics/ML model
// (wind, terrain, land cover, fuel load) when available. Output must
// always be framed as an ESTIMATE, never a guaranteed prediction.
import { getIncidentById } from "../data/incidents.js";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";
import { getConditionsForIncident } from "./weatherService.js";
import { mockRequest } from "./api.js";

export async function estimateImpact(incidentId) {
  const incident = getIncidentById(incidentId);
  if (!incident) return mockRequest(null);
  const conditions = await getConditionsForIncident(incidentId);
  return mockRequest({
    direction: incident.impactDirection,
    confidence: incident.impactConfidence,
    horizon: incident.horizon,
    potentialImpactZoneKm2: incident.impactZone,
    conditions,
    zoneRings: IMPACT_ZONE_RINGS,
  });
}
