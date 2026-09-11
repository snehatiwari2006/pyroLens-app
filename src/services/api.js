// Central API client stub. Swap BASE_URL and add auth headers here when a
// real backend is available. Every service in this folder should route
// its network calls through this file so the rest of the app never talks
// to fetch()/axios directly.

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const MOCK_LATENCY_MS = 300;

// Simulates a network round-trip so components can show loading states
// exactly the way they will once a real API is wired in.
export function mockRequest(payload) {
  return new Promise((resolve) => setTimeout(() => resolve(payload), MOCK_LATENCY_MS));
}

// Placeholder for a real fetch wrapper. Not used yet — every *Service.js
// currently returns local mock data via mockRequest().
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}
