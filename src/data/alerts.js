import { INCIDENTS } from "./incidents.js";

// Alerts derived from incidents; in a real system this would be its own feed.
export const ALERTS = INCIDENTS.map((i) => ({
  id: i.id,
  event: i.name,
  location: i.location,
  risk: i.risk,
  time: i.detectionTime,
  status: i.status,
  recommendedAction: i.status === "Resolved"
    ? "Archive record"
    : "Monitor and verify before further action",
}));
