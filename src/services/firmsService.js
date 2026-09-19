// NASA FIRMS (Fire Information for Resource Management System) calls are
// proxied through the FastAPI backend so the MAP key never reaches the browser.
import { INCIDENTS } from "../data/incidents.js";
import { apiFetch, apiFetchOr, mockRequest } from "./api.js";

export async function refreshFirmsFeed() {
  return apiFetch("/ingestions", {
    method: "POST",
    body: JSON.stringify({ source: "firms" }),
  });
}

export async function getFirmsStatus() {
  return apiFetch("/firms/status");
}

export async function getActiveThermalEvents() {
  // Real version: GET {BASE_URL}/firms/active
  return apiFetchOr("/events?status=Active", () => mockRequest(INCIDENTS.filter((i) => i.status !== "Resolved")));
}

export async function getThermalEventById(id) {
  return apiFetchOr(`/events/${id}`, () => mockRequest(INCIDENTS.find((i) => i.id === id) || null));
}

export async function getSatelliteFeedStatus() {
  return apiFetch("/feeds/status");
}
